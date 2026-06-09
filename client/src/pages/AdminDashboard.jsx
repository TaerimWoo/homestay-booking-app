import { useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";

import Sidebar from "../components/Sidebar";
import BookingManagement from "./BookingManagement";

import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Box,
  TextField,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Avatar,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import {
  GET_BOOKINGS,
  UPDATE_BOOKING,
  DELETE_BOOKING,
  BOOKING_CHANGED,
  GET_HOMESTAYS,
  CREATE_HOMESTAY,
  UPDATE_HOMESTAY,
  DELETE_HOMESTAY,
  GET_USERS,
  USER_CHANGED,
} from "../graphql";

const DESC_LIMIT = 80;

function HomestayCard({ homestay, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const desc = homestay.description || "";
  const isLong = desc.length > DESC_LIMIT;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {homestay.image ? (
        <CardMedia
          component="img"
          image={homestay.image}
          alt={homestay.name}
          sx={{ height: 180, flexShrink: 0, objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            height: 180,
            flexShrink: 0,
            backgroundColor: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary" fontSize="0.9rem">
            No Image
          </Typography>
        </Box>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        <Typography variant="h6" fontWeight="bold" noWrap title={homestay.name}>
          {homestay.name}
        </Typography>

        <Typography color="text.secondary" fontSize="0.85rem" noWrap sx={{ mt: 0.3 }}>
          {homestay.location}
        </Typography>

        <Typography sx={{ mt: 1, color: "#16a34a", fontWeight: "bold" }}>
          RM {homestay.price} / night
        </Typography>

        {/* Inline expand/collapse — never eats button space */}
        <Typography fontSize="0.85rem" color="text.secondary" sx={{ mt: 1 }}>
          {expanded || !isLong ? desc : desc.slice(0, DESC_LIMIT)}
          {isLong && (
            <Box
              component="span"
              onClick={() => setExpanded((v) => !v)}
              sx={{
                color: "#16a34a",
                fontWeight: "bold",
                cursor: "pointer",
                ml: 0.3,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {expanded ? " Hide" : "...Detail"}
            </Box>
          )}
        </Typography>

        <Box sx={{ mt: "auto", pt: 1.5, display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            sx={{ backgroundColor: "#166534", "&:hover": { backgroundColor: "#14532d" } }}
            onClick={() => onEdit(homestay)}
          >
            Edit
          </Button>
          <Button variant="contained" size="small" color="error" onClick={() => onDelete(homestay.id)}>
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function AdminDashboard({ currentUser, setCurrentUser, page, setPage }) {
  const emptyHomestayForm = {
    name: "",
    location: "",
    price: "",
    description: "",
    image: "",
  };

  const [homestayForm, setHomestayForm] = useState(emptyHomestayForm);
  const [editingHomestayId, setEditingHomestayId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    data: bookingData,
    loading: bookingLoading,
    refetch: refetchBookings,
  } = useQuery(GET_BOOKINGS);

  const {
    data: homestayData,
    loading: homestayLoading,
    refetch: refetchHomestays,
  } = useQuery(GET_HOMESTAYS);

  const { data: userData, refetch: refetchUsers } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });

  useSubscription(USER_CHANGED, {
    onData: () => {
      refetchUsers();
      refetchBookings(); // booking customerName was also updated on server
    },
  });

  useSubscription(BOOKING_CHANGED, {
    onData: () => {
      refetchBookings();
      setOpenSnackbar(true);
    },
  });

  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  const [createHomestay] = useMutation(CREATE_HOMESTAY);
  const [updateHomestay] = useMutation(UPDATE_HOMESTAY);
  const [deleteHomestay] = useMutation(DELETE_HOMESTAY);

  if (bookingLoading || homestayLoading) {
    return <h2>Loading Admin Dashboard...</h2>;
  }

  const bookings  = bookingData?.bookings   || [];
  const homestays = homestayData?.homestays || [];
  const users     = userData?.users         || [];

  // Always show the user's current name even after they rename
  const resolveCustomerName = (booking) => {
    if (booking.userId) {
      const user = users.find((u) => String(u.id) === String(booking.userId));
      if (user) return user.name;
    }
    return booking.customerName;
  };

  const totalHomestays = homestays.length;
  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  ).length;

  const estimatedRevenue = bookings
    .filter((booking) => booking.status === "Confirmed")
    .reduce((total, booking) => {
      const homestay = homestays.find(
        (home) => home.name === booking.homestayName
      );

      const price = homestay ? homestay.price : 0;

      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const nights = Math.max(
        (checkOut - checkIn) / (1000 * 60 * 60 * 24),
        1
      );

      return total + price * nights;
    }, 0);

  const handleHomestayChange = (e) => {
    const { name, value } = e.target;
    setHomestayForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFileName(file.name);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error("No image URL returned from server");
      }

      setHomestayForm((prev) => ({ ...prev, image: data.imageUrl }));
    } catch (err) {
      alert(`Image upload failed: ${err.message}. Make sure the server is running.`);
      setSelectedFileName("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleHomestaySubmit = async (e) => {
    e.preventDefault();

    const input = {
      name: homestayForm.name,
      location: homestayForm.location,
      price: Number(homestayForm.price),
      description: homestayForm.description,
      image: homestayForm.image,
    };

    if (editingHomestayId) {
      await updateHomestay({
        variables: {
          id: editingHomestayId,
          input,
        },
      });

      setEditingHomestayId(null);
    } else {
      await createHomestay({
        variables: {
          input,
        },
      });
    }

    setHomestayForm(emptyHomestayForm);
    setSelectedFileName("");
    refetchHomestays();
  };

  const handleEditHomestay = (homestay) => {
    setEditingHomestayId(homestay.id);

    setHomestayForm({
      name: homestay.name,
      location: homestay.location,
      price: homestay.price,
      description: homestay.description,
      image: homestay.image || "",
    });

    window.scrollTo({
      top: 120,
      behavior: "smooth",
    });
  };

  const handleDeleteHomestay = async (id) => {
    const confirmDelete = confirm("Delete this homestay?");
    if (!confirmDelete) return;

    await deleteHomestay({
      variables: { id },
    });

    refetchHomestays();
  };

  const updateStatus = async (booking, newStatus) => {
    await updateBooking({
      variables: {
        id: booking.id,
        input: {
          customerName: booking.customerName,
          homestayName: booking.homestayName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: newStatus,
          paymentStatus: booking.paymentStatus || "Pending",
        },
      },
    });

    refetchBookings();
  };

  const handleDeleteBooking = async (id) => {
    const confirmDelete = confirm("Delete this booking?");
    if (!confirmDelete) return;

    await deleteBooking({
      variables: { id },
    });

    refetchBookings();
  };

  const getStatusColor = (status) => {
    if (status === "Confirmed") return "success";
    if (status === "Cancelled") return "error";
    return "warning";
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        page={page}
        setPage={setPage}
        setCurrentUser={setCurrentUser}
        currentUser={currentUser}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f0fdf4",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth={false} sx={{ py: 4, ml: 0 }}>
          {page === "dashboard" && (
            <>
              {/* Welcome Banner */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #14532d 0%, #166534 60%, #16a34a 100%)",
                  borderRadius: 3,
                  p: 3,
                  mb: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "white",
                  boxShadow: 3,
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Welcome back, Admin 👋
                  </Typography>
                  <Typography sx={{ opacity: 0.85, mt: 0.5 }}>
                    Here's what's happening with your homestays today.
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="h6" fontWeight="bold">
                    {new Date().toLocaleDateString("en-MY", { weekday: "long" })}
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    {new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
              </Box>

              {/* Stat Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { label: "Total Homestays", value: totalHomestays, color: "#22c55e", bg: "#f0fdf4", icon: <HomeIcon sx={{ color: "#22c55e" }} /> },
                  { label: "Total Bookings", value: totalBookings, color: "#3b82f6", bg: "#eff6ff", icon: <BookOnlineIcon sx={{ color: "#3b82f6" }} /> },
                  { label: "Pending", value: pendingBookings, color: "#f59e0b", bg: "#fffbeb", icon: <HourglassEmptyIcon sx={{ color: "#f59e0b" }} /> },
                  { label: "Confirmed", value: confirmedBookings, color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleIcon sx={{ color: "#22c55e" }} /> },
                  { label: "Cancelled", value: cancelledBookings, color: "#ef4444", bg: "#fef2f2", icon: <CancelIcon sx={{ color: "#ef4444" }} /> },
                  { label: "Est. Revenue", value: `RM ${estimatedRevenue}`, color: "#15803d", bg: "#f0fdf4", icon: <AttachMoneyIcon sx={{ color: "#15803d" }} /> },
                ].map((stat) => (
                  <Grid item xs={6} md={4} key={stat.label}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: `5px solid ${stat.color}`, backgroundColor: stat.bg }}>
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
                        <Avatar sx={{ backgroundColor: "white", boxShadow: 1, width: 44, height: 44 }}>
                          {stat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color, lineHeight: 1.2 }}>
                            {stat.value}
                          </Typography>
                          <Typography fontSize="0.8rem" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Bottom section: Recent Bookings + Recent Homestays */}
              <Grid container spacing={3}>

                {/* Recent Bookings */}
                <Grid item xs={12} md={7}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent sx={{ pb: "12px !important" }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#14532d", mb: 1.5 }}>
                        Recent Bookings
                      </Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "#f0fdf4" }}>
                              <TableCell sx={{ fontWeight: "bold", color: "#166534" }}>Customer</TableCell>
                              <TableCell sx={{ fontWeight: "bold", color: "#166534" }}>Homestay</TableCell>
                              <TableCell sx={{ fontWeight: "bold", color: "#166534" }}>Check-In</TableCell>
                              <TableCell sx={{ fontWeight: "bold", color: "#166534" }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookings.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                  No bookings yet.
                                </TableCell>
                              </TableRow>
                            ) : (
                              [...bookings].reverse().slice(0, 5).map((b) => (
                                <TableRow key={b.id} hover>
                                  <TableCell sx={{ fontSize: "0.85rem" }}>{resolveCustomerName(b)}</TableCell>
                                  <TableCell sx={{ fontSize: "0.85rem" }}>{b.homestayName}</TableCell>
                                  <TableCell sx={{ fontSize: "0.85rem" }}>{b.checkIn}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={b.status}
                                      size="small"
                                      color={getStatusColor(b.status)}
                                      sx={{ fontSize: "0.75rem" }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Homestays */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent sx={{ pb: "12px !important" }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#14532d", mb: 1.5 }}>
                        Homestay Listings
                      </Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      {homestays.length === 0 ? (
                        <Typography color="text.secondary" fontSize="0.9rem">No homestays added yet.</Typography>
                      ) : (
                        [...homestays].slice(-4).reverse().map((h) => (
                          <Box
                            key={h.id}
                            sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1, borderBottom: "1px solid #f0f0f0" }}
                          >
                            {h.image ? (
                              <Box
                                component="img"
                                src={h.image}
                                alt={h.name}
                                sx={{ width: 48, height: 48, borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <HomeIcon sx={{ color: "#16a34a", fontSize: 22 }} />
                              </Box>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight="bold" fontSize="0.9rem" noWrap>{h.name}</Typography>
                              <Typography fontSize="0.8rem" color="text.secondary" noWrap>{h.location}</Typography>
                            </Box>
                            <Typography fontWeight="bold" fontSize="0.85rem" sx={{ ml: "auto", color: "#16a34a", flexShrink: 0 }}>
                              RM {h.price}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>
            </>
          )}

          {page === "homestays" && (
            <>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Homestay Management
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Create, edit, and delete homestay listings.
              </Typography>

              <Card sx={{ borderRadius: 3, mb: 5 }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                    {editingHomestayId ? "Edit Homestay" : "Add New Homestay"}
                  </Typography>

                  {/* Side-by-side: form (left) + live preview (right) */}
                  <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>

                    {/* LEFT — form */}
                    <Box
                      component="form"
                      onSubmit={handleHomestaySubmit}
                      sx={{ display: "flex", flexDirection: "column", gap: 2, flex: "1 1 340px" }}
                    >
                      <TextField
                        label="Homestay Name"
                        name="name"
                        value={homestayForm.name}
                        onChange={handleHomestayChange}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Location"
                        name="location"
                        value={homestayForm.location}
                        onChange={handleHomestayChange}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Price per Night"
                        name="price"
                        type="number"
                        value={homestayForm.price}
                        onChange={handleHomestayChange}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Description"
                        name="description"
                        value={homestayForm.description}
                        onChange={handleHomestayChange}
                        multiline
                        rows={3}
                        required
                        fullWidth
                      />

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={uploadingImage}
                          startIcon={uploadingImage ? <CircularProgress size={16} /> : null}
                        >
                          {uploadingImage ? "Uploading..." : "Upload Homestay Image"}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </Button>
                        {selectedFileName && !uploadingImage && (
                          <Chip
                            label={selectedFileName}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ maxWidth: 200, fontSize: "0.75rem" }}
                          />
                        )}
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={uploadingImage}
                        sx={{ backgroundColor: "#166534", "&:hover": { backgroundColor: "#14532d" } }}
                      >
                        {uploadingImage
                          ? "Waiting for image upload..."
                          : editingHomestayId
                          ? "Update Homestay"
                          : "Create Homestay"}
                      </Button>

                      {editingHomestayId && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingHomestayId(null);
                            setHomestayForm(emptyHomestayForm);
                            setSelectedFileName("");
                          }}
                        >
                          Cancel Edit
                        </Button>
                      )}
                    </Box>

                    {/* RIGHT — live card preview */}
                    <Box sx={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ color: "#166534", textTransform: "uppercase", letterSpacing: 1 }}
                      >
                        Live Preview
                      </Typography>

                      <Card
                        variant="outlined"
                        sx={{ borderRadius: 3, overflow: "hidden", borderColor: "#86efac" }}
                      >
                        {homestayForm.image ? (
                          <CardMedia
                            component="img"
                            image={homestayForm.image}
                            alt="preview"
                            sx={{ height: 180, objectFit: "cover" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 180,
                              backgroundColor: "#d1fae5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography color="text.secondary" fontSize="0.85rem">
                              Image will appear here
                            </Typography>
                          </Box>
                        )}

                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" noWrap>
                            {homestayForm.name || "Homestay Name"}
                          </Typography>
                          <Typography color="text.secondary" fontSize="0.85rem" noWrap sx={{ mt: 0.3 }}>
                            {homestayForm.location || "Location"}
                          </Typography>
                          <Typography sx={{ mt: 1, color: "#16a34a", fontWeight: "bold" }}>
                            {homestayForm.price ? `RM ${homestayForm.price} / night` : "RM — / night"}
                          </Typography>
                          <Typography
                            fontSize="0.85rem"
                            color="text.secondary"
                            sx={{ mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {homestayForm.description || "Description will appear here..."}
                          </Typography>
                        </CardContent>
                      </Card>

                      <Typography fontSize="0.75rem" color="text.disabled" sx={{ mt: 0.5 }}>
                        This is how your listing will look in the Homestay List.
                      </Typography>
                    </Box>

                  </Box>
                </CardContent>
              </Card>

              <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Homestay List
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                  mb: 5,
                  alignItems: "start",
                }}
              >
                {homestays.map((homestay) => (
                  <HomestayCard
                    key={homestay.id}
                    homestay={homestay}
                    onEdit={handleEditHomestay}
                    onDelete={handleDeleteHomestay}
                  />
                ))}
              </Box>
            </>
          )}

          {page === "bookings" && (
            <BookingManagement
              bookings={bookings}
              updateStatus={updateStatus}
              handleDeleteBooking={handleDeleteBooking}
              getStatusColor={getStatusColor}
              resolveCustomerName={resolveCustomerName}
            />
          )}
        </Container>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="info"
          variant="filled"
        >
          Booking updated in real time
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;