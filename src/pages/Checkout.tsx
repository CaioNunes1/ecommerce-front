// src/pages/Checkout.tsx
import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderApi";
import { useNavigate } from "react-router-dom";
import { getProductById, type Product } from "../api/productApi";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
  Alert,
} from "@mui/material";
import { resolveImageUrl } from '../api/adminApi'; // <--- usar função que resolve URL em seu projeto
import { useAuth } from "../context/AuthContext";

type Line = { product: Product & { _resolvedImage?: string | null }; quantity: number };

export default function Checkout() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setError(null);
      if (!items || items.length === 0) {
        setLines([]);
        return;
      }
      setLoading(true);
      try {
        const ids = items.map((i) => i.productId);
        const settled = await Promise.allSettled(ids.map((id) => getProductById(id)));
        const products: Product[] = settled
          .filter((s) => s.status === "fulfilled")
          .map((s) => (s as PromiseFulfilledResult<Product>).value);

        // mapeia products para linhas e resolve a URL da imagem (apenas aqui)
        const newLines: Line[] = products.map((p) => {
          const qty = items.find((i) => i.productId === p.id)?.quantity ?? 1;

          // obtém o campo imageUrl ou imagePath (conforme seu backend)
          const raw = (p as any).imageUrl ?? (p as any).imagePath ?? null;

          // use resolveImageUrl se existir; se não existir, tenta fallback simples
          let resolved: string | null = null;
          try {
            if (raw) resolved = resolveImageUrl(raw);
          } catch (e) {
            // fallback: se raw começar com / ou http use como está; senão prefixe com base
            if (typeof raw === 'string') {
              if (raw.startsWith('http')) resolved = raw;
              else if (raw.startsWith('/')) resolved = `${window.location.origin}${raw}`;
              else resolved = `${window.location.origin}/images/${raw}`;
            } else resolved = null;
          }

          return { product: { ...p, _resolvedImage: resolved }, quantity: qty };
        });

        if (!mounted) return;
        setLines(newLines);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        if (mounted) setError("Erro ao carregar produtos");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [items]);

  const total = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);

  const handleCheckout = async () => {
    if (!items || items.length === 0) return;
    setSubmitting(true);
    setError(null);

    const payload = { userId: user?.id, items };

    try {
      const result = await createOrder(payload);
      console.log("Order created:", result);
      clearCart();
      setSuccessOpen(true);
      setTimeout(() => navigate("/"), 1400);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      setError("Erro ao criar pedido. Veja console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && lines.length === 0 && <Typography>Seu carrinho está vazio</Typography>}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {lines.map(({ product, quantity }) => (
          <Grid item xs={12} key={product.id}>
            <Card>
              <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {/* Aqui mostramos a imagem resolvida sem afetar outras páginas */}
                {product._resolvedImage ? (
                  <CardMedia
                    component="img"
                    image={product._resolvedImage}
                    alt={product.name}
                    sx={{ width: 100, height: 70, objectFit: "cover", borderRadius: 1 }}
                  />
                ) : (
                  <Box sx={{ width: 100, height: 70, bgcolor: "grey.100", display: "flex",
                             alignItems: "center", justifyContent: "center", borderRadius: 1 }}>
                    <Typography variant="caption">Imagem</Typography>
                  </Box>
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                </Box>
                <Box>
                  <Typography>Qtd: {quantity}</Typography>
                  <Typography variant="subtitle1">R$ {(Number(product.price) * quantity).toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {lines.length > 0 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Total: R$ {total.toFixed(2)}</Typography>
          <Box>
            <Button variant="outlined" sx={{ mr: 1 }} onClick={() => navigate("/cart")}>
              Voltar ao carrinho
            </Button>
            <Button variant="contained" onClick={handleCheckout} disabled={submitting}>
              {submitting ? "Confirmando..." : "Confirmar pedido"}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar open={successOpen} autoHideDuration={2000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>Pedido confirmado com sucesso!</Alert>
      </Snackbar>
    </Box>
  );
}
