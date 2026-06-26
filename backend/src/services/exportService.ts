import Database from "better-sqlite3";
import archiver from "archiver";
import { PassThrough } from "stream";
import { cardRepository } from "../repositories/cardRepository";
import { deckRepository } from "../repositories/deckRepository";

const MODEL_ID = 1712345678000;

function buildDeckJson(deckId: number, name: string): string {
  return JSON.stringify({
    [deckId]: {
      id: deckId,
      name,
      desc: "",
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      timeToday: [0, 0],
      conf: 1,
      usn: 0,
      dyn: 0,
      collapsed: false,
      browserCollapsed: false,
    },
  });
}

function buildModelsJson(): string {
  return JSON.stringify({
    [MODEL_ID]: {
      id: MODEL_ID,
      name: "Basic",
      type: 0,
      mod: Math.floor(Date.now() / 1000),
      usn: 0,
      sortf: 0,
      did: 1,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: "{{Front}}",
          afmt: '{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}',
          bqfmt: "",
          bafmt: "",
          did: null,
          bfont: "",
          bsize: 0,
        },
      ],
      flds: [
        {
          name: "Front",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: null,
          tag: null,
        },
        {
          name: "Back",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: null,
          tag: null,
        },
      ],
      css: ".card {\n  font-family: arial;\n  font-size: 20px;\n  text-align: center;\n  color: black;\n  background-color: white;\n}\n",
      latexPre: `\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n`,
      latexPost: `\\end{document}\n`,
      latexsvg: false,
      req: [[0, "any", [0, 1]]],
    },
  });
}

function buildDconfJson(): string {
  return JSON.stringify({
    1: {
      name: "Default",
      newCardsPerDay: 20,
      reviewsPerDay: 200,
      newPerDayMaximumReviewRatio: 0,
      initialFactor: 2500,
      easyBonus: 1.3,
      hardInterval: 1.2,
      maxIvl: 36500,
      buryIntervals: null,
      interdayLearningMultiplier: 1.0,
      reviewOrder: 0,
      newSortOrder: 1,
      newGatherPriority: 0,
      newPerDayMinimumImprovement: 0,
      leechThreshold: 8,
      leechAction: 0,
      dynDaily: 0,
      dynDeckOrder: 0,
      maxTaken: 60,
      timer: 0,
      autoplay: true,
      replayq: true,
      newDueOrder: false,
      newMix: 0,
      reviewMix: 0,
      sortBackwards: false,
      addToCurrent: false,
      newStart: 7,
      newEnd: 22,
      reviewStart: 7,
      reviewEnd: 22,
      newSteps: [1, 10],
      lapseSteps: [10],
      lapseAction: 0,
      _isBuried: false,
    },
  });
}

function normalizeHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function extractMediaRefs(text: string): string[] {
  const refs: string[] = [];
  const audioRe = /\[sound:(.*?)\]/g;
  let m: RegExpExecArray | null;
  while ((m = audioRe.exec(text)) !== null) {
    refs.push(m[1]);
  }
  const imgRe = /<img[^>]*src="(?!http)(.*?)"[^>]*>/g;
  while ((m = imgRe.exec(text)) !== null) {
    refs.push(m[1]);
  }
  return [...new Set(refs)];
}

function stripMediaRefs(text: string): string {
  return text
    .replace(/\[sound:(.*?)\]/g, "")
    .replace(/<img[^>]*>/g, "")
    .trim();
}

export class ExportService {
  async exportDeckToApkg(deckId: number, userId: number): Promise<PassThrough> {
    const cards = await cardRepository.findByDeckId(deckId);

    if (cards.length === 0) {
      const deck = await deckRepository.findById(deckId, userId);
      if (!deck) throw new Error("Deck não encontrado");
      const stream = new PassThrough();
      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(stream);

      const dbBuffer = this.createEmptyCollection("Default");
      archive.append(dbBuffer, { name: "collection.anki2" });
      archive.append("{}", { name: "media" });
      await archive.finalize();
      return stream;
    }

    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) throw new Error("Deck não encontrado");

