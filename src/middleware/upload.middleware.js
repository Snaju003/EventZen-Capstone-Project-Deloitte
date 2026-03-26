const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.config");

// Set up storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars", // Cloudinary folder name
    allowed_formats: ["jpeg", "png", "jpg", "webp"], // Restrict formats
    // format: async (req, file) => 'png', // Optional: force a format
    public_id: (req, file) => {
      // Create a unique filename without the extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `avatar-${uniqueSuffix}`;
    },
  },
});

// File filter (Optional as Cloudinary handles formats, but good for early rejection)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."), false);
  }
};

// Return the configured multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
