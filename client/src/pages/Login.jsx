import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import EmailIcon         from "@mui/icons-material/Email";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon     from "@mui/icons-material/ArrowBack";
import { LOGIN_USER, REQUEST_PASSWORD_RESET, RESET_PASSWORD } from "../graphql";

function useLastCharPeek() {
  const [real, setReal] = useState("");
  const [peeking, setPeeking] = useState(false);
  const timer = useRef(null);

  const masked =
    real.length === 0
      ? ""
      : "•".repeat(peeking ? real.length - 1 : real.length) +
        (peeking ? real[real.length - 1] : "");

  const onMasked = (e) => {
    const next = e.target.value, prev = masked;
    if (next.length > prev.length) {
      setReal((r) => r + next.slice(prev.length));
      setPeeking(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPeeking(false), 1000);
    } else if (next.length < prev.length) {
      setReal((r) => r.slice(0, r.length - (prev.length - next.length)));
      setPeeking(false);
      clearTimeout(timer.current);
    }
  };

  const onRevealed = (val) => {
    setReal(val); setPeeking(false); clearTimeout(timer.current);
  };

  const reset = () => {
    setReal(""); setPeeking(false); clearTimeout(timer.current);
  };

  return { real, masked, onMasked, onRevealed, peeking, reset };
}

