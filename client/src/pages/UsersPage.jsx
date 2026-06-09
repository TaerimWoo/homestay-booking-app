import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Sidebar from "../components/Sidebar";

import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
} from "@mui/material";

import { GET_USERS } from "../graphql";

function UsersPage({ setCurrentUser, page, setPage }) {
  const { data, loading } = useQuery(GET_USERS);
  const [pageNo, setPageNo] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (loading) return <h2>Loading Users...</h2>;

  const users = data?.users || [];

  const paginated = users.slice(pageNo * rowsPerPage, pageNo * rowsPerPage + rowsPerPage);

  const headerCell = {
    color: "white",
    fontWeight: "bold",
    py: 1.5,
    px: 2,
  };

  const bodyCell = { py: 1.2, px: 2 };

  function getInitials(name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar page={page} setPage={setPage} setCurrentUser={setCurrentUser} />

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: "#f0fdf4", minHeight: "100vh" }}
      >
        <Container maxWidth={false} sx={{ py: 4, ml: 0 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#14532d" }}
          >
            Users Management
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 4 }}>
            View all registered users in the system.
          </Typography>

          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#166534" }}>
                <TableRow>
                  <TableCell sx={headerCell}>No.</TableCell>
                  <TableCell sx={headerCell}>Name</TableCell>
                  <TableCell sx={headerCell}>Email</TableCell>
                  <TableCell sx={headerCell}>Role</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((user, index) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f8fafc" },
                      }}
                    >
                      <TableCell sx={{ ...bodyCell, color: "text.secondary", width: 50 }}>
                        {pageNo * rowsPerPage + index + 1}
                      </TableCell>

                      <TableCell sx={bodyCell}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              backgroundColor:
                                user.role === "admin" ? "#1d4ed8" : "#166534",
                            }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography fontWeight="medium" fontSize="0.9rem">
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={bodyCell}>
                        <Typography fontSize="0.9rem">{user.email}</Typography>
                      </TableCell>

                      <TableCell sx={bodyCell}>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            backgroundColor:
                              user.role === "admin" ? "#1d4ed8" : "#166534",
                            color: "white",
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={users.length}
              page={pageNo}
              onPageChange={(_, newPage) => setPageNo(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPageNo(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </Container>
      </Box>
    </Box>
  );
}

export default UsersPage;
