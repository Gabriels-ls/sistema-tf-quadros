// Atalhos para os blocos da página, com as teclas de acesso padronizadas pelo eMAG
// (1 conteúdo, 2 menu e 4 rodapé). O primeiro link da página leva ao conteúdo.
const ATALHOS = {
  conteudo: { destino: '#conteudo', tecla: '1', texto: 'Ir para o conteúdo' },
  menu: { destino: '#menu', tecla: '2', texto: 'Ir para o menu' },
  rodape: { destino: '#rodape', tecla: '4', texto: 'Ir para o rodapé' },
};

function Atalhos({ itens = ['conteudo', 'menu', 'rodape'] }) {
  return (
    <ul className="atalhos">
      {itens.map((item) => {
        const { destino, tecla, texto } = ATALHOS[item];
        return (
          <li key={item}>
            <a href={destino} accessKey={tecla}>
              {texto} [{tecla}]
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default Atalhos;
