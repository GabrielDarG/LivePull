// ============================================================
// OverlayPage — TELA TRANSPARENTE PARA STREAMER (OBS)
// ============================================================
// Diferenças importantes em relação às outras páginas:
//   - Fundo TRANSPARENTE (não branco/escuro) — no OBS, como
//     "Browser Source", só as barras aparecem por cima da live
//   - Não tem botão de votar — o streamer não vota na própria
//     enquete, só MOSTRA o resultado. Quem vota é a audiência,
//     acessando o link normal (/poll/:id) no chat, por exemplo.
//   - Atualiza sozinha em tempo real (mesma lógica de socket
//     das outras páginas)
// ============================================================

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPoll, socket } from '../api';

function OverlayPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    getPoll(id).then(setPoll).catch(() => {});
  }, [id]);

  // O <body> global tem um fundo escuro definido no index.css
  // (pensado para as outras páginas). Para o overlay funcionar
  // de verdade no OBS, precisamos deixar o fundo transparente
  // SÓ enquanto essa página estiver aberta, e devolver o normal
  // ao sair dela (por isso a função de "limpeza" no return).
  useEffect(() => {
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  useEffect(() => {
    socket.emit('joinPoll', id);
    socket.on('pollUpdated', setPoll);
    return () => socket.off('pollUpdated', setPoll);
  }, [id]);

  // Enquanto não carregou, não mostra nada — assim não aparece
  // um texto de "carregando" feio por cima da live.
  if (!poll) return null;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="overlay-page">
      <h2 className="overlay-question">{poll.question}</h2>
      {poll.options.map((option, index) => {
        const percent = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
        return (
          <div key={index} className="overlay-bar-wrapper">
            <div className="overlay-bar-label">
              <span>{option.text}</span>
              <span>{percent}%</span>
            </div>
            <div className="overlay-bar-track">
              <div className="overlay-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OverlayPage;
