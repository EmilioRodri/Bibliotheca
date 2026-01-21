// Certifique-se de que este arquivo está na pasta src/utils/

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ajuste a porta se necessário (ex: 8080, 3000, 5000)
  const url = `http://localhost:8080${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se o token for inválido ou expirado, desloga o utilizador
    if (response.status === 403 || response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Sessão expirada.');
    }

    return response;
  } catch (error) {
    console.error("Falha na requisição:", error);
    throw error; 
  }
};