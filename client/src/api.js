// ============================================================
// api.js — CAMADA DE COMUNICAÇÃO COM O BACKEND
// ============================================================
// Duas formas de comunicação com o servidor agora:
//   1. HTTP normal (fetch) — pra criar/buscar/votar, como antes
//   2. WebSocket (socket.io-client) — pra RECEBER atualizações
//      em tempo real, sem precisar ficar perguntando o tempo
//      todo "mudou? mudou? mudou?" (isso se chama "polling" e
//      é o jeito antigo/ruim de fazer tempo real)
// ============================================================

import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';

// Cria UMA única conexão de socket, reaproveitada pelo app
// inteiro (não precisa abrir uma conexão nova a cada página).
export const socket = io(API_URL);

// --------------------------------------------------------------
export async function getPoll(id) {
  const res = await fetch(`${API_URL}/api/polls/${id}`);
  if (!res.ok) throw new Error('Enquete não encontrada.');
  return res.json();
}

export async function createPoll(question, options) {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, options })
  });
  if (!res.ok) throw new Error('Erro ao criar enquete.');
  return res.json();
}

export async function vote(pollId, optionIndex) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionIndex })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao votar.');
  }
  return res.json();
}
