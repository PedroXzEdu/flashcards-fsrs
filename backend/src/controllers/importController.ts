import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import Database from "better-sqlite3";
import { AppError } from "../utils/AppError";
import { importService } from "../services/importService";
import { env } from "../config/env";

interface AnkiNote {
  id: number;
  flds: string;
  tags: string;
}

interface MediaMap {
  [key: string]: string;
}

export async function importApkg(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  let apkgPath: string | undefined;
  let extractDir: string | undefined;

  try {
    if (!req.file) {
      throw new AppError("Nenhum arquivo enviado.", 400);
    }

    apkgPath = req.file.path;
    extractDir = `${apkgPath}_extracted`;
    const mediaDir = path.join(__dirname, "../../uploads/media");

    fs.mkdirSync(extractDir, { recursive: true });
    fs.mkdirSync(mediaDir, { recursive: true });

    await fs
      .createReadStream(apkgPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    const dbPath = path.join(extractDir, "collection.anki2");
    if (!fs.existsSync(dbPath)) {
      throw new AppError("Arquivo .apkg inválido ou corrompido.", 400);
    }

    const db = new Database(dbPath, { readonly: true });

    let mediaMap: MediaMap = {};
    const mediaJsonPath = path.join(extractDir, "media");
    if (fs.existsSync(mediaJsonPath)) {
      const raw = fs.readFileSync(mediaJsonPath, "utf-8");
      mediaMap = JSON.parse(raw);
    }

    for (const [numericKey, filename] of Object.entries(mediaMap)) {
      const srcPath = path.join(extractDir, numericKey);
      const destPath = path.join(mediaDir, filename as string);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    const notes = db
      .prepare("SELECT id, flds, tags FROM notes")
      .all() as AnkiNote[];
    db.close();

    const notesData = notes.map((note) => {
      const fields = note.flds.split("\x1f");
      return {
        front: processMidiaRefs(fields[0]?.trim() || ""),
        back: processMidiaRefs(fields[1]?.trim() || ""),
      };
    });

    const result = await importService.createDeckFromAnki(
      req.userId!,
      req.file.originalname.replace(".apkg", ""),
      notesData,
    );

    res.json({
      success: true,
      data: {
        ...result,
        message: `${result.imported} cards importados com sucesso!`,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    try {
      if (apkgPath) fs.rmSync(apkgPath, { force: true });
      if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true });
    } catch {
      /* ignora erros de limpeza */
    }
  }
}

function processMidiaRefs(text: string): string {
  const mediaUrl = (path: string) => `${env.mediaBaseUrl}/media/${path}`;

  // Converte [sound:arquivo.mp3] em tag de áudio HTML
  let result = text.replace(
    /\[sound:(.*?)\]/g,
    (_, filename) => `<audio controls src="${mediaUrl(filename)}"></audio>`,
  );

  // Garante que imagens já em HTML apontem para /media/
  result = result.replace(
    /<img([^>]*?)src="(?!http|\/media)(.*?)"([^>]*?)>/g,
    (_, before, src, after) => `<img${before}src="${mediaUrl(src)}"${after}>`,
  );

  return result;
}
