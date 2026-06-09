console.log("STARTING SERVER...");

import express from "express";
import cors from "cors";
import http from "http";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { Sequelize, DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DATABASE — PostgreSQL on Render, SQLite locally
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: "./homestay.sqlite",
      logging: false,
    });

// MODELS
const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.STRING,
});

const Homestay = sequelize.define("Homestay", {
  name: DataTypes.STRING,
  location: DataTypes.STRING,
  price: DataTypes.FLOAT,
  description: DataTypes.TEXT,
  image: DataTypes.STRING,
});

const Booking = sequelize.define("Booking", {
  userId: DataTypes.INTEGER,
  customerName: DataTypes.STRING,
  homestayName: DataTypes.STRING,
  checkIn: DataTypes.STRING,
  checkOut: DataTypes.STRING,
  status: DataTypes.STRING,
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
  },
});

// IMAGE UPLOAD — Cloudinary in production, local disk in dev
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadStorage = process.env.CLOUDINARY_CLOUD_NAME
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, "uploads/"),
      filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
    });

const upload = multer({ storage: uploadStorage });

// PUBSUB
const subscribers     = [];
const userSubscribers = [];

function publishBookingChanged(payload) {
  subscribers.forEach((push) => push(payload));
}

function publishUserChanged(payload) {
  userSubscribers.forEach((push) => push(payload));
}

function makeAsyncIterator(subscriberList) {
  const queue = [];
  let resolve;

  const push = (event) => {
    if (resolve) {
      resolve({ value: event, done: false });
      resolve = null;
    } else {
      queue.push(event);
    }
  };

  subscriberList.push(push);

  return {
    async next() {
      if (queue.length > 0) return { value: queue.shift(), done: false };
      return new Promise((res) => { resolve = res; });
    },
    async return() {
      const index = subscriberList.indexOf(push);
      if (index > -1) subscriberList.splice(index, 1);
      return { done: true };
    },
    [Symbol.asyncIterator]() { return this; },
  };
}

const createAsyncIterator     = () => makeAsyncIterator(subscribers);
const createUserAsyncIterator = () => makeAsyncIterator(userSubscribers);

// GRAPHQL
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String
    email: String
    role: String
  }

  type LoginResponse {
    id: ID
    name: String
    email: String
    role: String
  }

  type Homestay {
    id: ID!
    name: String
    location: String
    price: Float
    description: String
    image: String
  }

  type Booking {
    id: ID!
    userId: ID
    customerName: String
    homestayName: String
    checkIn: String
    checkOut: String
    status: String
    paymentStatus: String
  }

  input HomestayInput {
    name: String
    location: String
    price: Float
    description: String
    image: String
  }

  input BookingInput {
    userId: ID
    customerName: String
    homestayName: String
    checkIn: String
    checkOut: String
    status: String
    paymentStatus: String
  }

  type Query {
    homestays: [Homestay]
    bookings: [Booking]
    users: [User]
  }

  type Mutation {
    login(email: String!, password: String!): LoginResponse
    registerUser(name: String!, email: String!, password: String!): User
    updateUser(id: ID!, name: String, password: String, oldPassword: String): User

    createHomestay(input: HomestayInput!): Homestay
    updateHomestay(id: ID!, input: HomestayInput!): Homestay
    deleteHomestay(id: ID!): Boolean

    createBooking(input: BookingInput!): Booking
    updateBooking(id: ID!, input: BookingInput!): Booking
    deleteBooking(id: ID!): Boolean
  }

  type Subscription {
    bookingChanged: Booking
    userChanged: User
  }