    const deckName = deck.title.replace(/[<>:"/\\|?*]/g, "_");
    const ankiDeckId = deck.id;

    const db = new Database(":memory:");

    db.exec(`
      CREATE TABLE col (
        id INTEGER PRIMARY KEY,
        crt INTEGER, mod INTEGER, scm INTEGER, ver INTEGER,
        dty INTEGER, usn INTEGER, ls INTEGER,
        conf TEXT, models TEXT, decks TEXT, dconf TEXT, tags TEXT
      );
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY,
        guid TEXT, mid INTEGER, mod INTEGER, usn INTEGER,
        tags TEXT, flds TEXT, sfld TEXT, csum INTEGER,
        flags INTEGER, data TEXT
      );
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY,
        nid INTEGER, did INTEGER, ord INTEGER, mod INTEGER,
        usn INTEGER, type INTEGER, queue INTEGER, due INTEGER,
        ivl INTEGER, factor INTEGER, reps INTEGER, lapses INTEGER,
        left INTEGER, odue INTEGER, odid INTEGER, flags INTEGER,
        data TEXT
      );
      CREATE TABLE revlog (
        id INTEGER PRIMARY KEY,
        cid INTEGER, usn INTEGER, ease INTEGER, ivl INTEGER,
        lastIvl INTEGER, factor INTEGER, time INTEGER, type INTEGER
      );
      CREATE TABLE graves (
        usn INTEGER, oid INTEGER, type INTEGER
      );
    `);

    const now = Math.floor(Date.now() / 1000);
    const colStmt = db.prepare(`
      INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    colStmt.run(
      1,
      now,
      now,
      now,
      2,
      0,
      0,
      0,
      "{}",
      buildModelsJson(),
      buildDeckJson(ankiDeckId, deckName),
      buildDconfJson(),
      "",
    );

    const noteInsert = db.prepare(`
      INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '')
    `);
    const cardInsert = db.prepare(`
      INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, '')
    `);

    const insertAll = db.transaction(() => {
      for (const card of cards) {
        const noteId = card.id;
        const frontText = stripMediaRefs(normalizeHtml(card.front));
        const backText = stripMediaRefs(normalizeHtml(card.back));
        const tagsStr = (card.tags || []).filter(Boolean).join(" ");
        const flds = `${frontText}\x1f${backText}`;

        noteInsert.run(
          noteId,
          crypto.randomUUID(),
          MODEL_ID,
          now,
          0,
          tagsStr,
          flds,
          frontText.slice(0, 255),
          0,
        );

        const ankiCardId = noteId * 1000 + 1;
        cardInsert.run(
          ankiCardId,
          noteId,
          ankiDeckId,
          0,
          now,
          0,
          2,
          2,
          card.due ? Math.floor((new Date(card.due).getTime() / 1000 - now) / 86400) : 0,
          Math.round(card.stability),
          2500,
          card.reps,
          card.lapses,
          0,
          ankiDeckId,
        );
      }
    });

    insertAll();

    const dbBuffer = db.serialize();
    db.close();

    const allMediaRefs: Set<string> = new Set();
    for (const card of cards) {
      for (const ref of extractMediaRefs(card.front)) {
        allMediaRefs.add(ref);
      }
      for (const ref of extractMediaRefs(card.back)) {
        allMediaRefs.add(ref);
      }
    }

    const mediaMap: Record<string, string> = {};
    let mediaIdx = 0;
    for (const filename of allMediaRefs) {
      mediaMap[String(mediaIdx)] = filename;
      mediaIdx++;
    }

    const stream = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(stream);
    archive.append(dbBuffer, { name: "collection.anki2" });

    if (Object.keys(mediaMap).length > 0) {
      archive.append(JSON.stringify(mediaMap), { name: "media" });

      const fs = await import("fs");
      const path = await import("path");
      const mediaDir = path.join(__dirname, "../../uploads/media");

      for (const [idx, filename] of Object.entries(mediaMap)) {
        const fullPath = path.join(mediaDir, filename);
        if (fs.existsSync(fullPath)) {
          archive.file(fullPath, { name: idx });
        }
      }
    } else {
      archive.append("{}", { name: "media" });
    }

    await archive.finalize();
    return stream;
  }

  private createEmptyCollection(deckName: string): Buffer {
    const db = new Database(":memory:");
    db.exec(`
      CREATE TABLE col (
        id INTEGER PRIMARY KEY,
        crt INTEGER, mod INTEGER, scm INTEGER, ver INTEGER,
        dty INTEGER, usn INTEGER, ls INTEGER,
        conf TEXT, models TEXT, decks TEXT, dconf TEXT, tags TEXT
      );
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY,
        guid TEXT, mid INTEGER, mod INTEGER, usn INTEGER,
        tags TEXT, flds TEXT, sfld TEXT, csum INTEGER,
        flags INTEGER, data TEXT
      );
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY,
        nid INTEGER, did INTEGER, ord INTEGER, mod INTEGER,
        usn INTEGER, type INTEGER, queue INTEGER, due INTEGER,
        ivl INTEGER, factor INTEGER, reps INTEGER, lapses INTEGER,
        left INTEGER, odue INTEGER, odid INTEGER, flags INTEGER,
        data TEXT
      );
      CREATE TABLE revlog (
        id INTEGER PRIMARY KEY,
        cid INTEGER, usn INTEGER, ease INTEGER, ivl INTEGER,
        lastIvl INTEGER, factor INTEGER, time INTEGER, type INTEGER
      );
      CREATE TABLE graves (
        usn INTEGER, oid INTEGER, type INTEGER
      );
    `);

    const now = Math.floor(Date.now() / 1000);
    const stmt = db.prepare(`
      INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(1, now, now, now, 2, 0, 0, 0, "{}", buildModelsJson(), buildDeckJson(1, deckName), buildDconfJson(), "");

    const buf = db.serialize();
    db.close();
    return buf;
  }
}

export const exportService = new ExportService();
