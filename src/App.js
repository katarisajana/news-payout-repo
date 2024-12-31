import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { ThemeContext } from "./ThemeContext";
import { CssBaseline, Button, Box } from "@mui/material";
import { auth } from "./auth/firebaseConfig";

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
  };

  const { toggleTheme } = useContext(ThemeContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={toggleTheme}>
          Toggle Theme
        </Button>
      </Box>

      {/* Render Routes after user data is loaded */}
      <AppRoutes user={user} setUser={setUser} handleLogout={handleLogout} />
    </Router>
  );
}

const AppRoutes = ({ user, setUser, handleLogout }) => {
  const navigate = useNavigate(); 

  const handleLogin = (user) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/dashboard"); 
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;

