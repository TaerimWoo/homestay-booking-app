import { useState } from "react";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PaymentIcon from "@mui/icons-material/Payment";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

function Sidebar({ page, setPage, setCurrentUser, currentUser }) {
  const [collapsed, setCollapsed] = useState(false);

  const drawerWidth = collapsed ? 80 : 250;

  const menuStyle = (menuName) => ({
    backgroundColor: page === menuName ? "#166534" : "transparent",
    borderRadius: "10px",
    mx: 1.5,
    mb: 1,
    minHeight: 48,
    justifyContent: collapsed ? "center" : "flex-start",

    "&:hover": {
      backgroundColor: page === menuName ? "#166534" : "#14532d",
    },
  });

  const iconStyle = {
    color: "white",
    minWidth: collapsed ? 0 : 45,
    justifyContent: "center",
  };

  const MenuButton = ({
    pageName,
    title,
    icon,
  }) => (
    <Tooltip
      title={collapsed ? title : ""}
      placement="right"
      arrow
      enterDelay={500}
    >
      <ListItemButton
        sx={menuStyle(pageName)}
        onClick={() => setPage(pageName)}
      >
        <ListItemIcon sx={iconStyle}>
          {icon}
        </ListItemIcon>

        {!collapsed && (
          <ListItemText primary={title} />
        )}
      </ListItemButton>
    </Tooltip>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          transition: "all 0.3s ease",
          overflowX: "hidden",
          backgroundColor: "#052e16",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent:
              collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && (
            <Typography
              variant="h6"
              fontWeight="bold"
            >
              HOMESTAY SYSTEM
            </Typography>
          )}

          <IconButton
            onClick={() =>
              setCollapsed(!collapsed)
            }
            sx={{ color: "white" }}
          >
            {collapsed ? (
              <KeyboardArrowRightIcon />
            ) : (
              <KeyboardArrowLeftIcon />
            )}
          </IconButton>
        </Box>

        {/* User Card */}
        {!collapsed && (
          <Box
            sx={{
              mx: 1.5,
              mb: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#064e3b",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#16a34a",
                width: 42,
                height: 42,
                fontWeight: "bold",
              }}
            >
              {currentUser?.name
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </Avatar>

            <Box>
              <Typography fontWeight="bold">
                {currentUser?.name || "Admin"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "#86efac",
                  fontWeight: "bold",
                }}
              >
                {currentUser?.role?.toUpperCase() || "USER"}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Menu */}
        <List sx={{ flexGrow: 1 }}>
          <MenuButton
            pageName="dashboard"
            title="Dashboard"
            icon={<DashboardIcon />}
          />

          <MenuButton
            pageName="homestays"
            title="Homestays"
            icon={<HomeWorkIcon />}
          />

          <MenuButton
            pageName="bookings"
            title="Bookings"
            icon={<BookOnlineIcon />}
          />

          <MenuButton
            pageName="payment"
            title="Payments"
            icon={<PaymentIcon />}
          />

          <MenuButton
            pageName="users"
            title="Users"
            icon={<PeopleIcon />}
          />
        </List>

        {/* Logout */}
        <Box sx={{ p: 1.5 }}>
          <Tooltip
            title={collapsed ? "Logout" : ""}
            placement="right"
            arrow
            enterDelay={500}
          >
            <ListItemButton
              onClick={() =>
                setCurrentUser(null)
              }
              sx={{
                backgroundColor: "#ef4444",
                borderRadius: "10px",
                minHeight: 48,
                justifyContent: collapsed
                  ? "center"
                  : "flex-start",

                "&:hover": {
                  backgroundColor: "#dc2626",
                },
              }}
            >
              <ListItemIcon sx={iconStyle}>
                <LogoutIcon />
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: "bold",
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;