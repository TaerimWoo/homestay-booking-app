import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import HomeIcon          from "@mui/icons-material/Home";
import EmailIcon         from "@mui/icons-material/Email";
import LockIcon          from "@mui/icons-material/Lock";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LOGIN_USER } from "../graphql";

/*
  Last-character-only peek hook.
  The input renders as type="text" with a manually masked value:
    hidden mode   → "•••••"
    peeking mode  → "••••a"   (last char visible for 1 s after each keystroke)
    revealed mode → "abc123"  (manual toggle)
*/
function useLastCharPeek() {
  const [real,    setReal]    = useState("");
  const [peeking, setPeeking] = useState(false);
  const timer = useRef(null);

  // What the <input> shows
  const masked =
    real.length === 0
      ? ""
      : "•".repeat(peeking ? real.length - 1 : real.length) +
        (peeking ? real[real.length - 1] : "");

  // Called when the field is in masked mode (normal typing / delete)
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

  // Called when the field is in revealed mode (show-password toggle on)
  const onRevealed = (val) => {
    setReal(val);
    setPeeking(false);
    clearTimeout(timer.current);
  };

  return { real, masked, onMasked, onRevealed, peeking };
}

/* ── floating background shapes ── */
const BUBBLES = [
  { s: 58,  top: "7%",    left: "6%",    dur: "4.2s", del: "0s"   },
  { s: 40,  top: "14%",   right: "8%",   dur: "3.7s", del: "0.6s" },
  { s: 74,  bottom:"11%", left: "7%",    dur: "5.1s", del: "1.3s" },
  { s: 50,  bottom:"18%", right: "6%",   dur: "4.6s", del: "0.2s" },
  { s: 34,  top: "54%",   left: "3%",    dur: "3.9s", del: "1.9s" },
  { s: 46,  top: "38%",   right: "4%",   dur: "4.9s", del: "2.1s" },
  { s: 30,  top: "72%",   right: "13%",  dur: "3.5s", del: "1.0s" },
  { s: 62,  top: "30%",   left: "14%",   dur: "4.4s", del: "2.7s" },
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

export default function Login({ setCurrentUser, setShowRegister }) {
  const pass = useLastCharPeek();
  const [email,      setEmail]      = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginUser, { loading }]    = useMutation(LOGIN_USER);

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

  const displayVal = showPass ? pass.real : pass.masked;
  const eyeOpen    = showPass || pass.peeking;

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
          width: "100%", maxWidth: 390,
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
            py: 5, px: 3, textAlign: "center",
          }}>
            <Box sx={{
              width: 82, height: 82,
              backgroundColor: "rgba(255,255,255,0.10)",
              border: "2px solid rgba(255,255,255,0.18)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 2.5,
              animation: "logoPulse 2.4s ease-in-out infinite",
            }}>
              <HomeIcon sx={{ color: "white", fontSize: 44 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="white" letterSpacing={2} sx={{ mb: 0.5 }}>
              HOMESTAY SYSTEM
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
              Welcome back — sign in to continue
            </Typography>
          </Box>

          {/* form */}
          <Box component="form" onSubmit={handleLogin} sx={{ px: 4, pt: 4, pb: 4.5 }}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.82rem" }}>
                {loginError}
              </Alert>
            )}

            <TextField
              label="Email Address" type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
              fullWidth required sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#16a34a", fontSize: 19 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type="text"
              value={displayVal}
              onChange={(e) => {
                setLoginError("");
                showPass ? pass.onRevealed(e.target.value) : pass.onMasked(e);
              }}
              fullWidth required
              sx={{
                mb: 3.5,
                "& input": {
                  letterSpacing: showPass ? "normal" : "0.18em",
                  fontFamily: "monospace",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#16a34a", fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setShowPass((v) => !v)}>
                      {eyeOpen
                        ? <VisibilityOffIcon sx={{ fontSize: 19, color: "#9ca3af" }} />
                        : <VisibilityIcon   sx={{ fontSize: 19, color: "#9ca3af" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit" variant="contained" size="large" fullWidth disabled={loading}
              sx={{
                backgroundColor: "#16a34a",
                "&:hover": { backgroundColor: "#15803d" },
                py: 1.5, borderRadius: 2.5,
                fontWeight: "bold", fontSize: "0.95rem", letterSpacing: 1.8,
                mb: 3,
                boxShadow: "0 4px 18px rgba(22,163,74,0.45)",
              }}
            >
              {loading ? "Signing in…" : "LOGIN"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography component="span" color="text.secondary" fontSize="0.85rem">
                Don't have an account?{" "}
              </Typography>
              <Button size="small" onClick={() => setShowRegister(true)}
                sx={{
                  color: "#16a34a", fontWeight: "bold", p: 0, minWidth: "auto",
                  fontSize: "0.85rem", textTransform: "none",
                  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                }}
              >
                Register here
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
