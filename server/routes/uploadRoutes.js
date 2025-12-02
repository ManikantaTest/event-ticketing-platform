const express = require("express");
const multer = require("multer");
const { UploadImage } = require("../controllers/uploadController.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/uploadImage", upload.single("image"), UploadImage);
module.exports = router;
