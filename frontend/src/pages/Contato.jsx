import Layout from '../components/Layout';
import './Contato.css';

function Contato() {
  return (
    <Layout>
      <section className="contato-header">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--color-primary-light)' }}>Contato</span>
          <h1 className="contato-header__titulo">Fale com a gente</h1>
        </div>
      </section>

      <section className="container contato-conteudo">
        <div className="contato-info">
          <div className="contato-item">
            <span className="eyebrow">E-mail</span>
            <p>tfquadros@terra.com.br</p>
          </div>
          <div className="contato-item">
            <span className="eyebrow">Telefone</span>
            <p>(47) 3332-2923</p>
          </div>
          <div className="contato-item">
            <span className="eyebrow">Endereço</span>
            <p>Rodovia Jorge Lacerda, bairro Poço Grande 2636 — Gaspar, SC</p>
          </div>
          <div className="contato-item">
            <span className="eyebrow">Horário de atendimento</span>
            <p>Segunda a sexta, das 7h às 17h</p>
          </div>
        </div>

        <div className="contato-aviso">
          <p>
            Prefere uma resposta rápida? Use o assistente virtual no canto inferior direito
            da tela para tirar dúvidas iniciais sobre produtos e orçamentos.
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default Contato;