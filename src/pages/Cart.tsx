import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";

import { useCart } from "../context/CartContext";
import { getProductById } from "../api/productApi";
import { useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../api/adminApi";
import { CardMedia } from "@mui/material";

type CartLine = { product: Product; quantity: number };

type Product = {
  id: number;
  name: string;
  sku?: string;
  price?: number;
  description?: string;
  imageUrl?: string | null;
  imagePath?: string | null;
  _resolvedImage?: string | null; // campo local para URL absoluta
};

export default function Cart() {
  const { items, removeFromCart, setQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      if (!items || items.length === 0) {
        setProducts([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const promises = items.map((i) => getProductById(i.productId));
        const results = await Promise.all(promises);
        if (!mounted) return;

        const normalized = results.map(p => {
                const rawPath = p.imageUrl ?? p.imagePath ?? null;
                const resolved = rawPath ? resolveImageUrl(rawPath) : null;
                return { ...p, _resolvedImage: resolved };
              });
        setProducts(normalized);
        console.log("Produtos do carrinho carregados:", normalized);
      } catch (err) {
        console.error("Erro ao carregar produtos do carrinho", err);
        if (mounted) setError("Erro ao carregar produtos");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => { mounted = false; };
  }, [items]);

  const lines: CartLine[] = items
    .map((i) => {
      const p = products.find((prod) => prod.id === i.productId);
      return p ? { product: p, quantity: i.quantity } : null;
    })
    .filter(Boolean) as CartLine[];

  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * (l.quantity ?? 1), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Carrinho</Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      )}

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {!loading && lines.length === 0 && <Typography>Seu carrinho está vazio</Typography>}

      <Stack spacing={2} sx={{ mt: 1 }}>
        {lines.map(({ product, quantity }) => (
          <Card key={product.id}>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {product._resolvedImage ? (
                <CardMedia
                  component="img"
                  image={product._resolvedImage}
                  alt={product.name}
                  sx={{ height: 80, width:120, objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{
                  width: 120, height: 80, bgcolor: "grey.100", display: "flex",
                  alignItems: "center", justifyContent: "center", borderRadius: 1
                }}>
                  <Typography variant="caption">Imagem</Typography>
                </Box>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" noWrap>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {product.description}
                </Typography>
                <Typography variant="subtitle1">R$ {Number(product.price).toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Qtd"
                  size="small"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(product.id, Number(e.target.value || 0))}
                  inputProps={{ min: 1 }}
                  sx={{ width: 90 }}
                />
                <IconButton color="error" onClick={() => removeFromCart(product.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {lines.length > 0 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Subtotal: R$ {subtotal.toFixed(2)}</Typography>

          <Box>
            <Button variant="outlined" sx={{ mr: 1 }} onClick={() => navigate("/")}>Continuar comprando</Button>
            <Button variant="contained" onClick={() => navigate("/checkout")}>Finalizar compra</Button>
          </Box>
        </Box>
      )}
      <Button variant="outlined" onClick={() => navigate("/")}>Voltar</Button>
    </Box>
  );
}
