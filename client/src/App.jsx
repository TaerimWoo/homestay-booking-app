import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import PaymentPage from "./pages/PaymentPage";
import UsersPage from "./pages/UsersPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // NEW
  const [page, setPage] = useState("dashboard");

  // Register Page
  if (!currentUser && showRegister) {
    return (
      <Register
        setShowRegister={setShowRegister}
      />
    );
  }

  // Login Page
  if (!currentUser) {
    return (
      <Login
        setCurrentUser={setCurrentUser}
        setShowRegister={setShowRegister}
      />
    );
  }

  // Admin Login
  if (currentUser.role === "admin") {

    if (page === "payment") {
      return (
        <PaymentPage
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          page={page}
          setPage={setPage}
        />
      );
    }

    if (page === "users") {
      return (
        <UsersPage
          setCurrentUser={setCurrentUser}
          page={page}
          setPage={setPage}
        />
      );
    }

    return (
      <AdminDashboard
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        page={page}
        setPage={setPage}
      />
    );
  }

  // User Dashboard
  return (
    <UserDashboard
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
    />
  );
}

export default App;