import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../database');
const DB_FILE = path.join(DB_DIR, 'dayflow_db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.dbPath = DB_FILE;
    this.data = {
      users: [],
      employees: [],
      attendance: [],
      leaves: [],
      payroll: [],
      notifications: [],
      documents: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, initializing fresh state:', err.message);
      this.save();
    }
  }

  save() {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error('Failed to persist database:', err.message);
    }
  }

  table(tableName) {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }

    const self = this;
    const records = this.data[tableName];

    return {
      find(predicate = () => true) {
        self.load();
        if (typeof predicate === 'object') {
          return self.data[tableName].filter(item => {
            return Object.entries(predicate).every(([k, v]) => item[k] === v);
          });
        }
        return self.data[tableName].filter(predicate);
      },

      findOne(predicate) {
        const results = this.find(predicate);
        return results.length > 0 ? results[0] : null;
      },

      findById(id) {
        return this.findOne({ id: Number(id) || id });
      },

      insert(record) {
        self.load();
        const table = self.data[tableName];
        const nextId = table.length > 0 ? Math.max(...table.map(r => Number(r.id) || 0)) + 1 : 1;
        const newRecord = {
          id: nextId,
          ...record,
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        table.push(newRecord);
        self.save();
        return newRecord;
      },

      insertMany(records) {
        self.load();
        const results = [];
        for (const r of records) {
          const table = self.data[tableName];
          const nextId = table.length > 0 ? Math.max(...table.map(item => Number(item.id) || 0)) + 1 : 1;
          const newRecord = {
            id: nextId,
            ...r,
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          table.push(newRecord);
          results.push(newRecord);
        }
        self.save();
        return results;
      },

      update(id, updates) {
        self.load();
        const numericId = Number(id) || id;
        const index = self.data[tableName].findIndex(r => r.id === numericId || r.id === id);
        if (index === -1) return null;

        const existing = self.data[tableName][index];
        const updated = {
          ...existing,
          ...updates,
          id: existing.id, // Immutable ID
          updatedAt: new Date().toISOString()
        };
        self.data[tableName][index] = updated;
        self.save();
        return updated;
      },

      delete(id) {
        self.load();
        const numericId = Number(id) || id;
        const initialLen = self.data[tableName].length;
        self.data[tableName] = self.data[tableName].filter(r => r.id !== numericId && r.id !== id);
        const deleted = self.data[tableName].length < initialLen;
        if (deleted) self.save();
        return deleted;
      },

      count(predicate = () => true) {
        return this.find(predicate).length;
      }
    };
  }

  reset() {
    this.data = {
      users: [],
      employees: [],
      attendance: [],
      leaves: [],
      payroll: [],
      notifications: [],
      documents: []
    };
    this.save();
  }
}

export const db = new Database();
export default db;
