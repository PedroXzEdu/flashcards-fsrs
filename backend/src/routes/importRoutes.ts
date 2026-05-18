import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middlewares/auth";
import { importApkg } from "../controllers/importController";

const uploadDir = path.join(__dirname, "../../uploads/tmp");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIMETYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${unique}-${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk =
      ALLOWED_MIMETYPES.includes(file.mimetype) ||
      file.mimetype === "" ||
      file.mimetype.startsWith("application/");

    if (ext === ".apkg" && mimeOk) {
      cb(null, true);
    } else {
      const err = new Error("Invalid file type") as any;
      err.code = "INVALID_FILE_TYPE";
      cb(err);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();
router.use(authMiddleware);
router.post("/", upload.single("file"), importApkg);

export default router;
