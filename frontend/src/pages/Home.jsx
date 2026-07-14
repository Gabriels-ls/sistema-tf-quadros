import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import './Home.css';

function Home() {
  return (
    <Layout>
      <section className="hero">
        <div className="container hero__conteudo">
          <span className="eyebrow" style={{ color: 'var(--color-accent)' }}>Fabricação sob medida</span>
          <h1 className="hero__titulo">Quadros de serigrafia feitos para durar</h1>
          <p className="hero__texto">
            Estrutura resistente, medidas precisas e acabamento profissional para quem vive de imprimir.
          </p>
          <Link to="/produtos" className="btn-primario">Ver catálogo</Link>
        </div>
      </section>

      <section className="container secao">
        <span className="eyebrow">Sobre a TF Quadros</span>
        <h2 className="secao__titulo">Quem fabrica seus quadros</h2>
        <p className="secao__texto">
          Há anos produzindo quadros de serigrafia com foco em precisão dimensional e durabilidade,
          a TF Quadros atende gráficas e ateliês que não podem errar na hora de imprimir.
        </p>
      </section>

      <section className="container secao">
        <span className="eyebrow">Diferenciais</span>
        <h2 className="secao__titulo">Por que escolher a TF Quadros</h2>
        <div className="passos">
          <div className="passo">
            <span className="passo__numero">01</span>
            <h3 className="passo__titulo">Precisão dimensional</h3>
            <p>Medidas exatas, sem variação entre peças.</p>
          </div>
          <div className="passo">
            <span className="passo__numero">02</span>
            <h3 className="passo__titulo">Material de alta durabilidade</h3>
            <p>Estrutura reforçada para suportar uso intenso.</p>
          </div>
          <div className="passo">
            <span className="passo__numero">03</span>
            <h3 className="passo__titulo">Fabricação própria</h3>
            <p>Sem intermediários, direto de quem produz.</p>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="container cta-final__conteudo">
          <h2 className="cta-final__titulo">Pronto para ver os modelos?</h2>
          <Link to="/produtos" className="btn-primario">Ver catálogo completo</Link>
        </div>
      </section>
    </Layout>
  );
}

export default Home;