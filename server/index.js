// ============================================================
// LIVEPOLL - SERVIDOR (BACKEND)
// ============================================================
//
// Novidades desta versão:
//   1. BANCO DE DADOS DE VERDADE (SQLite, arquivo data.db) —
//      as enquetes não somem mais quando o servidor reinicia.
//   2. LIMPEZA AUTOMÁTICA — enquetes que ninguém acessa há mais
//      de 30 dias são apagadas sozinhas (ver função cleanupOldPolls).
//   3. Não existe mais rota de "listar todas as enquetes" — uma
//      enquete só pode ser acessada por quem tem o link (o id).
// ============================================================

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

// ============================================================
// FUNÇÕES DE ACESSO AO BANCO
// ============================================================
// db.prepare(sql) prepara uma consulta SQL (evita reescrever o
// parser toda vez). .get() devolve UMA linha, .all() devolve
// VÁRIAS linhas, .run() executa sem devolver linhas (INSERT/UPDATE).
// Os "?" no SQL são espaços reservados — o valor real entra como
// argumento, isso protege contra SQL injection.

function findPollById(id) {
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(id);
  if (!poll) return null;

  const options = db
    .prepare('SELECT id, text, votes FROM options WHERE poll_id = ? ORDER BY id')
    .all(id);

  return {
    id: poll.id,
    question: poll.question,
    createdAt: poll.created_at,
    options
  };
}

function hasVotedBefore(pollId, ip) {
  const row = db
    .prepare('SELECT 1 FROM voted_ips WHERE poll_id = ? AND ip = ?')
    .get(pollId, ip);
  return !!row;
}

// Atualiza "quando foi a última vez que alguém acessou essa
// enquete" — é essa data que decide se ela será apagada depois
// de 30 dias sem uso.
function touchPoll(id) {
  db.prepare('UPDATE polls SET last_accessed_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);
}

// --------------------------------------------------------------
// LIMPEZA AUTOMÁTICA — apaga enquetes com mais de 30 dias sem acesso
// --------------------------------------------------------------
function cleanupOldPolls() {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

  // Graças ao "ON DELETE CASCADE" nas tabelas options/voted_ips,
  // apagar da tabela polls já apaga as opções e votos junto.
  const result = db
    .prepare('DELETE FROM polls WHERE last_accessed_at < ?')
    .run(cutoff);

  if (result.changes > 0) {
    console.log(`🧹 ${result.changes} enquete(s) inativa(s) há 30+ dias foram apagadas.`);
  }
}

// Roda a limpeza uma vez assim que o servidor liga, e depois a
// cada 6 horas (não precisa ser em tempo real, é uma manutenção).
cleanupOldPolls();
setInterval(cleanupOldPolls, 6 * 60 * 60 * 1000);

// ============================================================
// ROTAS HTTP
// ============================================================

app.get('/', (req, res) => {
  res.send('Servidor LivePoll rodando!');
});

// --------------------------------------------------------------
// CRIAR ENQUETE
// --------------------------------------------------------------
app.post('/api/polls', (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({
      error: 'Você precisa mandar uma "question" e pelo menos 2 "options".'
    });
  }

  const id = generateId();
  const now = new Date().toISOString();

  db.prepare('INSERT INTO polls (id, question, created_at, last_accessed_at) VALUES (?, ?, ?, ?)')
    .run(id, question, now, now);

  const insertOption = db.prepare('INSERT INTO options (poll_id, text, votes) VALUES (?, ?, 0)');
  for (const text of options) {
    insertOption.run(id, text);
  }

  res.status(201).json(findPollById(id));
});

// --------------------------------------------------------------
// BUSCAR UMA ENQUETE PELO ID
// (Só quem tem o link/id consegue acessar — não existe listagem.)
// --------------------------------------------------------------
app.get('/api/polls/:id', (req, res) => {
  const poll = findPollById(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Enquete não encontrada.' });

  // Alguém acessou -> reseta o "relógio" dos 30 dias de inatividade.
  touchPoll(req.params.id);

  res.json(poll);
});

// --------------------------------------------------------------
// VOTAR
// --------------------------------------------------------------
app.post('/api/polls/:id/vote', (req, res) => {
  const poll = findPollById(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Enquete não encontrada.' });

  const { optionIndex } = req.body;
  const option = poll.options[optionIndex];
  if (!option) return res.status(400).json({ error: 'Opção inválida.' });

  const ip = getClientIp(req);

  if (hasVotedBefore(poll.id, ip)) {
    return res.status(403).json({ error: 'Este IP já votou nessa enquete.' });
  }

  db.prepare('INSERT INTO voted_ips (poll_id, ip) VALUES (?, ?)').run(poll.id, ip);
  db.prepare('UPDATE options SET votes = votes + 1 WHERE id = ?').run(option.id);
  touchPoll(poll.id);

  const updated = findPollById(poll.id);
  io.to(poll.id).emit('pollUpdated', updated);
  res.json(updated);
});

// ============================================================
// SOCKET.IO
// ============================================================
io.on('connection', (socket) => {
  socket.on('joinPoll', (pollId) => {
    socket.join(pollId);
  });
});

// ============================================================
// LIGANDO O SERVIDOR
// ============================================================
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Servidor LivePoll rodando em http://localhost:${PORT}`);
  console.log(`💾 Banco de dados: server/data.db`);
});
