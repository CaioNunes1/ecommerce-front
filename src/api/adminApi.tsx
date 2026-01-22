import api from './apiClient';


export const adminApi = {
getProducts: () => api.get('/products/findAll'),
createProduct: (payload: any) => api.post('/admin/products', payload),
updateProduct: (id: number, payload: any) => api.put(`/admin/products/${id}`, payload),
deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
getAllUsers:()=>api.get('/admin/findAllUsers'),
deleteUser:(email:string)=>api.delete(`/user/deleteByEmail/${email}`),

getAllOrders: () => api.get('/admin/orders'),
updateOrderStatus: (orderId: number, status: string) =>
    api.put(`/admin/orders/${orderId}/status`, null, { params: { status } }),
};




export async function uploadProductImage(productId: number, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await api.post(`/admin/products/${productId}/image`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return resp.data;
}

export function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return undefined;
  // se já for absoluta, retorna como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  // se começar com '/', trate como relativo ao backend
  const backendBase = 'http://localhost:8080'; // ajuste se seu backend roda em outra porta/host
  if (imageUrl.startsWith('/')) return `${backendBase}${imageUrl}`;
  // caso sem barra inicial, também prefixa
  return `${backendBase}/${imageUrl}`;
}
export async function getReportsSummary() {
  const res = await api.get('/admin/reports/summary');
  return res.data;
}

export async function getSalesPerDay(days = 7) {
  const res = await api.get('/admin/reports/sales', { params: { days } });
  return res.data;
}

export async function getTopProducts(limit = 5) {
  const res = await api.get('/admin/reports/top-products', { params: { limit } });
  return res.data;
}
