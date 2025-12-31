// src/pages/ProductDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, type Product } from "../api/productApi";
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
} from "@mui/material";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = await getProductById(Number(id));
        if (!mounted) return;
        setProduct(p);
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

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
  );

  if (!product) return <Typography>Produto não encontrado</Typography>;

  const handleAdd = () => {
    addToCart(product.id, 1);
    setOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ width: 260, height: 220, bgcolor: "grey.100", display: "flex",
                     alignItems: "center", justifyContent: "center", borderRadius: 1 }}>
            <Typography variant="caption">Imagem</Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">{product.name}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
              {product.description}
            </Typography>
            <Typography variant="h6">R$ {Number(product.price).toFixed(2)}</Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleAdd}>Adicionar ao carrinho</Button>
              <Button variant="outlined" onClick={() => navigate("/")}>Voltar</Button>
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
