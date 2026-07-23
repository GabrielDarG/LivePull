// ============================================================
// App.jsx — DEFINE AS ROTAS (PÁGINAS) DA APLICAÇÃO
// ============================================================
// 4 rotas agora:
//   /             -> HomePage (criar/listar enquetes)
//   /poll/:id     -> PollPage (votar + resultado, tela normal)
//   /embed/:id    -> EmbedPage (versão compacta para <iframe>)
//   /overlay/:id  -> OverlayPage (fundo transparente, para OBS)
// ============================================================

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PollPage from './pages/PollPage';
import EmbedPage from './pages/EmbedPage';
import OverlayPage from './pages/OverlayPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/poll/:id" element={<PollPage />} />
        <Route path="/embed/:id" element={<EmbedPage />} />
        <Route path="/overlay/:id" element={<OverlayPage />} />
      </Routes>
    </div>
  );
}

export default App;
