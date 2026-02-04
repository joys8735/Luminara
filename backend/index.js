import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const users = new Map();

/* =======================
   CONFIG
======================= */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const PORT = process.env.PORT || 4000;

/* =======================
   MIDDLEWARE (ORDER MATTERS)
======================= */

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  name: "auth_session",
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =======================
   PASSPORT
======================= */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user || null);
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        provider: "google",
        createdAt: new Date()
      };

      users.set(user.id, user);
      console.log("✅ Google login:", user.email);

      return done(null, user);
    } catch (e) {
      return done(e, null);
    }
  }
));


/* =======================
   AUTH ROUTES
======================= */

app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login-error`
  }),
  (req, res) => {
    res.send(`
      <html>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:white;font-family:sans-serif">
          <div>
            <h2>✅ Login successful</h2>
            <p>You can close this window</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS" }, "*");
            }
            setTimeout(() => window.close(), 1000);
          </script>
        </body>
      </html>
    `);
  }
);

app.get("/auth/user", (req, res) => {
  if (!req.user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("auth_session");
      res.json({ success: true });
    });
  });
});

/* =======================
   UTILS
======================= */

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* =======================
   404
======================= */

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* =======================
   START SERVER
======================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Frontend: ${FRONTEND_URL}`);
});
