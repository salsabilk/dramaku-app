// middleware/upload.js
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");
const DatauriParser = require("datauri/parser");
const path = require("path");

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("photo");

const parser = new DatauriParser();

const dataUri = (req) =>
  parser.format(
    path.extname(req.file.originalname).toString(),
    req.file.buffer
  );

const uploadToCloudinary = async (req, res, next) => {
  if (req.file) {
    const file = dataUri(req).content;
    try {
      const result = await cloudinary.uploader.upload(file);
      req.body.photo = result.secure_url; // Save the URL to req.body.photo
      next();
    } catch (error) {
      return res.status(400).json({
        message: "Something went wrong while processing your request",
        data: error,
      });
    }
  } else {
    next();
  }
};

module.exports = { multerUploads, uploadToCloudinary };

// middleware/upload.js
// const multer = require("multer");
// const cloudinary = require("../config/cloudinaryConfig");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "photos", // Nama folder di Cloudinary
//     format: async (req, file) => "jpg", // Tentukan format file
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
