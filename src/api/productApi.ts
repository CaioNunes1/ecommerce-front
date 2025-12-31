import api from "./api";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export async function getProducts() {
  const res = await api.get<Product[]>("/products/findAll");
  return res.data;
}

export async function getProductById(id: number) {
  const res = await api.get<Product>(`/products/${id}`);
  return res.data;
}

export async function deleteProductById(id: number) {
  const res = await api.delete<Product>(`/products/deleteById/${id}`);
  return res.data;
}