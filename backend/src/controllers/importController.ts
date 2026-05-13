import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { pool } from "../database/db";
import { createEmptyCard } from "ts-fsrs";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import Database from "better-sqlite3";
import { promisify } from "util";
import { pipeline } from "stream";

const streamPipeline = promisify(pipeline);

interface AnkiNote {
  id: number;
  flds: string;
  tags: string;
}

interface MediaMap {
  [key: string]: string;
}

export async function importApkg(req: AuthRequest, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: "Nenhum arquivo enviado." });
    return;
  }

  const apkgPath = req.file.path;
  const extractDir = `${apkgPath}_extracted`;
  const mediaDir = path.join(__dirname, "../../uploads/media");

  try {
    // Garante que as pastas existem
    fs.mkdirSync(extractDir, { recursive: true });
    fs.mkdirSync(mediaDir, { recursive: true });

    // Extrai o .apkg (é um ZIP)
    await fs
      .createReadStream(apkgPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // Lê o banco SQLite do Anki
    const dbPath = path.join(extractDir, "collection.anki2");
    if (!fs.existsSync(dbPath)) {
      res.status(400).json({ error: "Arquivo .apkg inválido ou corrompido." });
      return;
    }

    const db = new Database(dbPath, { readonly: true });

    // Lê o mapa de mídia
    let mediaMap: MediaMap = {};
    const mediaJsonPath = path.join(extractDir, "media");
    if (fs.existsSync(mediaJsonPath)) {
      const raw = fs.readFileSync(mediaJsonPath, "utf-8");
      mediaMap = JSON.parse(raw);
    }

    // Copia arquivos de mídia para a pasta pública
    for (const [numericKey, filename] of Object.entries(mediaMap)) {
      const srcPath = path.join(extractDir, numericKey);
      const destPath = path.join(mediaDir, filename as string);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Lê as notas do banco Anki
    const notes = db
      .prepare("SELECT id, flds, tags FROM notes")
      .all() as AnkiNote[];
    db.close();

    // Descobre o nome do baralho
    let deckName = req.file.originalname.replace(".apkg", "");

    // Cria o baralho no banco
    const deckResult = await pool.query(
      `INSERT INTO decks (user_id, title, description, is_public)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [req.userId, deckName, `Importado do Anki`],
    );
    const deck = deckResult.rows[0];

    // Importa os cards
    const emptyCard = createEmptyCard();
    let imported = 0;
    let skipped = 0;

    for (const note of notes) {
      const fields = note.flds.split("\x1f"); // separador do Anki
      const front = fields[0]?.trim();
      const back = fields[1]?.trim();

      if (!front || !back) {
        skipped++;
        continue;
      }

      // Substitui referências de mídia por tags HTML
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
      deck,
      imported,
      skipped,
      message: `${imported} cards importados com sucesso!`,
    });
  } catch (err) {
    console.error("Erro ao importar .apkg:", err);
    res.status(500).json({ error: "Erro ao processar o arquivo .apkg." });
  } finally {
    // Limpa arquivos temporários
    try {
      fs.rmSync(apkgPath, { force: true });
      fs.rmSync(extractDir, { recursive: true, force: true });
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
