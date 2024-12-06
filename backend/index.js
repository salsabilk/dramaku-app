const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { sequelize, User } = require("./models");
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Tambah paket Google OAuth 2.0

dotenv.config();

// Gunakan variabel dari .env
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET; // JWT_SECRET untuk session

// Konfigurasi express-session untuk mengelola sesi
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true, // Aktifkan cookie aman di production
      httpOnly: true, // Cegah akses JavaScript ke cookie
    },
  })
);

// Middleware express
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.CLIENT_URL],
    credentials: true,
  })
);

// Inisialisasi Passport dan sesi
app.use(passport.initialize());
app.use(passport.session());

// Konfigurasi Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.SERVER_URL + "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile);

        // Cek user yang ada
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (user) {
          console.log("Existing user found:", user.id);
          return done(null, user);
        }

        // Buat user baru
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
          role: "User",
          is_verified: true, // User Google otomatis terverifikasi
          is_suspended: false,
        });

        console.log("New user created:", user.id);
        return done(null, user);
      } catch (error) {
        console.error("Google strategy error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

// Route autentikasi Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback setelah login sukses dari Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role || "User", // Pastikan role selalu ada
          username: req.user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Simpan token ke session
      req.session.token = token;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        console.log("Session saved successfully:", req.session);
        res.redirect(process.env.CLIENT_URL);
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect("/auth/error");
    }
  }
);

// Route logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/session", (req, res) => {
  try {
    console.log("Session request received");
    console.log("Session data:", req.session);

    if (req.session && req.session.token) {
      res.json({
        success: true,
        token: req.session.token,
      });
    } else {
      console.log("No token in session");
      res.status(401).json({
        success: false,
        message: "No session token found",
      });
    }
  } catch (error) {
    console.error("Session endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    req.logout(); // Jika menggunakan passport.js
    res.redirect("/"); // Redirect ke halaman utama setelah logout
  });
});

app.use("/api", require("./routes/drama"));
app.use("/auth", require("./routes/auth"));

// const PORT = 3000;
const PORT = process.env.NODE_ENV === "test" ? 0 : 3001;

app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});

module.exports = app;
