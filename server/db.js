// ============================================================
// db.js — CONFIGURAÇÃO DO BANCO DE DADOS (SQLite)
// ============================================================
// Usamos o módulo `node:sqlite`, que já vem embutido no Node.js
// (a partir da versão 22), então não precisa instalar nenhum
// pacote nem configurar nada externo — é só um arquivo .db
// salvo aqui na pasta do servidor.
//
// SQLite guarda TUDO num único arquivo (data.db). Isso é
// diferente de Postgres/MySQL, que rodam como um "serviço"
// separado — pra um projeto de portfólio, SQLite é perfeito:
// simples, zero configuração, e ainda assim é SQL de verdade.
// ============================================================

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// O arquivo do banco fica salvo ao lado deste arquivo.
const db = new DatabaseSync(path.join(__dirname, 'data.db'));

// PRAGMA são "configurações" do SQLite. Essa aqui liga o suporte
// a chaves estrangeiras (foreign keys) — sem isso, o "ON DELETE
// CASCADE" das tabelas abaixo (apagar as opções junto com a
// enquete) não funcionaria.
db.exec('PRAGMA foreign_keys = ON;');

// --- CRIAÇÃO DAS TABELAS -------------------------------------
// "CREATE TABLE IF NOT EXISTS" só cria a tabela se ela ainda não
// existir — assim, toda vez que o servidor liga, isso roda sem
// perigo de apagar dados que já existiam.
db.exec(`
  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_accessed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT NOT NULL,
    text TEXT NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS voted_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT NOT NULL,
    ip TEXT NOT NULL,
    UNIQUE(poll_id, ip),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
  );
`);

module.exports = db;
