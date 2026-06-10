import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import HomeIcon          from "@mui/icons-material/Home";
import PersonIcon        from "@mui/icons-material/Person";
import EmailIcon         from "@mui/icons-material/Email";
import LockIcon          from "@mui/icons-material/Lock";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { REGISTER_USER } from "../graphql";

function useLastCharPeek() {
  const [real,    setReal]    = useState("");
  const [peeking, setPeeking] = useState(false);
  const timer = useRef(null);

  const masked =
    real.length === 0
      ? ""
      : "•".repeat(peeking ? real.length - 1 : real.length) +
        (peeking ? real[real.length - 1] : "");

  const onMasked = (e) => {
    const next = e.target.value;
    const prev = masked;
    if (next.length > prev.length) {
      const added = next.slice(prev.length);
      setReal((r) => r + added);
      setPeeking(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPeeking(false), 1000);
    } else if (next.length < prev.length) {
      const diff = prev.length - next.length;
      setReal((r) => r.slice(0, r.length - diff));
      setPeeking(false);
      clearTimeout(timer.current);
    }
  };

  const onRevealed = (val) => {
    setReal(val);
    setPeeking(false);
    clearTimeout(timer.current);
  };

  return { real, masked, onMasked, onRevealed, peeking };
}

/* ── floating background shapes ── */
const BUBBLES = [
  { s: 54,  top: "6%",    left: "5%",    dur: "4.0s", del: "0s"   },
  { s: 38,  top: "18%",   right: "7%",   dur: "3.5s", del: "0.8s" },
  { s: 70,  bottom:"13%", left: "8%",    dur: "5.2s", del: "1.5s" },
  { s: 48,  bottom:"20%", right: "5%",   dur: "4.4s", del: "0.4s" },
  { s: 32,  top: "52%",   left: "2%",    dur: "3.7s", del: "2.0s" },
  { s: 44,  top: "35%",   right: "3%",   dur: "4.7s", del: "2.3s" },
  { s: 28,  top: "70%",   right: "14%",  dur: "3.3s", del: "1.2s" },
  { s: 60,  top: "28%",   left: "13%",   dur: "4.5s", del: "2.8s" },
];

function FloatBg() {
  return (
    <>
      {BUBBLES.map((b, i) => (
        <Box key={i} sx={{
          position: "fixed",
          width: b.s, height: b.s,
          top: b.top, bottom: b.bottom, left: b.left, right: b.right,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.10)",
          backgroundColor: "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          animationName: "bubbleFloat",
          animationDuration: b.dur,
          animationDelay: b.del,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        }}>
          <HomeIcon sx={{ color: "rgba(255,255,255,0.20)", fontSize: b.s * 0.44 }} />
        </Box>
      ))}
    </>
  );
}

