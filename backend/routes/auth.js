const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { User } = require("../models");
const { Op } = require("sequelize");
const dotenv = require("dotenv");
const crypto = require("crypto");
const authenticateToken = require("../midleware/authMiddleware");
const generateVerificationToken = require("../utils/tokenGenerator");
const sendVerificationEmail = require("../utils/sendEmail");
const sendResetPasswordEmail = require("../utils/resetPasswordEmail");

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.reset_password_token = hashedToken;
    user.reset_password_expires = Date.now() + 300000;
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    res.json({ message: "Reset password email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        reset_password_token: hashedToken,
        reset_password_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});


// Register
router.post("/register", async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  // Validasi input
  if (!email || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Cek apakah email sudah digunakan
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Cek apakah username sudah digunakan
  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    return res.status(400).json({ message: "Username already in use" });
  }

  try {
    // Hash password sebelum menyimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate token verifikasi
    const verificationToken = generateVerificationToken();

    // Buat pengguna baru
    const user = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      verification_token: verificationToken, // Tambahkan token verifikasi
      is_verified: false, // Set default ke false
    });

    // Kirim email verifikasi
    await sendVerificationEmail(user.email, verificationToken);

    // Simpan pengguna ke database
    // await user.save();

    // Berikan respons sukses
    res.status(201).json({
      message: "User registered successfully. Verification email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

router.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    // Cari user berdasarkan verification_token
    const user = await User.findOne({
      where: {
        verification_token: token,
        is_verified: false, // Pastikan token belum digunakan
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Token verifikasi tidak valid atau sudah digunakan",
      });
    }

    // Update status verifikasi user
    user.is_verified = true;
    user.verification_token = null; // Clear token setelah terverifikasi
    await user.save();

    res.json({
      success: true,
      message: "Email berhasil diverifikasi",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server. Silakan coba lagi.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Cari user berdasarkan email atau username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Cek apakah user disuspend
    if (user.is_suspended) {
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_suspended: user.is_suspended,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
// router.post("/login", async (req, res) => {
//   try {
//     const { emailOrUsername, password } = req.body;
//     // Cari user berdasarkan email atau username menggunakan Sequelize
//     const user = await User.findOne({
//       where: {
//         [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
//       },
//     });

//     // Jika user tidak ditemukan atau password salah
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).send("Invalid credentials");
//     }

//     // Generate JWT token dengan user ID
//     const token = jwt.sign(
//       {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.json({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// Google Auth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/protected", authenticateToken, (req, res) => {
  res.json({ access: true, message: "You have access!", user: req.user });
});

module.exports = router;
