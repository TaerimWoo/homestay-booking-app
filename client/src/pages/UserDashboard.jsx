import { useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  Button,
  Chip,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import {
  GET_HOMESTAYS,
  GET_BOOKINGS,
  CREATE_BOOKING,
  UPDATE_BOOKING,
  DELETE_BOOKING,
  BOOKING_CHANGED,
  UPDATE_USER,
} from "../graphql";

const DESC_LIMIT = 80;

// ── Collapsible user sidebar ──────────────────────────────────────────────────
function UserSidebar({ page, setPage, setCurrentUser, currentUser, onProfileSaved }) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  // "menu" | "name" | "password"
  const [profileStep, setProfileStep] = useState("menu");
  const [nameVal, setNameVal] = useState(currentUser?.name || "");
  const [nameError, setNameError] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPassError, setOldPassError] = useState("");
  const [newPassError, setNewPassError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [updateUser] = useMutation(UPDATE_USER);
  const drawerWidth = collapsed ? 80 : 250;

  const resetDialog = () => {
    setProfileStep("menu");
    setNameVal(currentUser?.name || "");
    setNameError("");
    setOldPass(""); setNewPass(""); setConfirmPass("");
    setOldPassError(""); setNewPassError(""); setConfirmError("");
  };

  const closeDialog = () => { setProfileOpen(false); resetDialog(); };

  const handleSaveName = async () => {
    if (!nameVal.trim()) { setNameError("Name cannot be empty."); return; }
    const { data } = await updateUser({ variables: { id: currentUser.id, name: nameVal.trim() } });
    onProfileSaved(data.updateUser);
    closeDialog();
  };

  const handleSavePassword = async () => {
    let hasError = false;

    if (!oldPass) {
      setOldPassError("Current password is required.");
      hasError = true;
    } else {
      setOldPassError("");
    }

    if (newPass.length < 6) {
      setNewPassError("Must be at least 6 characters.");
      hasError = true;
    } else {
      setNewPassError("");
    }

    if (newPass !== confirmPass) {
      setConfirmError("Passwords do not match.");
      hasError = true;
    } else {
      setConfirmError("");
    }

    if (hasError) return;

    try {
      await updateUser({
        variables: { id: currentUser.id, password: newPass, oldPassword: oldPass },
      });
      closeDialog();
    } catch (err) {
      setOldPassError(err.message || "Current password is incorrect.");
    }
  };

  const itemSx = (name) => ({
    backgroundColor: page === name ? "#2563eb" : "transparent",
    borderRadius: "10px",
    mx: 1.5,
    mb: 1,
    minHeight: 48,
    justifyContent: collapsed ? "center" : "flex-start",
    "&:hover": { backgroundColor: page === name ? "#2563eb" : "#1e3a5f" },
  });

  const iconSx = { color: "white", minWidth: collapsed ? 0 : 45, justifyContent: "center" };

  const NavBtn = ({ name, label, icon }) => (
    <Tooltip title={collapsed ? label : ""} placement="right" arrow enterDelay={500}>
      <ListItemButton sx={itemSx(name)} onClick={() => setPage(name)}>
        <ListItemIcon sx={iconSx}>{icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={label} />}
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
          backgroundColor: "#0f1f3d",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && <Typography variant="h6" fontWeight="bold">HOMESTAY SYSTEM</Typography>}
          <IconButton onClick={() => setCollapsed((v) => !v)} sx={{ color: "white" }}>
            {collapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
          </IconButton>
        </Box>

        {/* User card — click to edit profile */}
        {!collapsed && (
          <Box
            onClick={() => setProfileOpen(true)}
            sx={{
              mx: 1.5, mb: 2, p: 2, borderRadius: 2, backgroundColor: "#1e3a5f",
              display: "flex", alignItems: "center", gap: 1.5,
              cursor: "pointer", transition: "background 0.2s",
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            <Avatar sx={{ bgcolor: "#3b82f6", width: 42, height: 42, fontWeight: "bold" }}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography fontWeight="bold" noWrap>{currentUser?.name}</Typography>
              <Typography sx={{ fontSize: 12, color: "#bfdbfe", fontWeight: "bold" }}>
                {currentUser?.role?.toUpperCase()}
              </Typography>
            </Box>
            <EditIcon sx={{ color: "#bfdbfe", fontSize: 16, flexShrink: 0 }} />
          </Box>
        )}

        {/* Profile dialog — multi-step */}
        <Dialog open={profileOpen} onClose={closeDialog} maxWidth="xs" fullWidth>

          {/* ── STEP: menu ── */}
          {profileStep === "menu" && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#3b82f6", width: 52, height: 52, fontSize: "1.3rem", fontWeight: "bold" }}>
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold" fontSize="1.1rem">{currentUser?.name}</Typography>
                    <Typography fontSize="0.8rem" color="text.secondary">{currentUser?.email}</Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <Divider />
              <DialogContent sx={{ p: 0 }}>
                <List disablePadding>
                  <ListItemButton onClick={() => { setNameVal(currentUser?.name || ""); setProfileStep("name"); }}
                    sx={{ px: 3, py: 1.8, "&:hover": { backgroundColor: "#eff6ff" } }}>
                    <ListItemIcon><EditIcon sx={{ color: "#2563eb" }} /></ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight="bold">Edit Name</Typography>}
                      secondary="Change your display name"
                    />
                  </ListItemButton>
                  <Divider />
                  <ListItemButton onClick={() => setProfileStep("password")}
                    sx={{ px: 3, py: 1.8, "&:hover": { backgroundColor: "#eff6ff" } }}>
                    <ListItemIcon><VisibilityOffIcon sx={{ color: "#2563eb" }} /></ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight="bold">Change Password</Typography>}
                      secondary="Update your account password"
                    />
                  </ListItemButton>
                </List>
              </DialogContent>
              <Divider />
              <DialogActions sx={{ px: 3, py: 1.5 }}>
                <Button onClick={closeDialog}>Close</Button>
              </DialogActions>
            </>
          )}

          {/* ── STEP: edit name ── */}
          {profileStep === "name" && (
            <>
              <DialogTitle sx={{ fontWeight: "bold", color: "#1d4ed8" }}>Edit Name</DialogTitle>
              <DialogContent>
                <TextField
                  label="Display Name"
                  value={nameVal}
                  onChange={(e) => { setNameVal(e.target.value); setNameError(""); }}
                  fullWidth
                  error={!!nameError}
                  helperText={nameError}
                  sx={{ mt: 1 }}
                  autoFocus
                />
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setProfileStep("menu")}>Back</Button>
                <Button variant="contained" onClick={handleSaveName}
                  sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                  Save Name
                </Button>
              </DialogActions>
            </>
          )}

          {/* ── STEP: change password ── */}
          {profileStep === "password" && (
            <>
              <DialogTitle sx={{ fontWeight: "bold", color: "#1d4ed8" }}>Change Password</DialogTitle>
              <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                  <TextField
                    label="Current Password"
                    type={showOld ? "text" : "password"}
                    value={oldPass}
                    onChange={(e) => { setOldPass(e.target.value); setOldPassError(""); }}
                    fullWidth
                    autoFocus
                    error={!!oldPassError}
                    helperText={oldPassError}
                    InputProps={{ endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowOld((v) => !v)} edge="end">
                          {showOld ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )}}
                  />
                  <TextField
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => { setNewPass(e.target.value); setNewPassError(""); }}
                    fullWidth
                    error={!!newPassError}
                    helperText={newPassError}
                    InputProps={{ endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew((v) => !v)} edge="end">
                          {showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )}}
                  />
                  <TextField
                    label="Confirm New Password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPass}
                    onChange={(e) => { setConfirmPass(e.target.value); setConfirmError(""); }}
                    fullWidth
                    error={!!confirmError}
                    helperText={confirmError}
                    InputProps={{ endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                          {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )}}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setProfileStep("menu")}>Back</Button>
                <Button variant="contained" onClick={handleSavePassword}
                  sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                  Update Password
                </Button>
              </DialogActions>
            </>
          )}

        </Dialog>

        {/* Menu */}
        <List sx={{ flexGrow: 1 }}>
          <NavBtn name="dashboard"  label="Dashboard"   icon={<DashboardIcon />} />
          <NavBtn name="homestays"  label="Homestays"   icon={<HomeWorkIcon />} />
          <NavBtn name="bookings"   label="My Bookings" icon={<BookOnlineIcon />} />
          <NavBtn name="payment"    label="Payment"     icon={<PaymentIcon />} />
        </List>

        {/* Logout */}
        <Box sx={{ p: 1.5 }}>
          <Tooltip title={collapsed ? "Logout" : ""} placement="right" arrow enterDelay={500}>
            <ListItemButton
              onClick={() => setCurrentUser(null)}
              sx={{
                backgroundColor: "#ef4444",
                borderRadius: "10px",
                minHeight: 48,
                justifyContent: collapsed ? "center" : "flex-start",
                "&:hover": { backgroundColor: "#dc2626" },
              }}
            >
              <ListItemIcon sx={iconSx}><LogoutIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: "bold" }} />}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}

