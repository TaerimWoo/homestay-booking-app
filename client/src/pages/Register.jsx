import { useState } from "react";
import { useMutation } from "@apollo/client/react";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

import { REGISTER_USER } from "../graphql";

function Register({ setShowRegister }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Password and confirm password do not match");
      return;
    }

    try {
      await registerUser({
        variables: {
          name: form.name,
          email: form.email,
          password: form.password,
        },
      });

      alert("Register successful. You can login now.");
      setShowRegister(false);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Register User
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create a new user account.
          </Typography>

          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            <Button onClick={() => setShowRegister(false)}>
              Already have account? Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Register;