// ============================================================
// HomePage — TELA INICIAL
// ============================================================
// Responsabilidade única desta página: criar uma enquete nova
// e, assim que criada, levar o usuário para a página dela.
//
// Não existe mais lista de "enquetes recentes" aqui — o único
// jeito de acessar uma enquete é tendo o link direto (o /poll/:id
// que você recebe depois de criar). Isso é proposital: mantém
// as enquetes privadas por padrão, só quem tem o link vê.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll } from '../api';

function HomePage() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleOptionChange(index, value) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function addOption() {
    setOptions([...options, '']);
  }

  function removeOption(index) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!question.trim()) {
      setError('Escreva uma pergunta para a enquete.');
      return;
    }
    if (cleanOptions.length < 2) {
      setError('Adicione pelo menos 2 opções preenchidas.');
      return;
    }

    try {
      setLoading(true);
      const newPoll = await createPoll(question.trim(), cleanOptions);
      navigate(`/poll/${newPoll.id}`);
    } catch (err) {
      setError('Não foi possível criar a enquete. O servidor está rodando?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>LivePoll</h1>
        <p>Crie uma enquete e compartilhe o link com qualquer pessoa.</p>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Pergunta</span>
          <input
            type="text"
            placeholder="Ex: Qual jogo a gente joga hoje?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>

        <div className="options-list">
          {options.map((opt, index) => (
            <div className="option-row" key={index}>
              <input
                type="text"
                placeholder={`Opção ${index + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeOption(index)}
                  aria-label="Remover opção"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="link-btn" onClick={addOption}>
          + adicionar opção
        </button>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Criando...' : 'Criar enquete'}
        </button>
      </form>

      <p className="muted footer-note">
        Enquetes sem nenhum voto ou acesso por 30 dias são apagadas automaticamente.
      </p>
    </div>
  );
}

export default HomePage;
