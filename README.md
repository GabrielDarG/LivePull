<div align="center">

# 🗳️ LivePoll

**Crie uma enquete, compartilhe o link, veja os votos chegarem em tempo real.**

[![status](https://img.shields.io/badge/status-em%20desenvolvimento-2ea44f)](#)
[![node](https://img.shields.io/badge/node-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![react](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![express](https://img.shields.io/badge/express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![sqlite](https://img.shields.io/badge/sqlite-nativo-07405E?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![socket.io](https://img.shields.io/badge/socket.io-realtime-010101?logo=socket.io&logoColor=white)](https://socket.io)

</div>

---

## Sobre o projeto

LivePoll é uma plataforma de enquetes em tempo real. Qualquer pessoa cria uma
enquete e recebe um link — sem cadastro, sem burocracia. Esse link pode ser:

- compartilhado direto com quem for votar
- **embutido** em qualquer site via `<iframe>`
- usado como **overlay transparente no OBS**, pra streamers mostrarem o
  resultado ao vivo por cima da transmissão

Não existe uma página listando todas as enquetes — o acesso é só por quem
tem o link, mantendo cada enquete privada por padrão.

## ✨ Funcionalidades

- 🔴 **Resultados em tempo real** via WebSocket (Socket.io) — todo mundo
  vendo a enquete recebe a atualização assim que alguém vota, sem F5
- 🚫 **Um voto por pessoa**, validado no servidor (por IP)
- 🔗 **Acesso só por link** — nenhuma listagem pública de enquetes
- 🖼️ **Modo embed** (`/embed/:id`) — pronto pra colar em qualquer site
- 🎥 **Modo overlay** (`/overlay/:id`) — fundo transparente, feito pra OBS
- 💾 **Persistência real** em SQLite — os dados sobrevivem a reinícios
- 🧹 **Auto-limpeza** — enquetes sem nenhum acesso por 30 dias são apagadas
  automaticamente

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express, Socket.io |
| Banco de dados | SQLite (via `node:sqlite`, nativo do Node — zero configuração) |

## 🚀 Rodando localmente

Requer **Node.js 22+** (usa o módulo `node:sqlite`, nativo a partir dessa versão).

```bash
# clona o repositório
git clone https://github.com/seu-usuario/livepoll.git
cd livepoll
```

**Terminal 1 — backend:**
```bash
cd server
npm install
node index.js
```

**Terminal 2 — frontend:**
```bash
cd client
npm install
npm run dev
```

Abre o endereço que aparecer no terminal do frontend (ex: `http://localhost:5173`).

## 📁 Estrutura do projeto

```
livepoll/
├── server/
│   ├── db.js       # conexão e schema do SQLite
│   └── index.js    # API REST + WebSocket
└── client/
    └── src/
        ├── api.js          # chamadas HTTP + conexão WebSocket
        ├── App.jsx         # rotas da aplicação
        └── pages/
            ├── HomePage.jsx    # criar enquete
            ├── PollPage.jsx    # votar + resultado (tela normal)
            ├── EmbedPage.jsx   # versão compacta para <iframe>
            └── OverlayPage.jsx # versão transparente para OBS
```

## 🗺️ Roadmap

- [ ] Autenticação (gerenciar as próprias enquetes)
- [ ] Customização visual do overlay via query params
- [ ] Deploy (Render/Railway + Vercel)

## 📄 Licença

Livre para estudo e uso pessoal.
