function obterTokenCliente() {
  let token = localStorage.getItem('cliente_token');

  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('cliente_token', token);
  }

  return token;
}

export default obterTokenCliente;