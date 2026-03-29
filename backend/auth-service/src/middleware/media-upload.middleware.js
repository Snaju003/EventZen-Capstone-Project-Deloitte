const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.config");

const allowedFolders = new Set(["events", "venues"]);

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const requestedFolder = typeof req.body?.folder === "string" ? req.body.folder.trim().toLowerCase() : "";
    const safeFolder = allowedFolders.has(requestedFolder) ? requestedFolder : "events";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    return {
      folder: `eventzen/${safeFolder}`,
      allowed_formats: ["jpeg", "png", "jpg", "webp"],
      public_id: `${safeFolder}-${uniqueSuffix}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."), false);
};

const mediaUpload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = mediaUpload;
