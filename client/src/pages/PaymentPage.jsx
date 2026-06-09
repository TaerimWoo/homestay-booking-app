import { useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import Sidebar from "../components/Sidebar";

import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Card,
  CardContent,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import ReceiptIcon      from "@mui/icons-material/Receipt";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AttachMoneyIcon  from "@mui/icons-material/AttachMoney";
import BookOnlineIcon   from "@mui/icons-material/BookOnline";

import { GET_BOOKINGS, GET_HOMESTAYS, UPDATE_BOOKING, GET_USERS, USER_CHANGED } from "../graphql";

const headerCell = { color: "white", fontWeight: "bold", py: 1.4, px: 2 };
const bodyCell   = { py: 1.1, px: 2 };

function PaymentPage({ currentUser, setCurrentUser, page, setPage }) {
  const [filterType,  setFilterType]  = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [pageNo,      setPageNo]      = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState(null);

  const { data: bookingData,  loading: bookingLoading,  refetch } = useQuery(GET_BOOKINGS);
  const { data: homestayData, loading: homestayLoading }           = useQuery(GET_HOMESTAYS);
  const { data: userData, refetch: refetchUsers } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });
  const [updateBooking] = useMutation(UPDATE_BOOKING);

  useSubscription(USER_CHANGED, {
    onData: () => {
      refetchUsers();
      refetch(); // bookings customerName was also updated on server
    },
  });

  if (bookingLoading || homestayLoading) return <h2>Loading...</h2>;

  const bookings  = bookingData?.bookings   || [];
  const homestays = homestayData?.homestays || [];
  const users     = userData?.users         || [];

  const resolveCustomerName = (booking) => {
    if (booking.userId) {
      const user = users.find((u) => String(u.id) === String(booking.userId));
      if (user) return user.name;
    }
    return booking.customerName;
  };

  const getPrice   = (name)    => homestays.find((h) => h.name === name)?.price || 0;
  const getNights  = (ci, co)  => Math.max(1, Math.round((new Date(co) - new Date(ci)) / 86400000));
  const getTotal   = (b)       => getNights(b.checkIn, b.checkOut) * getPrice(b.homestayName);

  const confirmed = bookings.filter((b) => b.status === "Confirmed");
  const paid      = confirmed.filter((b) => b.paymentStatus === "Paid");
  const pending   = confirmed.filter((b) => b.paymentStatus !== "Paid");
  const revenue   = paid.reduce((sum, b) => sum + getTotal(b), 0);

  const customerNames      = [...new Set(confirmed.map((b) => resolveCustomerName(b)))];
  const homestayNames      = [...new Set(confirmed.map((b) => b.homestayName))];
  const paymentStatusOpts  = ["Paid", "Pending Payment"];

  const filtered = confirmed.filter((b) => {
    if (!filterType || !filterValue) return true;
    if (filterType === "name")    return resolveCustomerName(b) === filterValue;
    if (filterType === "homestay") return b.homestayName === filterValue;
    if (filterType === "payment") {
      const s = b.paymentStatus === "Paid" ? "Paid" : "Pending Payment";
      return s === filterValue;
    }
    return true;
  });

  const paginated = filtered.slice(pageNo * rowsPerPage, pageNo * rowsPerPage + rowsPerPage);

  const handleMarkPaid = async (booking) => {
    await updateBooking({
      variables: {
        id: booking.id,
        input: {
          customerName: booking.customerName,
          homestayName: booking.homestayName,
          checkIn:      booking.checkIn,
          checkOut:     booking.checkOut,
          status:       booking.status,
          paymentStatus: "Paid",
        },
      },
    });
    refetch();
  };

  const openReceipt = (booking) => {
    setReceiptBooking(booking);
    setReceiptOpen(true);
  };

  const handlePrint = () => {
    if (!receiptBooking) return;
    const nights  = getNights(receiptBooking.checkIn, receiptBooking.checkOut);
    const price   = getPrice(receiptBooking.homestayName);
    const total   = (nights * price).toFixed(2);
    const rcptNo  = `INV-${String(receiptBooking.id).padStart(5, "0")}`;
    const today   = new Date().toLocaleDateString("en-MY", { dateStyle: "long" });

    const w = window.open("", "_blank", "width=720,height=960");
    w.document.write(`<!DOCTYPE html><html><head><title>${rcptNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; padding: 48px; color: #1a1a1a; background: #fff; }
  .logo { font-size: 26px; font-weight: bold; color: #166534; text-align: center; margin-bottom: 4px; }
  .subtitle { text-align: center; color: #888; font-size: 13px; margin-bottom: 28px; letter-spacing: 1px; }
  .badge-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; font-size: 15px; border-bottom: 1px solid #f3f4f6; }
  .row:last-child { border-bottom: none; }
  .label { color: #6b7280; }
  .value { font-weight: bold; color: #111827; }
  .section-title { font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #9ca3af; margin: 20px 0 8px; }
  .total-box { background: #166534; color: white; border-radius: 10px; padding: 20px 24px; display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-top: 24px; }
  .paid-stamp { text-align: center; margin: 28px 0 20px; }
  .paid-stamp span { border: 4px solid #22c55e; color: #16a34a; font-size: 22px; font-weight: bold; letter-spacing: 6px; padding: 8px 36px; border-radius: 8px; display: inline-block; transform: rotate(-4deg); }
  .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
  .print-btn { display: block; margin: 24px auto 0; padding: 12px 40px; background: #166534; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style></head><body>
<div class="logo">&#127968; HOMESTAY SYSTEM</div>
<div class="subtitle">OFFICIAL PAYMENT INVOICE</div>

<div class="badge-box">
  <div class="row"><span class="label">Invoice No.</span><span class="value">${rcptNo}</span></div>
  <div class="row"><span class="label">Date Generated</span><span class="value">${today}</span></div>
  <div class="row"><span class="label">Payment Status</span><span class="value" style="color:#16a34a">&#10003; PAID</span></div>
</div>

<div class="section-title">CUSTOMER DETAILS</div>
<div class="row"><span class="label">Customer Name</span><span class="value">${resolveCustomerName(receiptBooking)}</span></div>

<div class="section-title">BOOKING DETAILS</div>
<div class="row"><span class="label">Homestay</span><span class="value">${receiptBooking.homestayName}</span></div>
<div class="row"><span class="label">Check-In</span><span class="value">${receiptBooking.checkIn}</span></div>
<div class="row"><span class="label">Check-Out</span><span class="value">${receiptBooking.checkOut}</span></div>
<div class="row"><span class="label">Duration</span><span class="value">${nights} night${nights > 1 ? "s" : ""}</span></div>
<div class="row"><span class="label">Rate per Night</span><span class="value">RM ${price}</span></div>

<div class="total-box"><span>TOTAL AMOUNT</span><span>RM ${total}</span></div>

<div class="paid-stamp"><span>&#10003;&nbsp;PAID</span></div>

<div class="footer">
  <p>Thank you for choosing Homestay System!</p>
  <p>This is a computer-generated invoice. No signature required.</p>
</div>
<button class="print-btn" onclick="window.print()">&#128424;&nbsp; Print Invoice</button>
</body></html>`);
    w.document.close();
  };

  const statCards = [
    { label: "Confirmed Bookings", value: confirmed.length, color: "#166534", bg: "#f0fdf4", icon: <BookOnlineIcon sx={{ color: "#166534" }} /> },
    { label: "Paid",               value: paid.length,      color: "#16a34a", bg: "#dcfce7", icon: <CheckCircleIcon  sx={{ color: "#16a34a" }} /> },
    { label: "Pending Payment",    value: pending.length,   color: "#d97706", bg: "#fffbeb", icon: <HourglassEmptyIcon sx={{ color: "#d97706" }} /> },
    { label: "Total Revenue",      value: `RM ${revenue.toFixed(2)}`, color: "#0f766e", bg: "#f0fdfa", icon: <AttachMoneyIcon sx={{ color: "#0f766e" }} /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar page={page} setPage={setPage} setCurrentUser={setCurrentUser} currentUser={currentUser} />

      <Box component="main" sx={{ flexGrow: 1, backgroundColor: "#f0fdf4", minHeight: "100vh" }}>
        <Container maxWidth={false} sx={{ py: 4, px: 3 }}>

          {/* Banner */}
          <Box sx={{ background: "linear-gradient(135deg, #052e16 0%, #166534 60%, #16a34a 100%)", borderRadius: 3, p: 3, mb: 4, color: "white", boxShadow: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">Payment / Invoice</Typography>
              <Typography sx={{ opacity: 0.85, mt: 0.5 }}>Manage confirmed bookings and print invoices.</Typography>
            </Box>
            <ReceiptIcon sx={{ fontSize: 56, opacity: 0.3 }} />
          </Box>

          {/* Stat cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((s) => (
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

          {/* Filter bar */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel>Search By</InputLabel>
                <Select value={filterType} label="Search By"
                  onChange={(e) => { setFilterType(e.target.value); setFilterValue(""); setPageNo(0); }}>
                  <MenuItem value="name">Customer Name</MenuItem>
                  <MenuItem value="homestay">Homestay</MenuItem>
                  <MenuItem value="payment">Payment Status</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: 280 }} disabled={!filterType}>
                <InputLabel>Select Value</InputLabel>
                <Select value={filterValue} label="Select Value"
                  onChange={(e) => { setFilterValue(e.target.value); setPageNo(0); }}>
                  {filterType === "name"    && customerNames.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  {filterType === "homestay" && homestayNames.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                  {filterType === "payment" && paymentStatusOpts.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>

              <Button variant="outlined"
                sx={{ borderColor: "#16a34a", color: "#166534", fontWeight: "bold", "&:hover": { borderColor: "#15803d", backgroundColor: "#dcfce7" } }}
                onClick={() => { setFilterType(""); setFilterValue(""); setPageNo(0); }}>
                Clear
              </Button>
            </Box>
          </Paper>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#166534" }}>
                <TableRow>
                  <TableCell sx={headerCell}>Customer Name</TableCell>
                  <TableCell sx={headerCell}>Homestay</TableCell>
                  <TableCell sx={headerCell}>Check-In</TableCell>
                  <TableCell sx={headerCell}>Check-Out</TableCell>
                  <TableCell sx={headerCell}>Nights</TableCell>
                  <TableCell sx={headerCell}>Rate/Night</TableCell>
                  <TableCell sx={headerCell}>Total</TableCell>
                  <TableCell sx={headerCell}>Payment</TableCell>
                  <TableCell sx={headerCell}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No payment records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((b) => {
                    const nights = getNights(b.checkIn, b.checkOut);
                    const price  = getPrice(b.homestayName);
                    const total  = (nights * price).toFixed(2);
                    const isPaid = b.paymentStatus === "Paid";

                    return (
                      <TableRow key={b.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f8fafc" } }}>
                        <TableCell sx={bodyCell}>{resolveCustomerName(b)}</TableCell>
                        <TableCell sx={bodyCell}>{b.homestayName}</TableCell>
                        <TableCell sx={bodyCell}>{b.checkIn}</TableCell>
                        <TableCell sx={bodyCell}>{b.checkOut}</TableCell>
                        <TableCell sx={bodyCell}>{nights}</TableCell>
                        <TableCell sx={bodyCell}>RM {price}</TableCell>
                        <TableCell sx={{ ...bodyCell, fontWeight: "bold", color: "#166534" }}>RM {total}</TableCell>
                        <TableCell sx={bodyCell}>
                          <Chip
                            label={isPaid ? "Paid" : "Pending"}
                            size="small"
                            sx={{
                              backgroundColor: isPaid ? "#16a34a" : "#f59e0b",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={bodyCell}>
                          {isPaid ? (
                            <Button variant="contained" size="small" startIcon={<ReceiptIcon />}
                              onClick={() => openReceipt(b)}
                              sx={{ backgroundColor: "#166534", "&:hover": { backgroundColor: "#14532d" } }}>
                              Invoice
                            </Button>
                          ) : (
                            <Button variant="contained" size="small" startIcon={<CheckCircleIcon />}
                              onClick={() => handleMarkPaid(b)}
                              sx={{ backgroundColor: "#d97706", "&:hover": { backgroundColor: "#b45309" } }}>
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filtered.length}
              page={pageNo}
              onPageChange={(_, newPage) => setPageNo(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPageNo(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </TableContainer>

          {/* Receipt / Invoice Dialog */}
          <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: "bold", color: "#166534", display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptIcon /> Invoice Preview
            </DialogTitle>
            <DialogContent>
              {receiptBooking && (
                <Box sx={{ p: 1 }}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography fontWeight="bold" fontSize="1.4rem" color="#166534">HOMESTAY SYSTEM</Typography>
                    <Typography fontSize="0.85rem" color="text.secondary" sx={{ letterSpacing: 1 }}>OFFICIAL PAYMENT INVOICE</Typography>
                  </Box>

                  <Card sx={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2, mb: 2 }}>
                    <CardContent sx={{ py: "12px !important" }}>
                      {[
                        ["Invoice No.", `INV-${String(receiptBooking.id).padStart(5, "0")}`],
                        ["Date Generated", new Date().toLocaleDateString("en-MY", { dateStyle: "long" })],
                        ["Payment Status", "✓ PAID"],
                      ].map(([label, val]) => (
                        <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                          <Typography fontSize="0.85rem" color="text.secondary">{label}</Typography>
                          <Typography fontSize="0.85rem" fontWeight="bold" color={label === "Payment Status" ? "#16a34a" : "inherit"}>{val}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>

                  <Typography fontSize="0.75rem" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1.5, mb: 1 }}>CUSTOMER</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.8, borderBottom: "1px solid #f0f0f0" }}>
                    <Typography fontSize="0.85rem" color="text.secondary">Customer Name</Typography>
                    <Typography fontSize="0.85rem" fontWeight="bold">{resolveCustomerName(receiptBooking)}</Typography>
                  </Box>

                  <Typography fontSize="0.75rem" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1.5, mt: 2, mb: 1 }}>BOOKING DETAILS</Typography>
                  {[
                    ["Homestay",    receiptBooking.homestayName],
                    ["Check-In",   receiptBooking.checkIn],
                    ["Check-Out",  receiptBooking.checkOut],
                    ["Nights",     `${getNights(receiptBooking.checkIn, receiptBooking.checkOut)} night(s)`],
                    ["Rate/Night", `RM ${getPrice(receiptBooking.homestayName)}`],
                  ].map(([label, val]) => (
                    <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 0.8, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography fontSize="0.85rem" color="text.secondary">{label}</Typography>
                      <Typography fontSize="0.85rem" fontWeight="bold">{val}</Typography>
                    </Box>
                  ))}

                  <Box sx={{ backgroundColor: "#166534", color: "white", borderRadius: 2, p: 2, mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography fontWeight="bold" fontSize="1.1rem">TOTAL AMOUNT</Typography>
                    <Typography fontWeight="bold" fontSize="1.3rem">RM {getTotal(receiptBooking).toFixed(2)}</Typography>
                  </Box>

                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Chip label="✓  PAID" sx={{ backgroundColor: "#22c55e", color: "white", fontWeight: "bold", fontSize: "1rem", px: 2, py: 0.5 }} />
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setReceiptOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<ReceiptIcon />} onClick={handlePrint}
                sx={{ backgroundColor: "#166534", "&:hover": { backgroundColor: "#14532d" } }}>
                Print Invoice
              </Button>
            </DialogActions>
          </Dialog>

        </Container>
      </Box>
    </Box>
  );
}

export default PaymentPage;
