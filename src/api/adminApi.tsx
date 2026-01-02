import api from './apiClient';


export const adminApi = {
getProducts: () => api.get('/products/findAll'),
createProduct: (payload: any) => api.post('/admin/products', payload),
updateProduct: (id: number, payload: any) => api.put(`/admin/products/${id}`, payload),
deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
getAllUsers:()=>api.get('/admin/findAllUsers'),
deleteUser:(email:string)=>api.delete(`/user/deleteByEmail/${email}`),


getAllOrders: () => api.get('/admin/orders'),
};