// src/pages/AdminProducts.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, Typography, Button, TextField, Grid, Card, CardContent, 
  CardActions, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, ListItemIcon, ListItemText, CardMedia, CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { uploadProductImage } from '../api/adminApi';
import { adminApi } from '../api/adminApi';
import { resolveImageUrl } from '../api/adminApi';

type Product = { id: number; name: string; sku?: string; price?: number; description?: string; imageUrl?: string };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [description, setDescription] = useState('');

  // menu/edit states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>('');
  const [editDescription, setEditDescription] = useState('');

  // upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [productForUpload, setProductForUpload] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    try {
      const resp = await adminApi.getProducts();
      const raw = (resp as any).data ?? resp;

      const normalized = (Array.isArray(raw) ? raw : raw.data ?? []).map((p: any) => ({
        ...p,
        imageUrl: resolveImageUrl(p.imageUrl ?? p.imagePath),
      }));

      setProducts(normalized);
    } catch (err) {
      console.error('Erro carregar produtos', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { load(); }, []);

  async function handleAdd() {
    const payload = { name, price: Number(price), description };
    await adminApi.createProduct(payload);
    setName(''); setPrice(''); setDescription('');
    load();
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedProduct(null); };

  const handleEditClick = () => {
    if (!selectedProduct) return;
    setEditingProduct(selectedProduct);
    setEditName(selectedProduct.name);
    setEditPrice(selectedProduct.price ?? '');
    setEditDescription(selectedProduct.description ?? '');
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const payload = { name: editName, price: Number(editPrice), description: editDescription };
    await adminApi.updateProduct(editingProduct.id, payload);
    setEditDialogOpen(false);
    load();
  };

  const handleDeleteClick = async () => {
    if (!selectedProduct) return;
    if (!confirm(`Tem certeza que deseja excluir "${selectedProduct.name}"?`)) {
      handleMenuClose(); return;
    }
    await adminApi.deleteProduct(selectedProduct.id);
    handleMenuClose();
    load();
  };

  // --- IMAGE UPLOAD HANDLERS ---
  // when user clicks image area, set productForUpload and open file dialog
  const onImageAreaClick = (product: Product) => {
    setProductForUpload(product);
    if (fileInputRef.current) fileInputRef.current.value = ''; // reset
    fileInputRef.current?.click();
  };

  // file selected -> upload
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file || !productForUpload) return;
    const productId = productForUpload.id;
    try {
      setUploadingId(productId);
      const updated = await uploadProductImage(productId, file);
      console.log('upload result', updated);
      // updated should return product with imageUrl (backend)
      // update local state (replace product)
      const imageUrlRaw = (updated as any).imageUrl ?? (updated as any).imagePath ?? null;
      const absoluteUrl = resolveImageUrl(imageUrlRaw);

      // atualiza produto retornado pelo backend com URL absoluta
      setProducts((prev) =>
        prev.map(p => p.id === productId ? { ...p, ...(updated as any), imageUrl: absoluteUrl } : p)
      );
    } catch (err: any) {
      console.error('Erro upload', err);
      setUploadError('Falha ao enviar imagem');
    } finally {
      setUploadingId(null);
      setProductForUpload(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Produtos</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Adicionar produto</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField label="Nome" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Preço" type="number" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Descrição" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button variant="contained" onClick={handleAdd} fullWidth sx={{ height: '56px' }}>Adicionar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {products.map(p => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* clickable image area */}
              <Box
                onClick={() => onImageAreaClick(p)}
                sx={{
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: p.imageUrl ? 'transparent' : 'grey.100',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {uploadingId === p.id ? (
                  <CircularProgress />
                ) : p.imageUrl ? (
                  <CardMedia component="img" src={p.imageUrl} alt={p.name} sx={{ maxHeight: 140, width: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography variant="caption">Clique aqui para adicionar imagem</Typography>
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom noWrap>{p.name}</Typography>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, p)} aria-label="opções">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  R$ {p.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">{p.description || 'Sem descrição'}</Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Button size="small" startIcon={<EditIcon />} onClick={() => { setEditingProduct(p); setEditName(p.name); setEditPrice(p.price ?? ''); setEditDescription(p.description ?? ''); setEditDialogOpen(true); }}>
                  Editar
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { if (confirm(`Excluir "${p.name}"?`)) { apiDelete(p.id).then(() => load()); } }}>
                  Excluir
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* hidden file input used for all cards */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Produto
          <IconButton aria-label="close" onClick={() => setEditDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField label="Nome" fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} margin="normal" /></Grid>
            <Grid item xs={12}><TextField label="Preço" type="number" fullWidth value={editPrice} onChange={(e) => setEditPrice(e.target.value)} margin="normal" /></Grid>
            <Grid item xs={12}><TextField label="Descrição" fullWidth multiline rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} margin="normal" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {products.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">Nenhum produto encontrado.</Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}><Typography variant="body1">Carregando produtos...</Typography></Box>
      )}
    </Box>
  );
}
