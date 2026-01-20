import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { useCart } from "../context/CartContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Typography,
  Alert,
  TextField,
  CardMedia,
} from "@mui/material";
import { resolveImageUrl } from "../api/adminApi";

type Product = {
  id: number;
  name: string;
  sku?: string | null;
  price?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  _resolvedImage?: string | null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const { addToCart } = useCart(); // espera: addToCart(productId, qty)
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = await getProductById(Number(id));
        if (!mounted) return;
        // normalize product a bit
        const resolved = (p?.imageUrl ?? p?.imagePath) ? resolveImageUrl(p.imageUrl ?? p.imagePath) : null;
        setProduct({ ...(p as Product), _resolvedImage: resolved });
        setResolvedImage(resolved);
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;
  if (!product) return <Typography sx={{ p: 3 }}>Produto não encontrado</Typography>;

  const handleAdd = () => {
    // defensivo: só chama se addToCart existir
    try {
      if (typeof addToCart === "function") {
        addToCart(product.id, qty);
      } else {
        console.warn("CartContext não implementa addToCart(productId, qty)");
      }
      setOpen(true);
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho", err);
    }
  };

  const onQtyChange = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n) || n < 1) setQty(1);
    else setQty(Math.floor(n));
  };

  const fmt = (n?: number | null) => (typeof n === "number" ? n.toFixed(2) : "0.00");

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
          <Box sx={{ width: { xs: "100%", md: 320 }, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {resolvedImage ? (
              <CardMedia
                component="img"
                src={resolvedImage}
                alt={product.name}
                sx={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 1 }}
              />
            ) : (
              <Box sx={{ width: "100%", height: 220, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1 }}>
                <Typography variant="caption">Sem imagem</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">{product.name}</Typography>
            {product.sku && <Typography variant="caption" color="text.secondary">SKU: {product.sku}</Typography>}
            <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>{product.description}</Typography>
            <Typography variant="h6">R$ {fmt(product.price)}</Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                label="Quantidade"
                type="number"
                size="small"
                value={qty}
                onChange={(e) => onQtyChange(e.target.value)}
                inputProps={{ min: 1 }}
                sx={{ width: 120 }}
              />
              <Button variant="contained" onClick={handleAdd}>Adicionar ao carrinho</Button>
              <Button variant="outlined" onClick={() => navigate("/")}>Voltar</Button>
              <Button variant="outlined" onClick={() => navigate("/cart")}>Ir para o carrinho</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={open} autoHideDuration={1500} onClose={() => setOpen(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>Produto adicionado ao carrinho</Alert>
      </Snackbar>
    </Box>
  );
}
