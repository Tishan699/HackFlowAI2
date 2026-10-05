const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/submissions');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 20MB Max File Size limit
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Generate clean sanitized filename with timestamp prefix
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter: Allow PDF, docs, archives, slides, diagrams
const fileFilter = (req, file, cb) => {
  const allowedExts = [
    '.pdf',
    '.zip',
    '.tar',
    '.gz',
    '.rar',
    '.7z',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.txt',
    '.md'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type '${ext}'. Please upload PDF, ZIP, PPTX, or image files up to 20MB.`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10
  },
  fileFilter
});

module.exports = {
  upload,
  MAX_FILE_SIZE,
  UPLOAD_DIR
};
