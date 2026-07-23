// ============================================================
// PollPage — VOTAÇÃO E RESULTADO EM TEMPO REAL
// ============================================================
// Novidade em relação à base: essa página agora "escuta" o
// servidor via WebSocket. Assim, se OUTRA pessoa votar em outro
// navegador, o resultado aqui atualiza sozinho, sem F5.
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPoll, vote as castVote, socket } from '../api';

function PollPage() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  // Busca a enquete uma vez, quando a página abre.
  useEffect(() => {
    getPoll(id)
      .then((data) => {
        setPoll(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Enquete não encontrada.');
        setLoading(false);
      });
  }, [id]);

  // Confere se esse navegador já votou (guardado localmente).
  useEffect(() => {
    const voted = localStorage.getItem(`voted-${id}`);
    if (voted) setHasVoted(true);
  }, [id]);

  // --- TEMPO REAL --------------------------------------------
  // 1. Avisa o servidor "quero atualizações da enquete X"
  //    (socket.emit('joinPoll', id) → o servidor faz socket.join(id))
  // 2. Fica escutando o evento 'pollUpdated'. Toda vez que o
  //    servidor emitir esse evento (porque ALGUÉM votou), a
  //    função abaixo roda e atualiza o estado local.
  // 3. No "return" do useEffect, removemos o listener quando a
  //    página fecha — isso evita "vazamento" de memória/eventos
  //    duplicados se você navegar pra outra página e voltar.
  useEffect(() => {
    socket.emit('joinPoll', id);

    function handleUpdate(updatedPoll) {
      setPoll(updatedPoll);
    }

    socket.on('pollUpdated', handleUpdate);

    return () => {
      socket.off('pollUpdated', handleUpdate);
    };
  }, [id]);

  async function handleVote(optionIndex) {
    try {
      const updatedPoll = await castVote(id, optionIndex);
      setPoll(updatedPoll);
      setHasVoted(true);
      localStorage.setItem(`voted-${id}`, 'true');
    } catch (err) {
      // Se o servidor bloquear (ex: "IP já votou"), mostramos a
      // mensagem que ele mandou e já marcamos como votado, pra
      // esconder os botões e mostrar o resultado.
      setError(err.message);
      setHasVoted(true);
    }
  }

  if (loading) return <div className="page"><p>Carregando...</p></div>;
  if (error && !poll) return <div className="page"><p className="error">{error}</p></div>;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const embedUrl = `${window.location.origin}/embed/${id}`;
  const overlayUrl = `${window.location.origin}/overlay/${id}`;

  return (
    <div className="page">
      <Link to="/" className="back-link">← voltar</Link>

      <h1 className="question">{poll.question}</h1>

      <div className="options-vote-list">
        {poll.options.map((option, index) => {
          const percent = totalVotes === 0
            ? 0
            : Math.round((option.votes / totalVotes) * 100);

          return (
            <div key={index} className="option-result">
              {hasVoted ? (
                <div className="bar-wrapper">
                  <div className="bar-label">
                    <span>{option.text}</span>
                    <span>{percent}% ({option.votes})</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ) : (
                <button className="vote-btn" onClick={() => handleVote(index)}>
                  {option.text}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <p className="muted total-votes">
          {totalVotes} voto{totalVotes !== 1 ? 's' : ''} no total · atualiza ao vivo
        </p>
      )}

      {error && hasVoted && <p className="error" style={{ textAlign: 'center' }}>{error}</p>}

      <button className="link-btn share-toggle" onClick={() => setShowShare(!showShare)}>
        {showShare ? 'esconder opções de compartilhamento' : 'ver opções de compartilhamento ▾'}
      </button>

      {showShare && (
        <div className="share-box">
          <div className="share-item">
            <span className="muted">Link de votação</span>
            <code>{window.location.href}</code>
          </div>
          <div className="share-item">
            <span className="muted">Embutir em um site (iframe)</span>
            <code>{`<iframe src="${embedUrl}" width="400" height="500"></iframe>`}</code>
          </div>
          <div className="share-item">
            <span className="muted">Overlay para OBS (Browser Source)</span>
            <code>{overlayUrl}</code>
          </div>
        </div>
      )}
    </div>
  );
}

export default PollPage;
