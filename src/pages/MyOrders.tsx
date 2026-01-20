// src/pages/MyOrders.tsx
import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  Button
} from "@mui/material";

type Product = {
  id: number;
  name?: string;
  price?: number | null;
  imageUrl?: string | null;
  imagePath?: string | null;
};

type OrderItem = {
  id: number;
  quantity: number;
  priceAtPurchase?: number | null;
  product?: Product | null;
};
import { useNavigate } from "react-router-dom";

type Order = {
  id: number;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
  user?: any;
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data || []);
        console.log("Meus pedidos:", res.data);
      } catch (e: any) {
        setErr("Erro ao carregar pedidos.");
        console.error(e);
      }
    })();
  }, [user]);

  if (!user) return <div>Faça login para ver seus pedidos.</div>;

  const fmtPrice = (v?: number | null) =>
    (v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Meus Pedidos</Typography>

      {err && <Typography color="error" sx={{ mb: 2 }}>{err}</Typography>}

      {orders.length === 0 ? (
        <Typography>Você não tem pedidos.</Typography>
      ) : (
        <Grid container spacing={2}>
          {orders.map((o) => {
            const items = o.items ?? [];
            const orderTotal = items.reduce((s, it) => {
              const price = it.priceAtPurchase ?? it.product?.price ?? 0;
              const qty = it.quantity ?? 1;
              return s + price * qty;
            }, 0);

            return (
              <Grid item xs={12} key={o.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6">Pedido #{o.id}</Typography>
                      <Box>
                        <Chip label={o.status ?? "—"} color={o.status === "DONE" ? "success" : o.status === "CANCELLED" ? "error" : "default"} />
                        <Typography variant="caption" sx={{ ml: 2 }}>
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    {items.length === 0 ? (
                      <Typography>Sem itens</Typography>
                    ) : (
                      items.map((it) => {
                        const productName = it.product?.name ?? "Produto desconhecido";
                        const price = it.priceAtPurchase ?? it.product?.price ?? 0;
                        const qty = it.quantity ?? 1;
                        return (
                          <Box key={it.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>{productName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                R$ {fmtPrice(price)} × {qty} = R$ {fmtPrice(price * qty)}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })
                    )}

                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Total: R$ {fmtPrice(orderTotal)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                
              </Grid>
            );
          })}
          
        </Grid>
      )}
      <Button onClick={() => navigate(`/`)}>Voltar para a página principal</Button>
    </Box>
  );
}
