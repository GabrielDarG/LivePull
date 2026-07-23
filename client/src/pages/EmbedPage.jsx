// ============================================================
// EmbedPage — VERSÃO PARA COLOCAR DENTRO DE UM <iframe>
// ============================================================
// É quase idêntica à PollPage, mas:
//   - sem cabeçalho, sem link "voltar", sem opções de compartilhar
//   - pensada pra ocupar pouco espaço, já que vai ficar dentro
//     de um iframe pequeno em outro site
//
// Por que um componente separado, e não reaproveitar a PollPage
// com um "if"? Dá pra fazer das duas formas. Aqui optei por
// duplicar porque a tela de embed tende a divergir bastante da
// tela normal (menos elementos, layout mais compacto), então
// fica mais simples de manter cada uma isolada.
// ============================================================

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPoll, vote as castVote, socket } from '../api';

function EmbedPage() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPoll(id).then((data) => {
      setPoll(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const voted = localStorage.getItem(`voted-${id}`);
    if (voted) setHasVoted(true);
  }, [id]);

  useEffect(() => {
    socket.emit('joinPoll', id);
    function handleUpdate(updatedPoll) {
      setPoll(updatedPoll);
    }
    socket.on('pollUpdated', handleUpdate);
    return () => socket.off('pollUpdated', handleUpdate);
  }, [id]);

  async function handleVote(optionIndex) {
    try {
      const updatedPoll = await castVote(id, optionIndex);
      setPoll(updatedPoll);
      setHasVoted(true);
      localStorage.setItem(`voted-${id}`, 'true');
    } catch {
      setHasVoted(true);
    }
  }

  if (loading || !poll) return <div className="embed-page"><p className="muted">Carregando...</p></div>;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="embed-page">
      <h2 className="embed-question">{poll.question}</h2>
      <div className="options-vote-list">
        {poll.options.map((option, index) => {
          const percent = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          return (
            <div key={index} className="option-result">
              {hasVoted ? (
                <div className="bar-wrapper">
                  <div className="bar-label">
                    <span>{option.text}</span>
                    <span>{percent}%</span>
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
    </div>
  );
}

export default EmbedPage;