`;

const resolvers = {
  Query: {
    homestays: async () => Homestay.findAll(),

    bookings: async () => Booking.findAll(),

    users: async () => User.findAll(),
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Invalid email or password");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid email or password");

      return user;
    },

    updateUser: async (_, { id, name, password, oldPassword }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error("User not found");

      if (name && name !== user.name) {
        const oldName = user.name;
        await Booking.update({ customerName: name }, { where: { userId: id } });
        await Booking.update({ customerName: name }, { where: { customerName: oldName } });
        user.name = name;
      }

      if (password) {
        if (oldPassword) {
          const valid = await bcrypt.compare(oldPassword, user.password);
          if (!valid) throw new Error("Current password is incorrect.");
        }
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();
      publishUserChanged(user);
      return user;
    },

    registerUser: async (_, { name, email, password }) => {
      const existing = await User.findOne({ where: { email } });
      if (existing) throw new Error("Email already registered");

      const hashed = await bcrypt.hash(password, 10);
      return User.create({ name, email, password: hashed, role: "user" });
    },

    createHomestay: async (_, { input }) => Homestay.create(input),

    updateHomestay: async (_, { id, input }) => {
      const homestay = await Homestay.findByPk(id);
      if (!homestay) throw new Error("Homestay not found");
      await homestay.update(input);
      return homestay;
    },

    deleteHomestay: async (_, { id }) => {
      const homestay = await Homestay.findByPk(id);
      if (!homestay) throw new Error("Homestay not found");
      await homestay.destroy();
      return true;
    },

    createBooking: async (_, { input }) => {
      const booking = await Booking.create(input);
      publishBookingChanged(booking);
      return booking;
    },

    updateBooking: async (_, { id, input }) => {
      const booking = await Booking.findByPk(id);
      if (!booking) throw new Error("Booking not found");
      await booking.update(input);
      publishBookingChanged(booking);
      return booking;
    },

    deleteBooking: async (_, { id }) => {
      const booking = await Booking.findByPk(id);
      if (!booking) throw new Error("Booking not found");

      const deletedBooking = {
        id: booking.id,
        customerName: booking.customerName,
        homestayName: booking.homestayName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: "Deleted",
        paymentStatus: booking.paymentStatus,
      };

      await booking.destroy();
      publishBookingChanged(deletedBooking);
      return true;
    },
  },

  Subscription: {
    bookingChanged: { subscribe: () => createAsyncIterator() },
    userChanged:    { subscribe: () => createUserAsyncIterator() },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// SERVER
const app = express();
const httpServer = http.createServer(app);

const corsOptions = { origin: process.env.CLIENT_URL || "*" };
app.use(cors(corsOptions));

// Serve uploaded images for local dev only
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// IMAGE UPLOAD ROUTE
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "homestay-uploads" },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.end(req.file.buffer);
      });
      res.json({ imageUrl: result.secure_url });
    } else {
      const PORT = process.env.PORT || 4000;
      res.json({ imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}` });
    }
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// WEBSOCKET
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });
useServer({ schema }, wsServer);

// APOLLO
const apolloServer = new ApolloServer({ schema });
await apolloServer.start();

app.use("/graphql", cors(corsOptions), express.json(), expressMiddleware(apolloServer));

await sequelize.sync({ alter: true });

// MIGRATE: re-hash any plain-text passwords from before bcrypt was added
const allUsers = await User.findAll();
for (const u of allUsers) {
  if (u.password && !u.password.startsWith("$2")) {
    u.password = await bcrypt.hash(u.password, 10);
    await u.save();
  }
}

// BACKFILL: link old bookings that pre-date the userId column
const orphanBookings = await Booking.findAll({ where: { userId: null } });
for (const booking of orphanBookings) {
  const matchedUser = await User.findOne({ where: { name: booking.customerName } });
  if (matchedUser) {
    booking.userId = matchedUser.id;
    await booking.save();
  }
}

// SEED USERS
const userCount = await User.count();
if (userCount === 0) {
  await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: await bcrypt.hash("123456", 10),
    role: "admin",
  });
  await User.create({
    name: "User",
    email: "user@gmail.com",
    password: await bcrypt.hash("123456", 10),
    role: "user",
  });
}

// SEED HOMESTAYS
const homestayCount = await Homestay.count();
if (homestayCount === 0) {
  await Homestay.create({
    name: "Afiq Homestay KL",
    location: "Kuala Lumpur",
    price: 180,
    description: "Comfortable homestay suitable for family and short stay.",
    image: "",
  });
  await Homestay.create({
    name: "Cyberjaya Family Homestay",
    location: "Cyberjaya",
    price: 220,
    description: "Modern homestay near shops, restaurants, and office area.",
    image: "",
  });
}

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Homestay server running at http://localhost:${PORT}/graphql`);
  console.log(`Upload API running at http://localhost:${PORT}/upload`);
  console.log(`WebSocket running at ws://localhost:${PORT}/graphql`);
});