export default function Register({ setShowRegister }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const pass    = useLastCharPeek();
  const confirm = useLastCharPeek();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [success,   setSuccess]   = useState(false);

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    if (pass.real.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (pass.real !== confirm.real) {
      setFormError("Passwords do not match. Please try again.");
      return;
    }
    try {
      await registerUser({ variables: { name, email, password: pass.real } });
      setSuccess(true);
      setTimeout(() => setShowRegister(false), 1800);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
    }
  };

  const passDisplay    = showPass    ? pass.real    : pass.masked;
  const confirmDisplay = showConfirm ? confirm.real : confirm.masked;
  const passEyeOpen    = showPass    || pass.peeking;
  const confirmEyeOpen = showConfirm || confirm.peeking;

  const monoField = (show, peek) => ({
    "& input": {
      letterSpacing: show ? "normal" : "0.18em",
      fontFamily: "monospace",
    },
  });

  return (
    <>
      <style>{`
        @keyframes bubbleFloat {
          0%,100% { transform: translateY(0px) rotate(0deg);  }
          50%      { transform: translateY(-20px) rotate(7deg); }
        }
        @keyframes cardIn {
          from { opacity:0; transform: translateY(28px) scale(0.96); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(255,255,255,0.18); }
          50%      { box-shadow: 0 0 0 10px rgba(255,255,255,0);   }
        }
      `}</style>

      <Box sx={{
        minHeight: "100vh",
        background: "linear-gradient(140deg, #021d10 0%, #14532d 50%, #166534 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        p: 3, overflow: "hidden", position: "relative",
      }}>
        <FloatBg />

        {/* ── Card ── */}
        <Box sx={{
          width: "100%", maxWidth: 420,
          backgroundColor: "white",
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 36px 90px rgba(0,0,0,0.5)",
          animation: "cardIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards",
          position: "relative", zIndex: 1,
        }}>

          {/* header */}
          <Box sx={{
            background: "linear-gradient(145deg, #021d10 0%, #166534 100%)",
            py: 4.5, px: 3, textAlign: "center",
          }}>
            <Box sx={{
              width: 82, height: 82,
              backgroundColor: "rgba(255,255,255,0.10)",
              border: "2px solid rgba(255,255,255,0.18)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 2,
              animation: "logoPulse 2.4s ease-in-out infinite",
            }}>
              <HomeIcon sx={{ color: "white", fontSize: 44 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="white" letterSpacing={2} sx={{ mb: 0.5 }}>
              CREATE ACCOUNT
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
              Join Homestay System today
            </Typography>
          </Box>

          {/* form */}
          <Box component="form" onSubmit={handleRegister} sx={{ px: 4, pt: 3.5, pb: 4.5 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>
                {formError}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>
                Registration successful! Redirecting to login…
              </Alert>
            )}

            <TextField
              label="Full Name" value={name}
              onChange={(e) => { setName(e.target.value); setFormError(""); }}
              fullWidth required sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#16a34a", fontSize: 19 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email Address" type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
              fullWidth required sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#16a34a", fontSize: 19 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password" type="text"
              value={passDisplay}
              onChange={(e) => {
                setFormError("");
                showPass ? pass.onRevealed(e.target.value) : pass.onMasked(e);
              }}
              fullWidth required sx={{ mb: 2, ...monoField(showPass) }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#16a34a", fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setShowPass((v) => !v)}>
                      {passEyeOpen
                        ? <VisibilityOffIcon sx={{ fontSize: 19, color: "#9ca3af" }} />
                        : <VisibilityIcon   sx={{ fontSize: 19, color: "#9ca3af" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password" type="text"
              value={confirmDisplay}
              onChange={(e) => {
                setFormError("");
                showConfirm ? confirm.onRevealed(e.target.value) : confirm.onMasked(e);
              }}
              fullWidth required sx={{ mb: 3.5, ...monoField(showConfirm) }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#16a34a", fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setShowConfirm((v) => !v)}>
                      {confirmEyeOpen
                        ? <VisibilityOffIcon sx={{ fontSize: 19, color: "#9ca3af" }} />
                        : <VisibilityIcon   sx={{ fontSize: 19, color: "#9ca3af" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit" variant="contained" size="large" fullWidth
              disabled={loading || success}
              sx={{
                backgroundColor: "#16a34a",
                "&:hover": { backgroundColor: "#15803d" },
                py: 1.5, borderRadius: 2.5,
                fontWeight: "bold", fontSize: "0.95rem", letterSpacing: 1.8,
                mb: 3,
                boxShadow: "0 4px 18px rgba(22,163,74,0.45)",
              }}
            >
              {loading ? "Creating account…" : "REGISTER"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography component="span" color="text.secondary" fontSize="0.85rem">
                Already have an account?{" "}
              </Typography>
              <Button size="small" onClick={() => setShowRegister(false)}
                sx={{
                  color: "#16a34a", fontWeight: "bold", p: 0, minWidth: "auto",
                  fontSize: "0.85rem", textTransform: "none",
                  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                }}
              >
                Login here
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
