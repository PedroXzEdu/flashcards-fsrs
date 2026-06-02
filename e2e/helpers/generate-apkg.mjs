import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures");
const apkgPath = join(fixturesDir, "sample.apkg");

if (!existsSync(fixturesDir)) mkdirSync(fixturesDir, { recursive: true });

const dbPath = join(fixturesDir, "collection.anki2");
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE col (
    id INTEGER PRIMARY KEY,
    crt INTEGER, mod INTEGER, scm INTEGER, ver INTEGER,
    dty INTEGER, usn INTEGER, ls INTEGER,
    conf TEXT, models TEXT, decks TEXT, dconf TEXT, tags TEXT
  );
  CREATE TABLE notes (
    id INTEGER PRIMARY KEY, guid TEXT, mid INTEGER, mod INTEGER, usn INTEGER,
    tags TEXT, flds TEXT, sfld TEXT, csum INTEGER, flags INTEGER, data TEXT
  );
  CREATE TABLE cards (
    id INTEGER PRIMARY KEY, nid INTEGER, did INTEGER, ord INTEGER, mod INTEGER,
    usn INTEGER, type INTEGER, queue INTEGER, due INTEGER, ivl INTEGER,
    factor INTEGER, reps INTEGER, lapses INTEGER, left INTEGER,
    odue INTEGER, odid INTEGER, flags INTEGER, data TEXT
  );
`);

const deckId = 1;
db.prepare(`INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
  VALUES (1, 1740000000, 1740000000, 0, 0, 0, 0, 0, '{}', '{}', ?, '{}', '{}')`)
  .run(JSON.stringify({
    [deckId]: { id: deckId, name: "Sample Deck", desc: "Deck para teste", conf: 1, collapsed: false },
  }));

const noteId = 1740000000001;
db.prepare(`INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
  VALUES (?, ?, 0, 1740000000, 0, '', ?, ?, 0, 0, '')`)
  .run(noteId, "sample-guid-001", "Pergunta 1\u001fResposta 1", "Pergunta 1");

db.prepare(`INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
  VALUES (?, ?, ?, 0, 1740000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '')`)
  .run(1740000000001, noteId, deckId);

db.close();

execSync(`cd "${fixturesDir}" && zip -q "${apkgPath}" collection.anki2 && rm collection.anki2`);
console.log("Fixture .apkg generated:", apkgPath);
