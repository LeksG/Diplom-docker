// 1. Головна функція-перехоплювач
async function fetchWithInterceptor(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, { ...options, headers });

  // Глобальна обробка 401 Unauthorized
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      console.warn("Токен недійсний. Виходимо з акаунту...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; 
    }
    throw new Error('401 Unauthorized');
  }

  if (response.ok) {
     return response.json();
  }
  
  // Якщо є інша помилка 
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || errorData.error || 'Помилка запиту');
}

// 2. Сервіс для Товарів
export const ProductService = {
  search: (query: string) => fetchWithInterceptor(`/api/search?q=${encodeURIComponent(query)}`),
  getAll: () => fetchWithInterceptor('/api/products', { cache: 'no-store' }),
  
  getById: (id: string | number) => fetchWithInterceptor(`/api/products/${id}`, { cache: 'no-store' }),

  create: (data: any) => fetchWithInterceptor('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string | number, data: any) => fetchWithInterceptor(`/api/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string | number) => fetchWithInterceptor(`/api/products/${id}`, {
    method: 'DELETE',
  })
};

export const CategoryService = {
  getAll: () => fetchWithInterceptor('/api/categories', { cache: 'no-store' })
};

// 3. Сервіс для Авторизації 
export const AuthService = {
  login: (data: any) => fetchWithInterceptor('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data), 
  }),
  
  register: (data: any) => fetchWithInterceptor('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
};

// 4. Сервіс для Користувача
export const UserService = {
  getCurrentUser: () => fetchWithInterceptor('/api/user', { method: 'POST' }),
  getProfile: (email: string) => fetchWithInterceptor('/api/user', { 
    method: 'POST', 
    body: JSON.stringify({ email }) 
  }),
  updateProfile: (data: any) => fetchWithInterceptor('/api/user', { 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  }),
};

// Сервіс для роботи з медіафайлами
export const MediaService = {
  getAll: () => fetchWithInterceptor('/api/media', { cache: 'no-store' })
};

export const OrderService = {
  update: (id: string | number, data: any) => fetchWithInterceptor(`/api/order/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string | number) => fetchWithInterceptor(`/api/order/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  }),
  
  getMyOrders: (email: string) => fetchWithInterceptor(`/api/order?email=${email}`, {
    method: 'GET',
  }),

  createOrder: (orderData: any) =>
    fetchWithInterceptor('/api/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

    createCheckoutSession: (data: { items: any[]; email: string }) =>
    fetchWithInterceptor('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    })
};

// Сервіс для роботи з Відгуками
export const ReviewService = {
  create: (data: any) => fetchWithInterceptor('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string | number, data: any) => fetchWithInterceptor(`/api/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string | number, data: any) => fetchWithInterceptor(`/api/reviews/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(data), 
  })
};

export const ContactService = {
  sendFeedback: (data: { name: string; contactInfo: string; message: string }) => 
    fetchWithInterceptor('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};