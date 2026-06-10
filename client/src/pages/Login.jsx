import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import EmailIcon         from "@mui/icons-material/Email";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LOGIN_USER } from "../graphql";

/* ── Last-character-only peek ── */
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

  return { real, masked, onMasked, onRevealed, peeking };
}

/* ── Cute bear character ── */
function Bear({ state }) {
  // state: "watching" | "hiding" | "peeking"
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
      {/* ── ears ── */}
      <circle cx="21"  cy="28" r="17" fill="#D4956A"/>
      <circle cx="21"  cy="28" r="11" fill="#C0784A"/>
      <circle cx="99"  cy="28" r="17" fill="#D4956A"/>
      <circle cx="99"  cy="28" r="11" fill="#C0784A"/>

      {/* ── face ── */}
      <circle cx="60" cy="63" r="42" fill="#F2C272"/>

      {/* ── blush ── */}
      <circle cx="29" cy="75" r="13" fill="rgba(255,120,120,0.22)"/>
      <circle cx="91" cy="75" r="13" fill="rgba(255,120,120,0.22)"/>

      {/* ── eye whites ── */}
      <circle cx="43" cy="55" r="11" fill="white"/>
      <circle cx="77" cy="55" r="11" fill="white"/>

      {/* ── pupils (shift with state) ── */}
      <circle cx="45" cy={56 + dy} r="7" fill="#1a0f08" style={{ transition: "all 0.3s ease" }}/>
      <circle cx="79" cy={56 + dy} r="7" fill="#1a0f08" style={{ transition: "all 0.3s ease" }}/>

      {/* ── eye shine ── */}
      <circle cx="42" cy={52 + dy} r="2.2" fill="white" style={{ transition: "all 0.3s ease" }}/>
      <circle cx="76" cy={52 + dy} r="2.2" fill="white" style={{ transition: "all 0.3s ease" }}/>

      {/* ── snout ── */}
      <ellipse cx="60" cy="75" rx="17" ry="12" fill="#E8A060"/>

      {/* ── nose ── */}
      <ellipse cx="60" cy="70" rx="7"  ry="4.5" fill="#5C2E1A"/>

      {/* ── mouth ── */}
      {state === "hiding"
        ? <path d="M 52 80 Q 60 78 68 80" stroke="#5C2E1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        : <path d="M 51 80 Q 60 90 69 80" stroke="#5C2E1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      }

      {/* ── arms / hands (animated up-down) ── */}
      <g style={{ transform: `translateY(${t}px)`, transition: spring }}>
        {/* left arm */}
        <rect x="1"  y="46" width="44" height="28" rx="14" fill="#D4956A"/>
        <circle cx="11" cy="41" r="9"  fill="#D4956A"/>
        <circle cx="23" cy="37" r="10" fill="#D4956A"/>
        <circle cx="36" cy="41" r="9"  fill="#D4956A"/>

        {/* right arm */}
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
  const [loginUser, { loading }] = useMutation(LOGIN_USER);

  const handlePasswordFocus = () => setCharState("hiding");
  const handlePasswordBlur  = () => setCharState("watching");

  const handlePassChange = (e) => {
    setLoginError("");
    showPass ? pass.onRevealed(e.target.value) : pass.onMasked(e);
    // Peek briefly when typing password
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

  const displayVal = showPass ? pass.real : pass.masked;
  const eyeOpen    = showPass || pass.peeking;

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
        {/* ── Card ── */}
        <Box sx={{
          width: "100%", maxWidth: 400,
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
          animation: "cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>

          {/* green header with bear */}
          <Box sx={{
            background: "linear-gradient(160deg, #0f1f3d 0%, #1d4ed8 100%)",
            pt: 4, pb: 3, px: 3,
            textAlign: "center",
            overflow: "hidden",
          }}>
            <Bear state={charState} />
            <Typography variant="h6" fontWeight="bold" color="white" letterSpacing={2} sx={{ mt: 2 }}>
              HOMESTAY SYSTEM
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", mt: 0.3 }}>
              Welcome back — sign in to continue
            </Typography>
          </Box>

          {/* white form */}
          <Box component="form" onSubmit={handleLogin}
            sx={{ backgroundColor: "white", px: 4, pt: 3.5, pb: 4 }}>

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
                mb: 3.5,
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
                mb: 3, boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
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
                  color: "#2563eb", fontWeight: "bold", p: 0, minWidth: "auto",
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
