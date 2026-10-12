import './Footer.css';

function Footer() {
  return (
    <footer id="rodape" className="rodape">
      <div className="container rodape__conteudo">
        <div>
          <strong className="rodape__marca">TF QUADROS</strong>
          <p className="rodape__texto">Quadros para serigrafia sob medida.</p>
        </div>
        <div className="rodape__contato">
          <p>tfquadros@terra.com.br</p>
          <p>(47) 3332-2923</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;