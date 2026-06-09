import { useState } from "react";

import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";

import ChevronLeftIcon  from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon        from "@mui/icons-material/Today";

// Colour palette for booking chips — cycles by booking id
const CHIP_COLORS = [
  "#166534", "#1d4ed8", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#be185d", "#059669",
];

function BookingCalendar({ bookings }) {
  const [calDate, setCalDate] = useState(new Date());

  const year  = calDate.getFullYear();
  const month = calDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const monthLabel     = calDate.toLocaleDateString("en-MY", { month: "long", year: "numeric" });

  const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getBookingsForDay = (day) => {
    const ds = toDateStr(year, month, day);
    return bookings.filter((b) => b.checkIn <= ds && b.checkOut >= ds);
  };

  const today = new Date();
  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  // Build grid cells: nulls for blank leading days, then 1..daysInMonth
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
      <CardContent>
        {/* Calendar header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#166534" }}>
            Booking Calendar — {monthLabel}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" onClick={() => setCalDate(new Date(year, month - 1, 1))}>
              <ChevronLeftIcon />
            </IconButton>
            <Button size="small" startIcon={<TodayIcon />}
              onClick={() => setCalDate(new Date())}
              sx={{ color: "#166534", textTransform: "none" }}>
              Today
            </Button>
            <IconButton size="small" onClick={() => setCalDate(new Date(year, month + 1, 1))}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Day-of-week headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.5 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Box key={d} sx={{ textAlign: "center", fontSize: "0.78rem", fontWeight: "bold", color: "text.secondary", py: 0.5 }}>
              {d}
            </Box>
          ))}
        </Box>

        {/* Day cells */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
          {cells.map((day, i) => {
            if (!day) return <Box key={`e-${i}`} sx={{ minHeight: 68 }} />;
            const dayBookings = getBookingsForDay(day);
            const highlight   = isToday(day);

            return (
              <Box key={day} sx={{
                minHeight: 68,
                p: 0.6,
                border: "1px solid",
                borderColor: highlight ? "#16a34a" : "#e5e7eb",
                borderRadius: 1.5,
                backgroundColor: highlight ? "#f0fdf4" : "white",
                position: "relative",
              }}>
                <Typography sx={{
                  fontSize: "0.78rem",
                  fontWeight: highlight ? "bold" : "normal",
                  color: highlight ? "#166534" : "text.primary",
                  lineHeight: 1,
                  mb: 0.4,
                }}>
                  {day}
                </Typography>

                {dayBookings.slice(0, 3).map((b) => (
                  <Tooltip
                    key={b.id}
                    title={`${resolveName(b)} · ${b.homestayName} (${b.checkIn} → ${b.checkOut})`}
                    arrow
                    placement="top"
                  >
                    <Box sx={{
                      backgroundColor: CHIP_COLORS[Number(b.id) % CHIP_COLORS.length],
                      color: "white",
                      fontSize: "0.62rem",
                      borderRadius: 0.8,
                      px: 0.6,
                      py: 0.15,
                      mb: 0.3,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      cursor: "default",
                    }}>
                      {resolveName(b).split(" ")[0]} · {b.homestayName.split(" ")[0]}
                    </Box>
                  </Tooltip>
                ))}

                {dayBookings.length > 3 && (
                  <Typography sx={{ fontSize: "0.62rem", color: "text.secondary" }}>
                    +{dayBookings.length - 3} more
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Legend */}
        {bookings.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[...new Set(bookings.map((b) => b.homestayName))].map((name, i) => (
              <Box key={name} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: CHIP_COLORS[i % CHIP_COLORS.length] }} />
                <Typography fontSize="0.75rem" color="text.secondary">{name}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function BookingManagement({ bookings, updateStatus, handleDeleteBooking, getStatusColor, resolveCustomerName }) {
  // Fallback if not provided (shouldn't happen in practice)
  const resolveName = resolveCustomerName || ((b) => b.customerName);
  const [filterType,  setFilterType]  = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [pageNo,      setPageNo]      = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const customerNames = [...new Set(bookings.map((b) => resolveName(b)))];
  const homestayNames = [...new Set(bookings.map((b) => b.homestayName))];
  const statusOptions = ["Pending", "Confirmed", "Cancelled"];

  const filtered = bookings.filter((b) => {
    if (!filterType || !filterValue) return true;
    if (filterType === "name")     return resolveName(b) === filterValue;
    if (filterType === "homestay") return b.homestayName === filterValue;
    if (filterType === "status")   return b.status       === filterValue;
    return true;
  });

  const paginated = filtered.slice(pageNo * rowsPerPage, pageNo * rowsPerPage + rowsPerPage);

  const headerCell = { color: "white", fontWeight: "bold", py: 1.3, px: 2 };
  const bodyCell   = { py: 1, px: 2 };

  return (
    <>
      <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: "#14532d" }}>
        Booking Management
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Confirm, cancel, or delete customer bookings.
      </Typography>

      {/* ── Booking Calendar — only Confirmed + Paid ── */}
      <BookingCalendar bookings={bookings.filter((b) => b.status === "Confirmed" && b.paymentStatus === "Paid")} />

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "#166534" }}>
        All Bookings
      </Typography>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ width: 220 }}>
            <InputLabel>Search By</InputLabel>
            <Select value={filterType} label="Search By"
              onChange={(e) => { setFilterType(e.target.value); setFilterValue(""); setPageNo(0); }}>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="homestay">Homestay</MenuItem>
              <MenuItem value="status">Booking Status</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 320 }} disabled={!filterType}>
            <InputLabel>Select Value</InputLabel>
            <Select value={filterValue} label="Select Value"
              onChange={(e) => { setFilterValue(e.target.value); setPageNo(0); }}>
              {filterType === "name"     && customerNames.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              {filterType === "homestay" && homestayNames.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
              {filterType === "status"   && statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
              <TableCell sx={headerCell}>Status</TableCell>
              <TableCell sx={headerCell}>Payment</TableCell>
              <TableCell sx={headerCell}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No booking records found.</TableCell>
              </TableRow>
            ) : (
              paginated.map((booking) => (
                <TableRow key={booking.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f8fafc" } }}>
                  <TableCell sx={bodyCell}>{resolveName(booking)}</TableCell>
                  <TableCell sx={bodyCell}>{booking.homestayName}</TableCell>
                  <TableCell sx={bodyCell}>{booking.checkIn}</TableCell>
                  <TableCell sx={bodyCell}>{booking.checkOut}</TableCell>

                  <TableCell sx={bodyCell}>
                    <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
                  </TableCell>

                  <TableCell sx={bodyCell}>
                    <Chip
                      label={booking.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                      size="small"
                      sx={{
                        backgroundColor: booking.paymentStatus === "Paid" ? "#16a34a" : "#e5e7eb",
                        color: booking.paymentStatus === "Paid" ? "white" : "#374151",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>

                  <TableCell sx={bodyCell}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button variant="contained" size="small"
                        disabled={booking.status === "Confirmed"}
                        onClick={() => updateStatus(booking, "Confirmed")}
                        sx={{ backgroundColor: "#16a34a", "&:hover": { backgroundColor: "#15803d" } }}>
                        Confirm
                      </Button>
                      <Button variant="contained" size="small"
                        disabled={booking.status === "Pending"}
                        onClick={() => updateStatus(booking, "Pending")}
                        sx={{ backgroundColor: "#f59e0b", "&:hover": { backgroundColor: "#d97706" } }}>
                        Pending
                      </Button>
                      <Button variant="contained" size="small"
                        disabled={booking.status === "Cancelled"}
                        onClick={() => updateStatus(booking, "Cancelled")}
                        sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}>
                        Cancel
                      </Button>
                      <Button variant="outlined" color="error" size="small"
                        onClick={() => handleDeleteBooking(booking.id)}>
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
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
    </>
  );
}

export default BookingManagement;
