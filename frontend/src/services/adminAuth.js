const CHAVE_TOKEN_ADMIN = 'admin_token';

export function salvarTokenAdmin(token) {
  localStorage.setItem(CHAVE_TOKEN_ADMIN, token);
}

export function obterTokenAdmin() {
  return localStorage.getItem(CHAVE_TOKEN_ADMIN);
}

export function limparTokenAdmin() {
  localStorage.removeItem(CHAVE_TOKEN_ADMIN);
}
