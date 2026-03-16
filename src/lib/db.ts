import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "danbee.db");

let db: Database.Database | null = null;

function generateToken(): string {
  return crypto.randomBytes(16).toString("base64url");
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        share_token TEXT UNIQUE,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT DEFAULT '',
        overall_risk_level TEXT NOT NULL,
        summary TEXT NOT NULL,
        analysis_json TEXT NOT NULL,
        memo TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      )
    `);

    // Create admin settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Migrate: add share_token column if missing
    const columns = db.prepare("PRAGMA table_info(analysis_results)").all() as { name: string }[];
    if (!columns.some((c) => c.name === "share_token")) {
      db.exec("ALTER TABLE analysis_results ADD COLUMN share_token TEXT");
      // Backfill existing rows
      const rows = db.prepare("SELECT id FROM analysis_results WHERE share_token IS NULL").all() as { id: number }[];
      const update = db.prepare("UPDATE analysis_results SET share_token = ? WHERE id = ?");
      for (const row of rows) {
        update.run(generateToken(), row.id);
      }
      // Add unique index after backfill
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_share_token ON analysis_results(share_token)");
    }

    // Migrate: add memo column if missing
    if (!columns.some((c) => c.name === "memo")) {
      db.exec("ALTER TABLE analysis_results ADD COLUMN memo TEXT DEFAULT ''");
    }
  }
  return db;
}

export interface AnalysisRecord {
  id: number;
  share_token: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  overall_risk_level: string;
  summary: string;
  analysis_json: string;
  memo: string;
  created_at: string;
}

export function saveAnalysis(
  userInfo: { name: string; age: string; gender: string; phone: string },
  analysis: Record<string, unknown>
): { id: number; shareToken: string } {
  const db = getDb();
  const token = generateToken();
  const stmt = db.prepare(`
    INSERT INTO analysis_results (share_token, name, age, gender, phone, overall_risk_level, summary, analysis_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    token,
    userInfo.name,
    parseInt(userInfo.age),
    userInfo.gender,
    userInfo.phone || "",
    (analysis.overallRiskLevel as string) || "unknown",
    (analysis.summary as string) || "",
    JSON.stringify(analysis)
  );
  return { id: result.lastInsertRowid as number, shareToken: token };
}

export function getAnalysisList(
  page: number = 1,
  limit: number = 20,
  search?: string
): { results: AnalysisRecord[]; total: number } {
  const db = getDb();
  const offset = (page - 1) * limit;

  let whereClause = "";
  const params: unknown[] = [];

  if (search) {
    whereClause = "WHERE name LIKE ? OR summary LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  const countStmt = db.prepare(
    `SELECT COUNT(*) as total FROM analysis_results ${whereClause}`
  );
  const { total } = countStmt.get(...params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM analysis_results ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  );
  const results = stmt.all(...params, limit, offset) as AnalysisRecord[];

  return { results, total };
}

export function getAnalysisById(id: number): AnalysisRecord | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM analysis_results WHERE id = ?");
  return stmt.get(id) as AnalysisRecord | undefined;
}

export function getAnalysisByToken(token: string): AnalysisRecord | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM analysis_results WHERE share_token = ?");
  return stmt.get(token) as AnalysisRecord | undefined;
}

export function deleteAnalysis(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM analysis_results WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

export function updateMemo(id: number, memo: string): boolean {
  const db = getDb();
  const stmt = db.prepare("UPDATE analysis_results SET memo = ? WHERE id = ?");
  const result = stmt.run(memo, id);
  return result.changes > 0;
}

// Admin password management
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

export function verifyAdminPassword(password: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT value FROM admin_settings WHERE key = 'admin_password_hash'").get() as { value: string } | undefined;
  if (row) {
    return row.value === hashPassword(password);
  }
  // Fallback to env/default password
  return password === DEFAULT_PASSWORD;
}

export function changeAdminPassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  if (!verifyAdminPassword(currentPassword)) {
    return { success: false, error: "현재 비밀번호가 올바르지 않습니다" };
  }
  if (newPassword.length < 4) {
    return { success: false, error: "새 비밀번호는 4자 이상이어야 합니다" };
  }
  const db = getDb();
  db.prepare(
    "INSERT INTO admin_settings (key, value) VALUES ('admin_password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(hashPassword(newPassword));
  return { success: true };
}
