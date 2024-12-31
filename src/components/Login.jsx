import React, { useState } from "react";
import { auth, googleProvider } from "../auth/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false); // Toggle for signup and login
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

  // Handle Login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Login successful!");
      onLogin(user); // Notify parent component about the login
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Signup
  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Signup successful!");
      onLogin(user); // Notify parent component about the signup
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Google login successful!");
      onLogin(user); // Notify parent component about the login
    } catch (error) {
      alert(error.message);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword); // Toggle password visibility

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 3, border: "1px solid gray", borderRadius: "10px" }}>
        <Typography variant="h5" mb={2}>
          {isSignup ? "Signup" : "Login"}
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off" // Disable autofill for email
        />
        <TextField
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"} // Toggle the input type based on showPassword state
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off" // Disable autofill for password
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />} {/* Toggle icon */}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {isSignup ? (
          <Button variant="contained" color="primary" fullWidth onClick={handleSignup}>
            Signup
          </Button>
        ) : (
          <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
            Login
          </Button>
        )}
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleGoogleLogin}
        >
          {isSignup ? "Signup with Google" : "Login with Google"}
        </Button>
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, cursor: "pointer", textDecoration: "underline" }}
          onClick={() => setIsSignup(!isSignup)} // Toggle between login and signup
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Signup"}
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