// ── Homestay card with expand description + Maps link ────────────────────────
function HomestayCard({ home, onBook }) {
  const [expanded, setExpanded] = useState(false);
  const desc = home.description || "";
  const isLong = desc.length > DESC_LIMIT;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(home.location)}`;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, display: "flex", flexDirection: "column", height: "100%" }}>
      {home.image ? (
        <CardMedia component="img" image={home.image} alt={home.name} sx={{ height: 200, objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <Box sx={{ height: 200, flexShrink: 0, backgroundColor: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HomeWorkIcon sx={{ fontSize: 48, color: "#3b82f6", opacity: 0.5 }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="h6" fontWeight="bold" noWrap>{home.name}</Typography>

        {/* Clickable location → Google Maps */}
        <Box
          component="a"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            mt: 0.5,
            color: "#2563eb",
            textDecoration: "none",
            fontSize: "0.85rem",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <LocationOnIcon sx={{ fontSize: 16 }} />
          {home.location}
        </Box>

        <Typography sx={{ mt: 1, color: "#1d4ed8", fontWeight: "bold" }}>
          RM {home.price} / night
        </Typography>

        <Typography fontSize="0.85rem" color="text.secondary" sx={{ mt: 1 }}>
          {expanded || !isLong ? desc : desc.slice(0, DESC_LIMIT)}
          {isLong && (
            <Box
              component="span"
              onClick={() => setExpanded((v) => !v)}
              sx={{ color: "#2563eb", fontWeight: "bold", cursor: "pointer", ml: 0.3, "&:hover": { textDecoration: "underline" } }}
            >
              {expanded ? " Hide" : "...Detail"}
            </Box>
          )}
        </Typography>

        <Button
          variant="contained"
          size="small"
          sx={{ mt: "auto", pt: 1.5, backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}
          onClick={() => onBook(home.name)}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function UserDashboard({ currentUser, setCurrentUser }) {
  const [page, setPage] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = { customerName: currentUser.name, homestayName: "", checkIn: "", checkOut: "", status: "Pending" };
  const [form, setForm] = useState(emptyForm);

  const { data: homestayData, loading: homestayLoading } = useQuery(GET_HOMESTAYS);
  const { data: bookingData, loading: bookingLoading, refetch } = useQuery(GET_BOOKINGS);

  const [bookingAlert, setBookingAlert] = useState(false);

  useSubscription(BOOKING_CHANGED, {
    onData: () => {
      refetch();
      setBookingAlert(true);
    },
  });

  const [createBooking] = useMutation(CREATE_BOOKING);
  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  // Payment dialog state
  const [payDialogOpen, setPayDialogOpen]   = useState(false);
  const [receiptOpen,   setReceiptOpen]     = useState(false);
  const [activeBooking, setActiveBooking]   = useState(null);
  const [cardHolder,    setCardHolder]      = useState("");
  const [cardNum,       setCardNum]         = useState("");
  const [cardExpiry,    setCardExpiry]      = useState("");
  const [cardCvv,       setCardCvv]         = useState("");
  const [receiptPaidAt, setReceiptPaidAt]   = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateBooking({ variables: { id: editingId, input: form } });
      setEditingId(null);
    } else {
      await createBooking({
        variables: {
          input: {
            userId: currentUser.id,
            customerName: currentUser.name,
            homestayName: form.homestayName,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            status: "Pending",
            paymentStatus: "Pending",
          },
        },
      });
    }
    setForm(emptyForm);
    refetch();
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setForm({ customerName: booking.customerName, homestayName: booking.homestayName, checkIn: booking.checkIn, checkOut: booking.checkOut, status: booking.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this booking?")) return;
    await deleteBooking({ variables: { id } });
    refetch();
  };

  // Navigate to bookings page and pre-fill homestay
  const handleBookNow = (homestayName) => {
    setForm((prev) => ({ ...prev, homestayName }));
    setPage("bookings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Payment helpers ──────────────────────────────────────────────────────────
  const getHomestayPrice = (name) => homestays.find((h) => h.name === name)?.price || 0;
  const getNights = (ci, co) => Math.max(1, Math.round((new Date(co) - new Date(ci)) / 86400000));
  const getTotalAmount = (b) => getNights(b.checkIn, b.checkOut) * getHomestayPrice(b.homestayName);

  const openPayDialog = (booking) => {
    setActiveBooking(booking);
    setCardHolder(currentUser.name);
    setCardNum(""); setCardExpiry(""); setCardCvv("");
    setPayDialogOpen(true);
  };

  const openReceipt = (booking, paidAt = "Previously paid") => {
    setActiveBooking(booking);
    setReceiptPaidAt(paidAt);
    setReceiptOpen(true);
  };

  const handleConfirmPayment = async () => {
    await updateBooking({ variables: { id: activeBooking.id, input: { paymentStatus: "Paid" } } });
    const now = new Date().toLocaleString("en-MY", { dateStyle: "long", timeStyle: "short" });
    setReceiptPaidAt(now);
    setPayDialogOpen(false);
    setReceiptOpen(true);
    refetch();
  };

  const handlePrintReceipt = () => {
    if (!activeBooking) return;
    const nights  = getNights(activeBooking.checkIn, activeBooking.checkOut);
    const price   = getHomestayPrice(activeBooking.homestayName);
    const total   = (nights * price).toFixed(2);
    const rcptNo  = `RCPT-${String(activeBooking.id).padStart(4, "0")}-${Math.floor(Math.abs(Math.sin(Number(activeBooking.id)) * 90000)).toString().padStart(5, "0")}`;

    const w = window.open("", "_blank", "width=720,height=900");
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt ${rcptNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; padding: 48px; color: #1a1a1a; background: #fff; }
  .logo { font-size: 26px; font-weight: bold; color: #2563eb; text-align: center; margin-bottom: 4px; }
  .subtitle { text-align: center; color: #888; font-size: 13px; margin-bottom: 28px; }
  .badge-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 15px; }
  .label { color: #666; }
  .value { font-weight: bold; color: #1a1a1a; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
  .total-box { background: #2563eb; color: white; border-radius: 10px; padding: 18px 20px; display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-top: 20px; }
  .paid-stamp { text-align: center; margin: 28px 0 20px; }
  .paid-stamp span { border: 4px solid #22c55e; color: #22c55e; font-size: 22px; font-weight: bold; letter-spacing: 6px; padding: 8px 36px; border-radius: 8px; display: inline-block; transform: rotate(-5deg); }
  .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
  .print-btn { display: block; margin: 24px auto 0; padding: 12px 40px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style></head><body>
<div class="logo">&#127968; HOMESTAY SYSTEM</div>
<div class="subtitle">Official Payment Receipt</div>

<div class="badge-box">
  <div class="row"><span class="label">Receipt No.</span><span class="value">${rcptNo}</span></div>
  <div class="row"><span class="label">Date Paid</span><span class="value">${receiptPaidAt}</span></div>
</div>

<div class="row"><span class="label">Customer Name</span><span class="value">${currentUser.name}</span></div>
<div class="row"><span class="label">Email</span><span class="value">${currentUser.email}</span></div>
<hr/>
<div class="row"><span class="label">Homestay</span><span class="value">${activeBooking.homestayName}</span></div>
<div class="row"><span class="label">Check-In</span><span class="value">${activeBooking.checkIn}</span></div>
<div class="row"><span class="label">Check-Out</span><span class="value">${activeBooking.checkOut}</span></div>
<div class="row"><span class="label">Duration</span><span class="value">${nights} night${nights > 1 ? "s" : ""}</span></div>
<div class="row"><span class="label">Rate per Night</span><span class="value">RM ${price}</span></div>
<hr/>
<div class="total-box"><span>TOTAL PAID</span><span>RM ${total}</span></div>

<div class="paid-stamp"><span>&#10003; PAID</span></div>

<div class="footer">
  <p>Thank you for choosing Homestay System!</p>
  <p>This is a computer-generated receipt. No signature required.</p>
</div>

<button class="print-btn" onclick="window.print()">&#128424; Print Receipt</button>
</body></html>`);
    w.document.close();
  };

  if (homestayLoading || bookingLoading) return <h2>Loading...</h2>;

  const homestays = homestayData?.homestays || [];
  const myBookings = (bookingData?.bookings || []).filter((b) => String(b.userId) === String(currentUser.id));

  const confirmed  = myBookings.filter((b) => b.status === "Confirmed").length;
  const pending    = myBookings.filter((b) => b.status === "Pending").length;
  const cancelled  = myBookings.filter((b) => b.status === "Cancelled").length;

  const statusChip = (status) => {
    const map = { Confirmed: "success", Cancelled: "error", Pending: "warning" };
    return <Chip label={status} color={map[status] || "default"} size="small" />;
  };

  const headerCell = { color: "white", fontWeight: "bold", py: 1.3, px: 2 };
  const bodyCell   = { py: 1, px: 2 };

  return (
    <Box sx={{ display: "flex" }}>
      <UserSidebar
        page={page}
        setPage={setPage}
        setCurrentUser={setCurrentUser}
        currentUser={currentUser}
        onProfileSaved={(updated) => setCurrentUser(updated)}
      />

      <Box component="main" sx={{ flexGrow: 1, backgroundColor: "#eff6ff", minHeight: "100vh" }}>
        <Container maxWidth={false} sx={{ py: 4, px: 3 }}>

          {/* ── DASHBOARD ── */}
          {page === "dashboard" && (
            <>
              {/* Welcome banner */}
              <Box sx={{ background: "linear-gradient(135deg, #0f1f3d 0%, #2563eb 60%, #60a5fa 100%)", borderRadius: 3, p: 3, mb: 4, color: "white", boxShadow: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">Welcome, {currentUser.name} 👋</Typography>
                  <Typography sx={{ opacity: 0.85, mt: 0.5 }}>Here's a summary of your bookings.</Typography>
                </Box>
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="h6" fontWeight="bold">{new Date().toLocaleDateString("en-MY", { weekday: "long" })}</Typography>
                  <Typography sx={{ opacity: 0.85 }}>{new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</Typography>
                </Box>
              </Box>

              {/* Stat cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { label: "Total Bookings",    value: myBookings.length, color: "#3b82f6", bg: "#eff6ff", icon: <CalendarMonthIcon sx={{ color: "#3b82f6" }} /> },
                  { label: "Confirmed",         value: confirmed,         color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleIcon   sx={{ color: "#22c55e" }} /> },
                  { label: "Pending",           value: pending,           color: "#f59e0b", bg: "#fffbeb", icon: <HourglassEmptyIcon sx={{ color: "#f59e0b" }} /> },
                  { label: "Cancelled",         value: cancelled,         color: "#ef4444", bg: "#fef2f2", icon: <CancelIcon        sx={{ color: "#ef4444" }} /> },
                ].map((s) => (
                  <Grid item xs={6} md={3} key={s.label}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: `5px solid ${s.color}`, backgroundColor: s.bg }}>
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
                        <Avatar sx={{ backgroundColor: "white", boxShadow: 1, width: 44, height: 44 }}>{s.icon}</Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight="bold" sx={{ color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                          <Typography fontSize="0.8rem" color="text.secondary">{s.label}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Recent bookings + featured homestays */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e3a5f", mb: 1.5 }}>My Recent Bookings</Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "#eff6ff" }}>
                              <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>Homestay</TableCell>
                              <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>Check-In</TableCell>
                              <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>Check-Out</TableCell>
                              <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {myBookings.length === 0 ? (
                              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>No bookings yet. Go browse some homestays!</TableCell></TableRow>
                            ) : (
                              [...myBookings].reverse().slice(0, 5).map((b) => (
                                <TableRow key={b.id} hover>
                                  <TableCell sx={{ fontSize: "0.85rem" }}>{b.homestayName}</TableCell>
                                  <TableCell sx={{ fontSize: "0.85rem" }}>{b.checkIn}</TableCell>
                                  <TableCell sx={{ fontSize: "0.85rem" }}>{b.checkOut}</TableCell>
                                  <TableCell>{statusChip(b.status)}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {myBookings.length > 0 && (
                        <Button size="small" sx={{ mt: 1.5, color: "#2563eb" }} onClick={() => setPage("bookings")}>View all bookings →</Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e3a5f", mb: 1.5 }}>Available Homestays</Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      {homestays.slice(0, 4).map((h) => (
                        <Box key={h.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                          {h.image ? (
                            <Box component="img" src={h.image} alt={h.name} sx={{ width: 48, height: 48, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <HomeWorkIcon sx={{ color: "#3b82f6", fontSize: 22 }} />
                            </Box>
                          )}
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography fontWeight="bold" fontSize="0.9rem" noWrap>{h.name}</Typography>
                            <Typography fontSize="0.8rem" color="text.secondary" noWrap>{h.location}</Typography>
                          </Box>
                          <Typography fontWeight="bold" fontSize="0.85rem" sx={{ color: "#1d4ed8", flexShrink: 0 }}>RM {h.price}</Typography>
                        </Box>
                      ))}
                      <Button size="small" sx={{ mt: 1.5, color: "#2563eb" }} onClick={() => setPage("homestays")}>Browse all →</Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* ── HOMESTAYS ── */}
          {page === "homestays" && (
            <>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: "#1d4ed8" }}>Available Homestays</Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>Click the location to open Google Maps for directions.</Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
                {homestays.map((home) => (
                  <HomestayCard key={home.id} home={home} onBook={handleBookNow} />
                ))}
              </Box>
            </>
          )}

          {/* ── MY BOOKINGS ── */}
          {page === "bookings" && (
            <>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: "#1d4ed8" }}>My Bookings</Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>Create a new booking or manage your existing ones.</Typography>

              {/* Create / Edit form + Live Preview */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 4 }}>

                {/* ── Form ── */}
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                      {editingId ? "Edit Booking" : "Create New Booking"}
                    </Typography>

                    <Box component="form" onSubmit={handleBooking} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <TextField fullWidth label="Customer Name" value={currentUser.name} disabled />

                      <TextField
                        select fullWidth label="Select Homestay" name="homestayName"
                        value={form.homestayName} onChange={handleChange} required
                      >
                        {homestays.map((h) => (
                          <MenuItem key={h.id} value={h.name}>{h.name} — RM {h.price}/night</MenuItem>
                        ))}
                      </TextField>

                      <Box>
                        <Typography fontSize="0.85rem" fontWeight="bold" sx={{ mb: 0.5, color: "text.secondary" }}>Check-In Date *</Typography>
                        <TextField fullWidth type="date" name="checkIn" value={form.checkIn} onChange={handleChange} required />
                      </Box>

                      <Box>
                        <Typography fontSize="0.85rem" fontWeight="bold" sx={{ mb: 0.5, color: "text.secondary" }}>Check-Out Date *</Typography>
                        <TextField fullWidth type="date" name="checkOut" value={form.checkOut} onChange={handleChange} required />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button type="submit" variant="contained" size="large"
                          sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                          {editingId ? "Update Booking" : "Create Booking"}
                        </Button>
                        {editingId && (
                          <Button variant="outlined" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* ── Live Preview ── */}
                {(() => {
                  const previewHomestay = homestays.find((h) => h.name === form.homestayName);
                  const previewNights   = form.checkIn && form.checkOut
                    ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
                    : null;
                  const previewTotal    = previewHomestay && previewNights > 0
                    ? (previewHomestay.price * previewNights).toFixed(2)
                    : null;

                  return (
                    <Card sx={{ borderRadius: 3, boxShadow: 2, display: "flex", flexDirection: "column" }}>
                      {/* Homestay image or placeholder */}
                      {previewHomestay?.image ? (
                        <Box component="img" src={previewHomestay.image} alt={previewHomestay.name}
                          sx={{ width: "100%", height: 180, objectFit: "cover", borderRadius: "12px 12px 0 0", flexShrink: 0 }} />
                      ) : (
                        <Box sx={{ height: 180, flexShrink: 0, background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <HomeWorkIcon sx={{ fontSize: 64, color: "white", opacity: 0.4 }} />
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.3 }}>
                          {previewHomestay ? previewHomestay.name : "Select a homestay…"}
                        </Typography>
                        {previewHomestay && (
                          <Typography fontSize="0.85rem" color="text.secondary" sx={{ mb: 2 }}>
                            📍 {previewHomestay.location}
                          </Typography>
                        )}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {[
                            ["Customer",    currentUser.name],
                            ["Check-In",    form.checkIn   || "—"],
                            ["Check-Out",   form.checkOut  || "—"],
                            ["Nights",      previewNights != null && previewNights > 0 ? `${previewNights} night${previewNights > 1 ? "s" : ""}` : "—"],
                            ["Rate/Night",  previewHomestay ? `RM ${previewHomestay.price}` : "—"],
                          ].map(([label, val]) => (
                            <Box key={label} sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", pb: 0.6 }}>
                              <Typography fontSize="0.82rem" color="text.secondary">{label}</Typography>
                              <Typography fontSize="0.82rem" fontWeight="bold">{val}</Typography>
                            </Box>
                          ))}
                        </Box>

                        {/* Total */}
                        <Box sx={{ mt: 2, backgroundColor: "#2563eb", color: "white", borderRadius: 2, p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography fontWeight="bold">Estimated Total</Typography>
                          <Typography fontWeight="bold" fontSize="1.2rem">
                            {previewTotal ? `RM ${previewTotal}` : "—"}
                          </Typography>
                        </Box>

                        {/* Status notice */}
                        <Box sx={{ mt: 1.5, backgroundColor: "#fef3c7", borderRadius: 1.5, p: 1.2, display: "flex", alignItems: "center", gap: 1 }}>
                          <HourglassEmptyIcon sx={{ fontSize: 16, color: "#d97706" }} />
                          <Typography fontSize="0.78rem" color="#92400e">
                            Booking requires admin approval before payment.
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })()}
              </Box>

              {/* Bookings table */}
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "#1d4ed8" }}>Booking History</Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, overflow: "hidden" }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#2563eb" }}>
                    <TableRow>
                      <TableCell sx={headerCell}>Homestay</TableCell>
                      <TableCell sx={headerCell}>Check-In</TableCell>
                      <TableCell sx={headerCell}>Check-Out</TableCell>
                      <TableCell sx={headerCell}>Status</TableCell>
                      <TableCell sx={headerCell}>Payment</TableCell>
                      <TableCell sx={headerCell}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myBookings.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No bookings yet.</TableCell></TableRow>
                    ) : (
                      myBookings.map((b) => (
                        <TableRow key={b.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f8fafc" } }}>
                          <TableCell sx={bodyCell}>{b.homestayName}</TableCell>
                          <TableCell sx={bodyCell}>{b.checkIn}</TableCell>
                          <TableCell sx={bodyCell}>{b.checkOut}</TableCell>
                          <TableCell sx={bodyCell}>{statusChip(b.status)}</TableCell>
                          <TableCell sx={bodyCell}>
                            <Chip label={b.paymentStatus || "Pending"} size="small"
                              sx={{ backgroundColor: b.paymentStatus === "Paid" ? "#3b82f6" : "#f59e0b", color: "white" }} />
                          </TableCell>
                          <TableCell sx={bodyCell}>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button variant="contained" size="small"
                                sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}
                                onClick={() => handleEdit(b)}>Edit</Button>
                              <Button variant="contained" size="small" color="error" onClick={() => handleDelete(b.id)}>Delete</Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* ── PAYMENT ── */}
          {page === "payment" && (
            <>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: "#1d4ed8" }}>Payment</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>Pay for your confirmed bookings and download receipts.</Typography>

              {/* Info notice */}
              <Card sx={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 2, p: 2, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                <CreditCardIcon sx={{ color: "#2563eb" }} />
                <Typography fontSize="0.9rem" color="#1d4ed8">
                  Payment is only available after the admin <strong>confirms</strong> your booking. Pending bookings must wait for approval.
                </Typography>
              </Card>

              {myBookings.length === 0 ? (
                <Card sx={{ borderRadius: 3, boxShadow: 2, textAlign: "center", py: 6 }}>
                  <ReceiptIcon sx={{ fontSize: 64, color: "#bfdbfe", mb: 2 }} />
                  <Typography color="text.secondary">No bookings yet. Make a booking first!</Typography>
                </Card>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, overflow: "hidden" }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#2563eb" }}>
                      <TableRow>
                        <TableCell sx={headerCell}>Homestay</TableCell>
                        <TableCell sx={headerCell}>Check-In</TableCell>
                        <TableCell sx={headerCell}>Check-Out</TableCell>
                        <TableCell sx={headerCell}>Nights</TableCell>
                        <TableCell sx={headerCell}>Amount</TableCell>
                        <TableCell sx={headerCell}>Booking</TableCell>
                        <TableCell sx={headerCell}>Payment</TableCell>
                        <TableCell sx={headerCell}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myBookings.map((b) => {
                        const nights     = getNights(b.checkIn, b.checkOut);
                        const total      = getTotalAmount(b);
                        const paid       = b.paymentStatus === "Paid";
                        const confirmed  = b.status === "Confirmed";
                        const cancelled  = b.status === "Cancelled";
                        return (
                          <TableRow key={b.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f8fafc" } }}>
                            <TableCell sx={bodyCell}>{b.homestayName}</TableCell>
                            <TableCell sx={bodyCell}>{b.checkIn}</TableCell>
                            <TableCell sx={bodyCell}>{b.checkOut}</TableCell>
                            <TableCell sx={bodyCell}>{nights}</TableCell>
                            <TableCell sx={{ ...bodyCell, fontWeight: "bold", color: "#1d4ed8" }}>RM {total.toFixed(2)}</TableCell>
                            <TableCell sx={bodyCell}>
                              <Chip label={b.status} size="small" sx={{
                                backgroundColor: confirmed ? "#16a34a" : cancelled ? "#ef4444" : "#f59e0b",
                                color: "white", fontWeight: "bold",
                              }} />
                            </TableCell>
                            <TableCell sx={bodyCell}>
                              <Chip label={paid ? "Paid" : "Unpaid"} size="small"
                                sx={{ backgroundColor: paid ? "#22c55e" : "#e5e7eb", color: paid ? "white" : "#374151", fontWeight: "bold" }} />
                            </TableCell>
                            <TableCell sx={bodyCell}>
                              {paid ? (
                                <Button variant="outlined" size="small" startIcon={<ReceiptIcon />}
                                  onClick={() => openReceipt(b)}
                                  sx={{ color: "#2563eb", borderColor: "#2563eb", "&:hover": { backgroundColor: "#eff6ff" } }}>
                                  Receipt
                                </Button>
                              ) : confirmed ? (
                                <Button variant="contained" size="small" startIcon={<CreditCardIcon />}
                                  onClick={() => openPayDialog(b)}
                                  sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                                  Pay Now
                                </Button>
                              ) : cancelled ? (
                                <Chip label="Cancelled" size="small" sx={{ backgroundColor: "#fecaca", color: "#991b1b" }} />
                              ) : (
                                <Chip label="Awaiting Approval" size="small" sx={{ backgroundColor: "#fef3c7", color: "#92400e" }} />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* ── Pay Dialog ── */}
              <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 1 }}>
                  <CreditCardIcon /> Complete Payment
                </DialogTitle>
                <DialogContent>
                  {activeBooking && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                      {/* Booking summary */}
                      <Card sx={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 2 }}>
                        <CardContent sx={{ py: "12px !important" }}>
                          <Typography fontWeight="bold">{activeBooking.homestayName}</Typography>
                          <Typography fontSize="0.85rem" color="text.secondary" sx={{ mt: 0.3 }}>
                            {activeBooking.checkIn} → {activeBooking.checkOut} · {getNights(activeBooking.checkIn, activeBooking.checkOut)} night(s)
                          </Typography>
                          <Typography fontWeight="bold" sx={{ mt: 1, color: "#2563eb", fontSize: "1.2rem" }}>
                            Total: RM {getTotalAmount(activeBooking).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>

                      <Typography fontWeight="bold" fontSize="0.8rem" color="text.secondary" sx={{ letterSpacing: 1 }}>CARD DETAILS</Typography>

                      <TextField label="Cardholder Name" value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)} fullWidth />

                      <TextField label="Card Number" value={cardNum} placeholder="1234 5678 9012 3456"
                        inputProps={{ maxLength: 19 }}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                          setCardNum(v.replace(/(.{4})/g, "$1 ").trim());
                        }}
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon sx={{ color: "#2563eb" }} /></InputAdornment> }}
                      />

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Expiry (MM/YY)" value={cardExpiry} placeholder="MM/YY"
                          inputProps={{ maxLength: 5 }}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setCardExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                          }}
                          fullWidth />
                        <TextField label="CVV" value={cardCvv} type="password" placeholder="•••"
                          inputProps={{ maxLength: 3 }}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          fullWidth />
                      </Box>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={() => setPayDialogOpen(false)}>Cancel</Button>
                  <Button variant="contained"
                    disabled={!cardHolder || cardNum.replace(/\s/g, "").length < 16 || cardExpiry.length < 5 || cardCvv.length < 3}
                    onClick={handleConfirmPayment}
                    sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                    Pay RM {activeBooking ? getTotalAmount(activeBooking).toFixed(2) : "0.00"}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* ── Receipt Dialog ── */}
              <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 1 }}>
                  <ReceiptIcon /> Payment Receipt
                </DialogTitle>
                <DialogContent>
                  {activeBooking && (
                    <Box sx={{ p: 1 }}>
                      <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Typography fontWeight="bold" fontSize="1.4rem" color="#2563eb">HOMESTAY SYSTEM</Typography>
                        <Typography fontSize="0.85rem" color="text.secondary">Official Payment Receipt</Typography>
                      </Box>

                      <Card sx={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 2, mb: 2 }}>
                        <CardContent sx={{ py: "12px !important" }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography fontSize="0.85rem" color="text.secondary">Receipt No.</Typography>
                            <Typography fontWeight="bold" fontSize="0.85rem">RCPT-{String(activeBooking.id).padStart(4, "0")}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                            <Typography fontSize="0.85rem" color="text.secondary">Date Paid</Typography>
                            <Typography fontWeight="bold" fontSize="0.85rem">{receiptPaidAt}</Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      {[
                        ["Customer",    currentUser.name],
                        ["Email",       currentUser.email],
                        ["Homestay",    activeBooking.homestayName],
                        ["Check-In",    activeBooking.checkIn],
                        ["Check-Out",   activeBooking.checkOut],
                        ["Nights",      `${getNights(activeBooking.checkIn, activeBooking.checkOut)} night(s)`],
                        ["Rate/Night",  `RM ${getHomestayPrice(activeBooking.homestayName)}`],
                      ].map(([label, val]) => (
                        <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 0.8, borderBottom: "1px solid #f0f0f0" }}>
                          <Typography fontSize="0.85rem" color="text.secondary">{label}</Typography>
                          <Typography fontSize="0.85rem" fontWeight="bold">{val}</Typography>
                        </Box>
                      ))}

                      <Box sx={{ backgroundColor: "#2563eb", color: "white", borderRadius: 2, p: 2, mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography fontWeight="bold" fontSize="1.1rem">TOTAL PAID</Typography>
                        <Typography fontWeight="bold" fontSize="1.3rem">RM {getTotalAmount(activeBooking).toFixed(2)}</Typography>
                      </Box>

                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Chip label="✓  PAID" sx={{ backgroundColor: "#22c55e", color: "white", fontWeight: "bold", fontSize: "1rem", px: 2, py: 0.5 }} />
                      </Box>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={() => setReceiptOpen(false)}>Close</Button>
                  <Button variant="contained" startIcon={<ReceiptIcon />} onClick={handlePrintReceipt}
                    sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                    Print Receipt
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}

        </Container>
      </Box>

      {/* Live booking update notification */}
      <Snackbar
        open={bookingAlert}
        autoHideDuration={4000}
        onClose={() => setBookingAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setBookingAlert(false)}
          severity="info"
          variant="filled"
          sx={{ backgroundColor: "#2563eb", "& .MuiAlert-icon": { color: "white" } }}
        >
          Your booking has been updated by admin!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserDashboard;
