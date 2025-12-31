// src/pages/MyOrders.tsx
import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

type Order = {
  id: number;
  status: string;
  createdAt: string;
  items?: any[];
  user?: any;
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data);
      } catch (e:any) {
        setErr("Erro ao carregar pedidos.");
        console.error(e);
      }
    })();
  }, [user]);

  if (!user) return <div>Faça login para ver seus pedidos.</div>;

  return (
    <div>
      <h2>Meus Pedidos</h2>
      {err && <div style={{color: "red"}}>{err}</div>}
      {orders.length === 0 ? <p>Você não tem pedidos.</p> : (
        orders.map(o => (
          <div key={o.id} style={{borderBottom: "1px solid #eee", padding: 8}}>
            <div>Pedido #{o.id} — {o.status} — {new Date(o.createdAt).toLocaleString()}</div>
            <div>Itens: {o.items?.length ?? 0}</div>
          </div>
        ))
      )}
    </div>
  );
}
