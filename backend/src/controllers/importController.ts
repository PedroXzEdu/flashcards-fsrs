import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { pool } from "../database/db";
import { createEmptyCard } from "ts-fsrs";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import Database from "better-sqlite3";
import { promisify } from "util";
import { pipeline } from "stream";
import { AppError } from "../utils/AppError";

const streamPipeline = promisify(pipeline);

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

    const deckName = req.file.originalname.replace(".apkg", "");

    const deckResult = await pool.query(
      `INSERT INTO decks (user_id, title, description, is_public)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [req.userId, deckName, `Importado do Anki`],
    );
    const deck = deckResult.rows[0];

    const emptyCard = createEmptyCard();
    let imported = 0;
    let skipped = 0;

    for (const note of notes) {
      const fields = note.flds.split("\x1f");
      const front = fields[0]?.trim();
      const back = fields[1]?.trim();

      if (!front || !back) {
        skipped++;
        continue;
      }

      const processedFront = processMidiaRefs(front);
      const processedBack = processMidiaRefs(back);

      await pool.query(
        `INSERT INTO cards
          (deck_id, front, back, stability, difficulty, elapsed_days,
           scheduled_days, reps, lapses, state, due)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          deck.id,
          processedFront,
          processedBack,
          emptyCard.stability,
          emptyCard.difficulty,
          emptyCard.elapsed_days,
          emptyCard.scheduled_days,
          emptyCard.reps,
          emptyCard.lapses,
          emptyCard.state,
          emptyCard.due,
        ],
      );
      imported++;
    }

    res.json({
      success: true,
      data: {
        deck,
        imported,
        skipped,
        message: `${imported} cards importados com sucesso!`,
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
  // Converte [sound:arquivo.mp3] em tag de áudio HTML
  let result = text.replace(
    /\[sound:(.*?)\]/g,
    (_, filename) => `<audio controls src="/media/${filename}"></audio>`,
  );

  // Garante que imagens já em HTML apontem para /media/
  result = result.replace(
    /<img([^>]*?)src="(?!http|\/media)(.*?)"([^>]*?)>/g,
    (_, before, src, after) => `<img${before}src="/media/${src}"${after}>`,
  );

  return result;
}
