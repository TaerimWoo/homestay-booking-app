import { gql } from "@apollo/client";

export const GET_HOMESTAYS = gql`
  query {
    homestays {
      id
      name
      location
      price
      description
      image
    }
  }
`;

export const GET_BOOKINGS = gql`
  query {
    bookings {
      id
      userId
      customerName
      homestayName
      checkIn
      checkOut
      status
      paymentStatus
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      id
      userId
      customerName
      homestayName
      checkIn
      checkOut
      status
      paymentStatus
    }
  }
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking($id: ID!, $input: BookingInput!) {
    updateBooking(id: $id, input: $input) {
      id
      customerName
      homestayName
      checkIn
      checkOut
      status
      paymentStatus
    }
  }
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
  }
`;

export const BOOKING_CHANGED = gql`
  subscription {
    bookingChanged {
      id
      customerName
      homestayName
      checkIn
      checkOut
      status
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
      role
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $name: String!
    $email: String!
    $password: String!
  ) {
    registerUser(
      name: $name
      email: $email
      password: $password
    ) {
      id
      name
      email
      role
    }
  }
`;

export const CREATE_HOMESTAY = gql`
  mutation CreateHomestay($input: HomestayInput!) {
    createHomestay(input: $input) {
      id
      name
      location
      price
      description
      image
    }
  }
`;

export const UPDATE_HOMESTAY = gql`
  mutation UpdateHomestay($id: ID!, $input: HomestayInput!) {
    updateHomestay(id: $id, input: $input) {
      id
      name
      location
      price
      description
      image
    }
  }
`;

export const DELETE_HOMESTAY = gql`
  mutation DeleteHomestay($id: ID!) {
    deleteHomestay(id: $id)
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $password: String, $oldPassword: String) {
    updateUser(id: $id, name: $name, password: $password, oldPassword: $oldPassword) {
      id
      name
      email
      role
    }
  }
`;

export const GET_USERS = gql`
  query {
    users {
      id
      name
      email
      role
    }
  }
`;

export const USER_CHANGED = gql`
  subscription {
    userChanged {
      id
      name
      email
      role
    }
  }
`;