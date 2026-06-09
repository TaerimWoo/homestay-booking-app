import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";

function Navbar({
  currentUser,
  setCurrentUser,
  setPage,
}) {
  return (
    <AppBar position="static">
      <Toolbar>

        {/* Left Logo */}
        <Typography
          variant="h6"
          fontWeight="bold"
        >
          Homestay Booking System
        </Typography>

        {/* Center Menu */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {currentUser?.role === "admin" && (
            <>
              <Button
                color="inherit"
                onClick={() => setPage("dashboard")}
              >
                Dashboard
              </Button>

              <Button
                color="inherit"
                onClick={() => setPage("payment")}
              >
                Payments
              </Button>
            </>
          )}
        </Box>

        {/* Right User Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography>
            {currentUser?.name} ({currentUser?.role})
          </Typography>

          <Button
            color="inherit"
            onClick={() => setCurrentUser(null)}
          >
            Logout
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;