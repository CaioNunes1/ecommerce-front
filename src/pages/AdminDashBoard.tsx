import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { getReportsSummary, getSalesPerDay, getTopProducts } from '../api/adminApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard(){
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [s, sv, tp] = await Promise.all([
        getReportsSummary(),
        getSalesPerDay(14),
        getTopProducts(5)
      ]);
      setSummary(s);
      // normalize sales dates for chart (SalesPerDayDTO day may be string)
      const salesData = (sv || []).map((row: any) => ({
        day: row.day ? row.day.toString().slice(0,10) : row.day,
        orders: row.ordersCount ?? row.orders_count ?? 0,
        revenue: Number(row.revenue ?? 0)
      }));
      setSales(salesData);
      setTopProducts(tp || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress/></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total de pedidos</Typography>
              <Typography variant="h5">{summary?.totalOrders ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Receita total</Typography>
              <Typography variant="h5">R$ {(summary?.totalRevenue ?? 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Clientes</Typography>
              <Typography variant="h5">{summary?.totalUsers ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent style={{ height: 300 }}>
              <Typography variant="subtitle1">Vendas últimos 14 dias</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Top produtos (por quantidade)</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalQuantity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
