// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { resolveImageUrl } from '../api/adminApi'; // importe sua função que resolve URLs

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

export default function Home() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const resp = await getProducts();
      const raw = (resp && (resp as any).data) ? (resp as any).data : resp;
      const list: Product[] = Array.isArray(raw) ? raw : [];

      // Normaliza as URLs para absolute (resolveImageUrl deve aceitar '/images/...' ou null)
      const normalized = list.map(p => {
        const rawPath = p.imageUrl ?? p.imagePath ?? null;
        const resolved = rawPath ? resolveImageUrl(rawPath) : null;
        return { ...p, _resolvedImage: resolved };
      });

      setProducts(normalized);
      console.log('Produtos carregados:', normalized);
    } catch (err) {
      console.error('Erro ao carregar produtos', err);
      setError('Erro ao carregar produtos. Veja console.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Loja</Typography>

      {user ? (
        <Typography sx={{ mb: 2 }}>Bem-vindo, {user.name}</Typography>
      ) : (
        <Button onClick={() => navigate('/signin')} sx={{ mb: 2 }}>
          Sign in
        </Button>
      )}

      {isAdmin && (
        <Button sx={{ ml: 2, mb: 2 }} variant="outlined" onClick={() => navigate('/admin/products')}>
          Ir para Admin
        </Button>
      )}

      {loading && <Typography>Carregando produtos...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && products.length === 0 && !error && <Typography>Nenhum produto encontrado.</Typography>}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {products.map((p) => (
          <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {p._resolvedImage ? (
                <CardMedia
                  component="img"
                  image={p._resolvedImage}
                  alt={p.name}
                  sx={{ height: 140, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="caption">Imagem</Typography>
                </Box>
              )}

              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" noWrap>{p.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {p.description}
                </Typography>
                <Typography variant="subtitle1">
                  R$ {typeof p.price === 'number' ? p.price.toFixed(2) : Number(p.price || 0).toFixed(2)}
                </Typography>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => navigate(`/product/${p.id}`)}>View</Button>
                {isAdmin && <Button size="small" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>Editar</Button>}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
