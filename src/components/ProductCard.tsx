import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { type Product } from "../api/productApi";
import { useCart } from "../context/CartContext";
import Box from "@mui/material/Box";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* se tiver imagem use CardMedia; por enquanto um bloco de cor */}
      <Box sx={{ height: 140, bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="subtitle1">Imagem</Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: "hidden" }}>
          {product.description}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          R$ {Number(product.price).toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" component={RouterLink} to={`/product/${product.id}`}>
          Ver
        </Button>
        <Button size="small" onClick={() => addToCart(product.id)} variant="contained">
          Adicionar
        </Button>
      </CardActions>
    </Card>
  );
}
