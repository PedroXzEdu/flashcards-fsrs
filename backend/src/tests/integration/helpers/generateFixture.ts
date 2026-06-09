import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

export function generateFixtureApkg(
  notes: { front: string; back: string }[],
): string {
  const tmpDir = join(tmpdir(), `apkg-test-${Date.now()}`);
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const dbPath = join(tmpDir, "collection.anki2");
  const apkgPath = join(tmpDir, "test.apkg");

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

  db.prepare(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (1, 1740000000, 1740000000, 0, 0, 0, 0, 0, '{}', '{}', ?, '{}', '{}')`,
  ).run(
    JSON.stringify({
      1: {
        id: 1,
        name: "Test Deck",
        desc: "Deck para teste",
        conf: 1,
        collapsed: false,
      },
    }),
  );

  const noteInsert = db.prepare(
    `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
     VALUES (?, ?, 0, 1740000000, 0, '', ?, ?, 0, 0, '')`,
  );

  const cardInsert = db.prepare(
    `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
     VALUES (?, ?, ?, 0, 1740000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '')`,
  );

  notes.forEach((note, i) => {
    const noteId = 1740000000001 + i;
    noteInsert.run(
      noteId,
      `guid-${i}`,
      `${note.front}\x1f${note.back}`,
      note.front,
    );
    cardInsert.run(1740000000001 + i, noteId, 1);
  });

  db.close();

  execSync(
    `cd "${tmpDir}" && zip -q "${apkgPath}" collection.anki2 && rm collection.anki2`,
  );

  return apkgPath;
}

export function removeFixtureApkg(path: string) {
  if (path && existsSync(path)) {
    unlinkSync(path);
    const dir = join(path, "..");
    if (existsSync(dir)) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
