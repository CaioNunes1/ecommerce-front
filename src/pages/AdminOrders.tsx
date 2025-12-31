import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';


export default function AdminOrders() {
const [orders, setOrders] = useState<any[]>([]);


async function load() {
try {
const resp = await adminApi.getAllOrders();
const raw = resp.data || resp;
setOrders(Array.isArray(raw) ? raw : raw.data || []);
console.log(orders);
} catch (err) {
console.error(err);
}
}


useEffect(() => { load(); }, []);


return (
<Box style={{}}>
    <Typography variant="h5" gutterBottom>Pedidos</Typography>
        <Grid container spacing={2}>
            {orders.map(o => (
            <Grid item xs={12} key={o.id} sx={{width:270}}>
                <Card>
                    <CardContent>
                    <Typography>Pedido #{o.id} — {o.status}</Typography>
                    <Typography>Usuário: {o.user?.email}</Typography>
                    <Typography>Itens:</Typography>
                    <ul>
                    {o.items?.map((it: any) => (
                    <li key={it.id}>{it.product?.name} x {it.quantity}</li>
                    ))}
                    </ul>
                    </CardContent>
                </Card>
            </Grid>
    ))}
    </Grid>
</Box>
);
}