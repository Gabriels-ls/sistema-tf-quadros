import { useState } from 'react';
import api from '../services/api';
import { obterTokenAdmin } from '../services/adminAuth';

function ItemGrupo({ grupo, onEditarGrupo, onExcluirGrupo, onSalvarOpcao, onExcluirOpcao }) {
  const [nomeOpcao, setNomeOpcao] = useState('');
  const [precoOpcao, setPrecoOpcao] = useState('');
  const [editandoOpcaoId, setEditandoOpcaoId] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function limparForm() {
    setEditandoOpcaoId(null);
    setNomeOpcao('');
    setPrecoOpcao('');
  }

  function iniciarEdicaoOpcao(opcao) {
    setEditandoOpcaoId(opcao.id ?? opcao.tempId);
    setNomeOpcao(opcao.nome);
    setPrecoOpcao(opcao.preco_adicional);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!nomeOpcao || precoOpcao === '') return;

    setSalvando(true);
    try {
      await onSalvarOpcao({ nome: nomeOpcao, preco_adicional: precoOpcao }, editandoOpcaoId);
      limparForm();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grupos-variacao__grupo">
      <div className="grupos-variacao__cabecalho">
        <strong>{grupo.nome}</strong>
        <div className="admin-produtos__acoes">
          <button type="button" onClick={onEditarGrupo} className="admin-produtos__editar">
            Editar grupo
          </button>
          <button type="button" onClick={onExcluirGrupo} className="admin-produtos__excluir">
            Excluir grupo
          </button>
        </div>
      </div>

      {grupo.opcoes.length > 0 && (
        <ul className="admin-produtos__lista-variacoes">
          {grupo.opcoes.map((opcao) => (
            <li key={opcao.id ?? opcao.tempId}>
              <span>{opcao.nome} — +R$ {opcao.preco_adicional}</span>
              <div className="admin-produtos__acoes">
                <button type="button" onClick={() => iniciarEdicaoOpcao(opcao)} className="admin-produtos__editar">
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onExcluirOpcao(opcao)}
                  className="admin-produtos__excluir"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-produtos__form-variacao">
        <input
          placeholder="Nome (ex: 60cm)"
          value={nomeOpcao}
          onChange={(e) => setNomeOpcao(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSalvar(e)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Preço adicional"
          value={precoOpcao}
          onChange={(e) => setPrecoOpcao(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSalvar(e)}
        />
        <button
          type="button"
          onClick={handleSalvar}
          disabled={salvando || !nomeOpcao || precoOpcao === ''}
          className="admin-produtos__btn-variacao"
        >
          {editandoOpcaoId ? 'Salvar opção' : '+ Adicionar opção'}
        </button>
        {editandoOpcaoId && (
          <button type="button" onClick={limparForm} className="admin-produtos__cancelar">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

function GruposVariacaoEditor({ produtoId, grupos, onGruposLocaisChange, onPersistido }) {
  const local = !produtoId;

  const [nomeGrupo, setNomeGrupo] = useState('');
  const [editandoGrupoId, setEditandoGrupoId] = useState(null);
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);

  function limparFormGrupo() {
    setEditandoGrupoId(null);
    setNomeGrupo('');
  }

  function iniciarEdicaoGrupo(grupo) {
    setEditandoGrupoId(grupo.id ?? grupo.tempId);
    setNomeGrupo(grupo.nome);
  }

  async function handleSalvarGrupo(e) {
    e.preventDefault();
    if (!nomeGrupo.trim()) return;

    if (local) {
      if (editandoGrupoId) {
        onGruposLocaisChange(
          grupos.map((g) => (g.tempId === editandoGrupoId ? { ...g, nome: nomeGrupo } : g))
        );
      } else {
        onGruposLocaisChange([...grupos, { tempId: crypto.randomUUID(), nome: nomeGrupo, opcoes: [] }]);
      }
      limparFormGrupo();
      return;
    }

    setSalvandoGrupo(true);
    try {
      const token = obterTokenAdmin();
      const headers = { Authorization: `Bearer ${token}` };
      if (editandoGrupoId) {
        await api.put(`/produtos/${produtoId}/grupos-variacao/${editandoGrupoId}`, { nome: nomeGrupo }, { headers });
      } else {
        await api.post(`/produtos/${produtoId}/grupos-variacao`, { nome: nomeGrupo }, { headers });
      }
      limparFormGrupo();
      onPersistido();
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar o grupo.');
    } finally {
      setSalvandoGrupo(false);
    }
  }

  async function handleExcluirGrupo(grupo) {
    if (local) {
      onGruposLocaisChange(grupos.filter((g) => g.tempId !== grupo.tempId));
      return;
    }

    const confirmar = window.confirm('Excluir este grupo remove também todas as suas opções. Continuar?');
    if (!confirmar) return;

    try {
      const token = obterTokenAdmin();
      await api.delete(`/produtos/${produtoId}/grupos-variacao/${grupo.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onPersistido();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o grupo.');
    }
  }

  async function handleSalvarOpcao(grupo, dadosOpcao, editandoOpcaoId) {
    if (local) {
      onGruposLocaisChange(
        grupos.map((g) => {
          if (g.tempId !== grupo.tempId) return g;
          const opcoes = editandoOpcaoId
            ? g.opcoes.map((o) => (o.tempId === editandoOpcaoId ? { ...o, ...dadosOpcao } : o))
            : [...g.opcoes, { tempId: crypto.randomUUID(), ...dadosOpcao }];
          return { ...g, opcoes };
        })
      );
      return;
    }

    try {
      const token = obterTokenAdmin();
      const headers = { Authorization: `Bearer ${token}` };
      if (editandoOpcaoId) {
        await api.put(`/grupos-variacao/${grupo.id}/opcoes/${editandoOpcaoId}`, dadosOpcao, { headers });
      } else {
        await api.post(`/grupos-variacao/${grupo.id}/opcoes`, dadosOpcao, { headers });
      }
      onPersistido();
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar a opção.');
    }
  }

  async function handleExcluirOpcao(grupo, opcao) {
    if (local) {
      onGruposLocaisChange(
        grupos.map((g) =>
          g.tempId === grupo.tempId ? { ...g, opcoes: g.opcoes.filter((o) => o.tempId !== opcao.tempId) } : g
        )
      );
      return;
    }

    try {
      const token = obterTokenAdmin();
      await api.delete(`/grupos-variacao/${grupo.id}/opcoes/${opcao.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onPersistido();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir a opção.');
    }
  }

  return (
    <div className="grupos-variacao">
      {grupos.map((grupo) => (
        <ItemGrupo
          key={grupo.id ?? grupo.tempId}
          grupo={grupo}
          onEditarGrupo={() => iniciarEdicaoGrupo(grupo)}
          onExcluirGrupo={() => handleExcluirGrupo(grupo)}
          onSalvarOpcao={(dados, editandoOpcaoId) => handleSalvarOpcao(grupo, dados, editandoOpcaoId)}
          onExcluirOpcao={(opcao) => handleExcluirOpcao(grupo, opcao)}
        />
      ))}

      <div className="admin-produtos__form-variacao">
        <input
          placeholder="Nome do grupo (ex: Material, Tamanho, Tela)"
          value={nomeGrupo}
          onChange={(e) => setNomeGrupo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSalvarGrupo(e)}
        />
        <button
          type="button"
          onClick={handleSalvarGrupo}
          disabled={salvandoGrupo || !nomeGrupo.trim()}
          className="admin-produtos__btn-variacao"
        >
          {editandoGrupoId ? 'Salvar grupo' : '+ Adicionar grupo'}
        </button>
        {editandoGrupoId && (
          <button type="button" onClick={limparFormGrupo} className="admin-produtos__cancelar">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default GruposVariacaoEditor;
