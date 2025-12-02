const cloudinary = require("cloudinary").v2;
cloudinary.config();

const UploadImage = (req, res) => {
  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "events" },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ url: result.secure_url });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  UploadImage,
};
