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

import { LOGIN_USER } from "../graphql";

function Login({ setCurrentUser, setShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginUser, { loading }] = useMutation(LOGIN_USER);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await loginUser({
        variables: {
          email,
          password,
        },
      });

      setCurrentUser(result.data.login);
    } catch (error) {
      alert("Wrong email or password");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Homestay Login
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Login using account from database.
          </Typography>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>

          <Typography sx={{ mt: 3 }}>
            Admin: admin@gmail.com / 123456
          </Typography>

          <Typography>
            User: user@gmail.com / 123456
          </Typography>

          <Button
            sx={{ mt: 2 }}
            onClick={() => setShowRegister(true)}
          >
            New user? Register here
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;