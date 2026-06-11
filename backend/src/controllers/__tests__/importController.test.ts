import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import unzipper from "unzipper";
import Database from "better-sqlite3";

import { importApkg } from "../importController";
import { importService } from "../../services/importService";

vi.mock("unzipper", () => ({
  default: { Extract: vi.fn() },
  Extract: vi.fn(),
}));

vi.mock("better-sqlite3", () => ({
  default: vi.fn(),
}));

vi.mock("../../services/importService", () => ({
  importService: {
    createDeckFromAnki: vi.fn(),
  },
}));

const mockFile = {
  path: "/tmp/uploads/12345-test.apkg",
  originalname: "my_deck.apkg",
  mimetype: "application/zip",
  fieldname: "file",
  encoding: "7bit",
  size: 1024,
  destination: "/tmp/uploads",
  filename: "12345-test.apkg",
};

const mockServiceResult = {
  deck: { id: 1, title: "my_deck", user_id: 1 },
  imported: 2,
  skipped: 0,
};

const mockNotes = [
  { id: 1, flds: "Front 1\x1fBack 1", tags: "" },
  { id: 2, flds: "Front 2\x1fBack 2", tags: "tag1" },
];

function createReq(file?: typeof mockFile) {
  return { file, userId: 1 } as any;
}

function createRes() {
  const res: any = {};
  res.json = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  return res;
}

function setupStreamMock() {
  const extractObj = { promise: vi.fn().mockResolvedValue(undefined) };
  const readStream = { pipe: vi.fn().mockReturnValue(extractObj) };
  vi.spyOn(fs, "createReadStream").mockReturnValue(readStream as any);
  vi.mocked(unzipper.Extract).mockReturnValue(extractObj as any);
}

function setupDbMock() {
  const db = {
    prepare: vi.fn().mockReturnValue({
      all: vi.fn().mockReturnValue(mockNotes),
    }),
    close: vi.fn(),
  };
  vi.mocked(Database).mockReturnValue(db as any);
}

function setupDefaultMocks() {
  setupStreamMock();
  vi.spyOn(fs, "mkdirSync").mockReturnValue(undefined);
  vi.spyOn(fs, "existsSync").mockReturnValue(true);
  vi.spyOn(fs, "readFileSync").mockReturnValue('{"1": "image.png"}');
  vi.spyOn(fs, "copyFileSync").mockReturnValue(undefined);
  vi.spyOn(fs, "rmSync").mockReturnValue(undefined);
  setupDbMock();
  vi.mocked(importService.createDeckFromAnki).mockResolvedValue(
    mockServiceResult,
  );
}

describe("ImportController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setupDefaultMocks();
  });

  describe("importApkg", () => {
    it("deve importar .apkg com sucesso", async () => {
      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(importService.createDeckFromAnki).toHaveBeenCalledWith(
        1,
        "my_deck",
        [
          { front: "Front 1", back: "Back 1" },
          { front: "Front 2", back: "Back 2" },
        ],
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockServiceResult,
          message: "2 cards importados com sucesso!",
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve processar referências de mídia no front/back", async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{"1": "imagem.png"}');
      const notesWithMedia = [
        { id: 1, flds: 'Front [sound:1]\x1fBack <img src="foto.png"/>' },
      ];
      const db = {
        prepare: vi.fn().mockReturnValue({
          all: vi.fn().mockReturnValue(notesWithMedia),
        }),
        close: vi.fn(),
      };
      vi.mocked(Database).mockReturnValue(db as any);

      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(importService.createDeckFromAnki).toHaveBeenCalledWith(
        1,
        "my_deck",
        [
          {
            front: 'Front <audio controls src="http://localhost:3000/media/1"></audio>',
            back: 'Back <img src="http://localhost:3000/media/foto.png"/>',
          },
        ],
      );
    });

    it("deve lançar erro se nenhum arquivo foi enviado", async () => {
      const req = createReq(undefined);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nenhum arquivo enviado.",
          statusCode: 400,
        }),
      );
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve lançar erro se .apkg não contém collection.anki2", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Arquivo .apkg inválido ou corrompido.",
          statusCode: 400,
        }),
      );
    });

    it("deve chamar next(err) se importService lançar erro", async () => {
      const serviceError = new Error("Erro no banco");
      vi.mocked(importService.createDeckFromAnki).mockRejectedValue(
        serviceError,
      );

      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se mkdirSync lançar erro", async () => {
      const fsError = new Error("Permissão negada");
      vi.spyOn(fs, "mkdirSync").mockImplementation(() => {
        throw fsError;
      });

      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(next).toHaveBeenCalledWith(fsError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se media JSON é inválido", async () => {
      vi.mocked(fs.readFileSync).mockReturnValue("json inválido");

      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("deve limpar arquivos temporários no finally", async () => {
      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await importApkg(req, res, next);

      expect(fs.rmSync).toHaveBeenCalledWith(mockFile.path, {
        force: true,
      });
      expect(fs.rmSync).toHaveBeenCalledWith(`${mockFile.path}_extracted`, {
        recursive: true,
        force: true,
      });
    });

    it("deve engolir erros de limpeza no finally", async () => {
      vi.mocked(fs.rmSync).mockImplementation(() => {
        throw new Error("Falha ao remover");
      });

      const req = createReq(mockFile);
      const res = createRes();
      const next = vi.fn();

      await expect(importApkg(req, res, next)).resolves.not.toThrow();

      expect(res.json).toHaveBeenCalled();
    });
  });
});
