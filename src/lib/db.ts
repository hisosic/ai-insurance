import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "danbee.db");

let db: Database.Database | null = null;

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
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT DEFAULT '',
        overall_risk_level TEXT NOT NULL,
        summary TEXT NOT NULL,
        analysis_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      )
    `);
  }
  return db;
}

export interface AnalysisRecord {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  overall_risk_level: string;
  summary: string;
  analysis_json: string;
  created_at: string;
}

export function saveAnalysis(
  userInfo: { name: string; age: string; gender: string; phone: string },
  analysis: Record<string, unknown>
): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO analysis_results (name, age, gender, phone, overall_risk_level, summary, analysis_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    userInfo.name,
    parseInt(userInfo.age),
    userInfo.gender,
    userInfo.phone || "",
    (analysis.overallRiskLevel as string) || "unknown",
    (analysis.summary as string) || "",
    JSON.stringify(analysis)
  );
  return result.lastInsertRowid as number;
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

export function deleteAnalysis(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM analysis_results WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}
