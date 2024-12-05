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

// Konfigurasi session
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // gunakan secure di production
      maxAge: 1000 * 60 * 60 * 24, // 24 jam
    },
  })
);

// Konfigurasi CORS yang lebih spesifik
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.CLIENT_URL],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Inisialisasi Passport dan sesi
app.use(passport.initialize());
app.use(passport.session());

// Konfigurasi Google Strategy
const { Op } = require("sequelize"); // Tambahkan impor Op

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.SERVER_URL + "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile); // Tambahkan logging

        // Cari user berdasarkan googleId atau email
        const existingUser = await User.findOne({
          where: {
            [Op.or]: [
              { googleId: profile.id },
              { email: profile.emails[0].value },
            ],
          },
        });

        if (existingUser) {
          // Update googleId jika belum ada
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
            await existingUser.save();
          }
          return done(null, existingUser);
        }

        // Buat user baru jika tidak ditemukan
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName.replace(/\s+/g, "_").toLowerCase(), // Buat username unik
          email: profile.emails[0].value,
          photo: profile.photos[0]?.value || null,
          is_verified: true, // Langsung verifikasi user Google
          password: null, // Tidak memerlukan password untuk login Google
        });

        return done(null, newUser);
      } catch (error) {
        console.error("Google Authentication Error:", error);
        return done(error, false);
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
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL + "/login",
    session: true, // Pastikan session diaktifkan
  }),
  (req, res) => {
    try {
      // Pastikan req.user ada
      if (!req.user) {
        return res.redirect(
          process.env.CLIENT_URL + "/login?error=authentication_failed"
        );
      }

      // Generate token dengan informasi user
      const token = jwt.sign(
        {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          is_suspended: req.user.is_suspended,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Simpan token di session
      req.session.token = token;

      // Redirect ke halaman utama dengan token
      res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    } catch (error) {
      console.error("Callback Error:", error);
      res.redirect(process.env.CLIENT_URL + "/login?error=server_error");
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
  if (req.session.token) {
    try {
      // Verifikasi token
      const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET);
      res.json({ token: req.session.token, user: decoded });
    } catch (error) {
      // Token invalid
      req.session.destroy(); // Hapus session
      res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ message: "No active session" });
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
