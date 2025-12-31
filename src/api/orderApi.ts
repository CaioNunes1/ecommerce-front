import api from "./api";
export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  sku?: string;
  price: number;
  description?: string;
  category?: Category;
};

export type OrderItem = {
  id?: number;
  product: Product;
  quantity: number;
  priceAtPurchase: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  // password e createdAt geralmente não precisaremos aqui
};

export type Order = {
  id: number;
  user: User;
  status: string;
  createdAt: string; // Instant serialized
  items: OrderItem[];
  // total ou other fields may exist
};

export async function createOrder(order: {
  userId: number;
  items: { productId: number; quantity: number }[];
}) {
  const res = await api.post("/orders/create", order);
  return res.data;
}

export async function getOrderById(orderId: number) {
  const res = await api.get<Order>(`orders/${orderId}`);
  return res.data;
}

export async function getAllOrders() {
  const res = await api.get<Order>(`orders/findAll`);
  return res.data;
}