function Bear({ state }) {
  const armY   = { watching: 56, hiding: 0, peeking: 13 };
  const pupilY = { watching: 4,  hiding: 0, peeking: -4 };
  const t  = armY[state];
  const dy = pupilY[state];
  const spring = "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";

  return (
    <svg
      width="130" height="115"
      viewBox="0 0 120 115"
      style={{ overflow: "visible", display: "block", margin: "0 auto" }}
    >
      <circle cx="21"  cy="28" r="17" fill="#D4956A"/>
      <circle cx="21"  cy="28" r="11" fill="#C0784A"/>
      <circle cx="99"  cy="28" r="17" fill="#D4956A"/>
      <circle cx="99"  cy="28" r="11" fill="#C0784A"/>
      <circle cx="60"  cy="63" r="42" fill="#F2C272"/>
      <circle cx="29"  cy="75" r="13" fill="rgba(255,120,120,0.22)"/>
      <circle cx="91"  cy="75" r="13" fill="rgba(255,120,120,0.22)"/>
      <circle cx="43"  cy="55" r="11" fill="white"/>
      <circle cx="77"  cy="55" r="11" fill="white"/>
      <circle cx="45" cy={56 + dy} r="7"   fill="#1a0f08" style={{ transition: "all 0.3s ease" }}/>
      <circle cx="79" cy={56 + dy} r="7"   fill="#1a0f08" style={{ transition: "all 0.3s ease" }}/>
      <circle cx="42" cy={52 + dy} r="2.2" fill="white"   style={{ transition: "all 0.3s ease" }}/>
      <circle cx="76" cy={52 + dy} r="2.2" fill="white"   style={{ transition: "all 0.3s ease" }}/>
      <ellipse cx="60" cy="75" rx="17" ry="12" fill="#E8A060"/>
      <ellipse cx="60" cy="70" rx="7"  ry="4.5" fill="#5C2E1A"/>
      {state === "hiding"
        ? <path d="M 52 80 Q 60 78 68 80" stroke="#5C2E1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        : <path d="M 51 80 Q 60 90 69 80" stroke="#5C2E1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      }
      <g style={{ transform: `translateY(${t}px)`, transition: spring }}>
        <rect x="1"  y="46" width="44" height="28" rx="14" fill="#D4956A"/>
        <circle cx="11" cy="41" r="9"  fill="#D4956A"/>
        <circle cx="23" cy="37" r="10" fill="#D4956A"/>
        <circle cx="36" cy="41" r="9"  fill="#D4956A"/>
        <rect x="75" y="46" width="44" height="28" rx="14" fill="#D4956A"/>
        <circle cx="84"  cy="41" r="9"  fill="#D4956A"/>
        <circle cx="97"  cy="37" r="10" fill="#D4956A"/>
        <circle cx="109" cy="41" r="9"  fill="#D4956A"/>
      </g>
    </svg>
  );
}

export default function Login({ setCurrentUser, setShowRegister }) {
  const pass = useLastCharPeek();
  const [email,      setEmail]      = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loginError, setLoginError] = useState("");
  const [charState,  setCharState]  = useState("watching");
  const charTimer = useRef(null);

  // Forgot password state
  const [forgotStep,    setForgotStep]    = useState(null); // null | "email" | "otp" | "newpass"
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotOtp,     setForgotOtp]     = useState("");
  const [forgotError,   setForgotError]   = useState("");
  const [forgotMsg,     setForgotMsg]     = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const newPass     = useLastCharPeek();
  const confirmPass = useLastCharPeek();
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loginUser, { loading }]               = useMutation(LOGIN_USER);
  const [requestReset]                         = useMutation(REQUEST_PASSWORD_RESET);
  const [resetPassword]                        = useMutation(RESET_PASSWORD);

  const handlePasswordFocus = () => setCharState("hiding");
  const handlePasswordBlur  = () => setCharState("watching");

  const handlePassChange = (e) => {
    setLoginError("");
    showPass ? pass.onRevealed(e.target.value) : pass.onMasked(e);
    setCharState("peeking");
    clearTimeout(charTimer.current);
    charTimer.current = setTimeout(() => setCharState("hiding"), 800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const r = await loginUser({ variables: { email, password: pass.real } });
      setCurrentUser(r.data.login);
    } catch {
      setLoginError("Wrong email or password. Please try again.");
    }
  };

  // ── Forgot password handlers ──
  const openForgot = () => {
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotError("");
    setForgotMsg("");
    newPass.reset();
    confirmPass.reset();
    setCharState("watching");
  };

  const closeForgot = () => {
    setForgotStep(null);
    setForgotError("");
    setForgotMsg("");
    setCharState("watching");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail) { setForgotError("Please enter your email."); return; }
    setForgotLoading(true);
    try {
      await requestReset({ variables: { email: forgotEmail } });
      setForgotMsg("OTP sent! Check your email inbox.");
      setForgotStep("otp");
    } catch (err) {
      setForgotError(err.message || "Failed to send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setForgotError("");
    if (forgotOtp.length !== 6) { setForgotError("Please enter the 6-digit OTP."); return; }
    setForgotStep("newpass");
    setForgotMsg("");
    setCharState("watching");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (newPass.real.length < 6) { setForgotError("Password must be at least 6 characters."); return; }
    if (newPass.real !== confirmPass.real) { setForgotError("Passwords do not match."); return; }
    setForgotLoading(true);
    try {
      await resetPassword({ variables: { email: forgotEmail, otp: forgotOtp, newPassword: newPass.real } });
      setForgotMsg("Password reset successful! You can now log in.");
      setForgotStep("done");
      setCharState("watching");
    } catch (err) {
      setForgotError(err.message || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  const makeNewPassChange = (hook, isRevealed) => (e) => {
    setForgotError("");
    isRevealed ? hook.onRevealed(e.target.value) : hook.onMasked(e);
    setCharState("peeking");
    clearTimeout(charTimer.current);
    charTimer.current = setTimeout(() => setCharState("hiding"), 800);
  };

  const displayVal = showPass ? pass.real : pass.masked;

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform: translateY(20px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      <Box sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center",
        p: 3,
      }}>
        <Box sx={{
          width: "100%", maxWidth: 400,
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
          animation: "cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>

          {/* Header */}
          <Box sx={{
            background: "linear-gradient(160deg, #0f1f3d 0%, #1d4ed8 100%)",
            pt: 4, pb: 3, px: 3,
            textAlign: "center",
            overflow: "hidden",
          }}>
            <Bear state={charState} />
            <Typography variant="h6" fontWeight="bold" color="white" letterSpacing={2} sx={{ mt: 2 }}>
              {forgotStep ? "RESET PASSWORD" : "HOMESTAY SYSTEM"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", mt: 0.3 }}>
              {forgotStep
                ? forgotStep === "email" ? "Enter your registered email"
                  : forgotStep === "otp"     ? "Enter the OTP sent to your email"
                  : forgotStep === "newpass" ? "Set your new password"
                  : "All done!"
                : "Welcome back — sign in to continue"}
            </Typography>
          </Box>

          {/* Form area */}
          <Box sx={{ backgroundColor: "white", px: 4, pt: 3.5, pb: 4 }}>

            {/* ── Normal login ── */}
            {!forgotStep && (
              <Box component="form" onSubmit={handleLogin}>
                {loginError && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.82rem" }}>
                    {loginError}
                  </Alert>
                )}

                <TextField
                  label="Email Address" type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                  onFocus={() => setCharState("watching")}
                  fullWidth required sx={{ mb: 2.5 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#2563eb", fontSize: 19 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Password" type="text"
                  value={displayVal}
                  onChange={handlePassChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  fullWidth required
                  sx={{
                    mb: 2,
                    "& input": { letterSpacing: showPass ? "normal" : "0.18em", fontFamily: "monospace" },
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" onClick={() => setShowPass((v) => !v)}>
                            {showPass
                              ? <VisibilityOffIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                              : <VisibilityIcon   sx={{ fontSize: 20, color: "#2563eb" }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit" variant="contained" size="large" fullWidth disabled={loading}
                  sx={{
                    backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" },
                    py: 1.5, borderRadius: 2.5,
                    fontWeight: "bold", fontSize: "0.95rem", letterSpacing: 1.8,
                    mb: 1.5, boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
                  }}
                >
                  {loading ? "Signing in…" : "LOGIN"}
                </Button>

                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Button size="small" onClick={openForgot}
                    sx={{
                      color: "#6b7280", fontWeight: "normal", p: 0, minWidth: "auto",
                      fontSize: "0.83rem", textTransform: "none",
                      "&:hover": { backgroundColor: "transparent", color: "#2563eb" },
                    }}
                  >
                    Forgotten password?
                  </Button>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Typography component="span" color="text.secondary" fontSize="0.85rem">
                    Don't have an account?{" "}
                  </Typography>
                  <Button size="small" onClick={() => setShowRegister(true)}
                    sx={{
                      color: "#2563eb", fontWeight: "bold", p: 0, minWidth: "auto",
                      fontSize: "0.85rem", textTransform: "none",
                      "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                    }}
                  >
                    Register here
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── Step 1: Enter email ── */}
            {forgotStep === "email" && (
              <Box component="form" onSubmit={handleSendOtp}>
                {forgotError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>{forgotError}</Alert>}

                <TextField
                  label="Registered Email" type="email"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                  onFocus={() => setCharState("watching")}
                  fullWidth required sx={{ mb: 3 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#2563eb", fontSize: 19 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit" variant="contained" size="large" fullWidth
                  disabled={forgotLoading}
                  sx={{
                    backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" },
                    py: 1.5, borderRadius: 2.5, fontWeight: "bold",
                    fontSize: "0.95rem", letterSpacing: 1.5,
                    mb: 2, boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
                  }}
                >
                  {forgotLoading ? "Sending OTP…" : "SEND OTP"}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Button size="small" startIcon={<ArrowBackIcon />} onClick={closeForgot}
                    sx={{ color: "#6b7280", textTransform: "none", fontSize: "0.83rem",
                      "&:hover": { backgroundColor: "transparent", color: "#2563eb" } }}>
                    Back to login
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── Step 2: Enter OTP ── */}
            {forgotStep === "otp" && (
              <Box component="form" onSubmit={handleVerifyOtp}>
                {forgotMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>{forgotMsg}</Alert>}
                {forgotError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>{forgotError}</Alert>}

                <Typography sx={{ fontSize: "0.82rem", color: "#6b7280", mb: 2, textAlign: "center" }}>
                  A 6-digit OTP was sent to <strong style={{ color: "#1d4ed8" }}>{forgotEmail}</strong>
                </Typography>

                <TextField
                  label="Enter OTP"
                  value={forgotOtp}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForgotOtp(v); setForgotError("");
                  }}
                  onFocus={() => setCharState("watching")}
                  fullWidth required sx={{ mb: 3 }}
                  inputProps={{ inputMode: "numeric", maxLength: 6 }}
                  slotProps={{
                    input: {
                      sx: { letterSpacing: "0.5em", fontWeight: "bold", fontSize: "1.3rem", textAlign: "center" },
                    },
                  }}
                />

                <Button
                  type="submit" variant="contained" size="large" fullWidth
                  sx={{
                    backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" },
                    py: 1.5, borderRadius: 2.5, fontWeight: "bold",
                    fontSize: "0.95rem", letterSpacing: 1.5,
                    mb: 1.5, boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
                  }}
                >
                  VERIFY OTP
                </Button>

                <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 2 }}>
                  <Button size="small" onClick={() => { setForgotStep("email"); setForgotMsg(""); setForgotError(""); }}
                    sx={{ color: "#6b7280", textTransform: "none", fontSize: "0.83rem",
                      "&:hover": { backgroundColor: "transparent", color: "#2563eb" } }}>
                    Resend OTP
                  </Button>
                  <Button size="small" startIcon={<ArrowBackIcon />} onClick={closeForgot}
                    sx={{ color: "#6b7280", textTransform: "none", fontSize: "0.83rem",
                      "&:hover": { backgroundColor: "transparent", color: "#2563eb" } }}>
                    Back to login
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── Step 3: New password ── */}
            {forgotStep === "newpass" && (
              <Box component="form" onSubmit={handleResetPassword}>
                {forgotError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>{forgotError}</Alert>}

                <TextField
                  label="New Password" type="text"
                  value={showNew ? newPass.real : newPass.masked}
                  onChange={makeNewPassChange(newPass, showNew)}
                  onFocus={handlePasswordFocus} onBlur={handlePasswordBlur}
                  fullWidth required
                  sx={{ mb: 2, "& input": { letterSpacing: showNew ? "normal" : "0.18em", fontFamily: "monospace" } }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" onClick={() => setShowNew((v) => !v)}>
                            {showNew
                              ? <VisibilityOffIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                              : <VisibilityIcon   sx={{ fontSize: 20, color: "#2563eb" }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Confirm New Password" type="text"
                  value={showConfirm ? confirmPass.real : confirmPass.masked}
                  onChange={makeNewPassChange(confirmPass, showConfirm)}
                  onFocus={handlePasswordFocus} onBlur={handlePasswordBlur}
                  fullWidth required
                  sx={{ mb: 3, "& input": { letterSpacing: showConfirm ? "normal" : "0.18em", fontFamily: "monospace" } }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" onClick={() => setShowConfirm((v) => !v)}>
                            {showConfirm
                              ? <VisibilityOffIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                              : <VisibilityIcon   sx={{ fontSize: 20, color: "#2563eb" }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit" variant="contained" size="large" fullWidth
                  disabled={forgotLoading}
                  sx={{
                    backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" },
                    py: 1.5, borderRadius: 2.5, fontWeight: "bold",
                    fontSize: "0.95rem", letterSpacing: 1.5,
                    mb: 2, boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
                  }}
                >
                  {forgotLoading ? "Resetting…" : "RESET PASSWORD"}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Button size="small" startIcon={<ArrowBackIcon />} onClick={closeForgot}
                    sx={{ color: "#6b7280", textTransform: "none", fontSize: "0.83rem",
                      "&:hover": { backgroundColor: "transparent", color: "#2563eb" } }}>
                    Back to login
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── Done ── */}
            {forgotStep === "done" && (
              <Box>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {forgotMsg}
                </Alert>
                <Button
                  variant="contained" size="large" fullWidth
                  onClick={closeForgot}
                  sx={{
                    backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" },
                    py: 1.5, borderRadius: 2.5, fontWeight: "bold",
                    fontSize: "0.95rem", letterSpacing: 1.5,
                    boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
                  }}
                >
                  BACK TO LOGIN
                </Button>
              </Box>
            )}

          </Box>
        </Box>
      </Box>
    </>
  );
}
