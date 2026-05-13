import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middlewares/auth";
import { importApkg } from "../controllers/importController";

const uploadDir = path.join(__dirname, "../../uploads/tmp");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith(".apkg")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .apkg são aceitos."));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const router = Router();
router.use(authMiddleware);
router.post("/", upload.single("file"), importApkg);

export default router;
