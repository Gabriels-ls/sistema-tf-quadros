import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import './Home.css';

function Home() {
  return (
    <Layout>
      <section className="hero">
        <div className="container hero__conteudo">
          <span className="eyebrow eyebrow--clara">Fabricação sob medida</span>
          <h1 className="hero__titulo">Quadros de serigrafia feitos para durar</h1>
          <p className="hero__texto">
            Estrutura resistente, medidas precisas e acabamento profissional para quem vive de estampar.
          </p>
          <Link to="/produtos" className="btn-primario">Ver catálogo</Link>
        </div>
      </section>

      <section className="container secao">
        <span className="eyebrow">Sobre a TF Quadros</span>
        <h2 className="secao__titulo">Quem fabrica seus quadros</h2>
        <p className="secao__texto">
          Desde 1998, a TF Quadros produz quadros de serigrafia em fábrica própria. São quase 30 anos atendendo estamparias e gráficas aprendendo, na prática, o que cada trabalho pede, do glitter à cromia.
        </p>
      </section>

      <section className="container secao">
        <span className="eyebrow">Diferenciais</span>
        <h2 className="secao__titulo">Por que escolher a TF Quadros</h2>
        <div className="passos">
          <div className="passo">
            <span className="passo__numero">01</span>
            <h3 className="passo__titulo">Aguenta o ritmo</h3>
            <p>Gravação, impressão e limpeza todo dia: estrutura reforçada para durar na rotina da estamparia.</p>
          </div>
          <div className="passo">
            <span className="passo__numero">02</span>
            <h3 className="passo__titulo">Telas 12 a 90</h3>
            <p>Glitter, flocado, gel relevo, chapado, traço fino e cromia: temos a malha certa para cada tipo de estampa.</p>
          </div>
          <div className="passo">
            <span className="passo__numero">03</span>
            <h3 className="passo__titulo">Direto da fábrica</h3>
            <p>Sem revenda no meio: você compra direto de quem produz.</p>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="container cta-final__conteudo">
          <h2 className="cta-final__titulo">Pronto para escolher seu quadro?</h2>
          <Link to="/produtos" className="btn-primario">Ver catálogo completo</Link>
        </div>
      </section>
    </Layout>
  );
}

export default Home;