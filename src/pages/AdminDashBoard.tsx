import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { getReportsSummary, getSalesPerDay, getTopProducts } from '../api/adminApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Chip from '@mui/material/Chip';
import { Area } from 'recharts';
import { adminApi } from '../api/adminApi';

export default function AdminDashboard(){
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [clientsNumber, setClientsNumber] = useState<number>(0);

  async function load() {
    setLoading(true);
    try {
      const [s, sv, tp,cl] = await Promise.all([
        getReportsSummary(),
        getSalesPerDay(14),
        getTopProducts(5),
        adminApi.getAllUsers()
      ]);
      setSummary(s);
      // normalize sales dates for chart (SalesPerDayDTO day may be string)
      const salesData = (sv || []).map((row: any) => ({
        day: row.day ? row.day.toString().slice(0,10) : row.date,
        orders: row.ordersCount ?? row.totalOrders ?? 0,
        revenue: Number(row.revenue ?? row.totalRevenue)
      }));
      setClientsNumber((cl && (cl as any).data) ? (cl as any).data.length : 0);
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
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
  <Typography variant="h4" gutterBottom sx={{ 
    mb: 3, 
    fontWeight: 600,
    color: 'primary.main'
  }}>
    Admin Dashboard
  </Typography>

  {/* Seção de Métricas */}
  <Grid container spacing={3}>
    {/* Card 1: Total de Pedidos */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}>
        <CardContent sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          backgroundColor: 'rgba(25, 118, 210, 0.05)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'primary.light',
            mb: 2
          }}>
            <ShoppingCartOutlined sx={{ fontSize: 28, color: 'primary.main' }} />
          </Box>
          <Typography variant="subtitle2" sx={{ 
            color: 'text.secondary',
            fontSize: 14,
            fontWeight: 500,
            mb: 1
          }}>
            TOTAL DE PEDIDOS
          </Typography>
          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: 1
          }}>
            {summary?.totalOrders ?? 0}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <TrendingUp fontSize="small" /> +12% vs mês anterior
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Card 2: Receita Total */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}>
        <CardContent sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          backgroundColor: 'rgba(76, 175, 80, 0.05)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'success.light',
            mb: 2
          }}>
            <AttachMoneyOutlined sx={{ fontSize: 28, color: 'success.main' }} />
          </Box>
          <Typography variant="subtitle2" sx={{ 
            color: 'text.secondary',
            fontSize: 14,
            fontWeight: 500,
            mb: 1
          }}>
            RECEITA TOTAL
          </Typography>
          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            color: 'success.main',
            mb: 1
          }}>
            R$ {(summary?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <TrendingUp fontSize="small" /> +8% vs mês anterior
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Card 3: Clientes */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}>
        <CardContent sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          backgroundColor: 'rgba(156, 39, 176, 0.05)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'secondary.light',
            mb: 2
          }}>
            <PeopleOutlined sx={{ fontSize: 28, color: 'secondary.main' }} />
          </Box>
          <Typography variant="subtitle2" sx={{ 
            color: 'text.secondary',
            fontSize: 14,
            fontWeight: 500,
            mb: 1
          }}>
            CLIENTES
          </Typography>
          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            color: 'secondary.main',
            mb: 1
          }}>
            {clientsNumber}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <TrendingUp fontSize="small" /> +5% vs mês anterior
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Gráfico de Vendas */}
    <Grid item xs={12} md={8}>
      <Card sx={{ 
        height: 400,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ height: '100%', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Vendas últimos 14 dias
            </Typography>
            <Chip 
              label="Últimos 14 dias" 
              size="small" 
              sx={{ backgroundColor: 'primary.light', color: 'primary.main' }}
            />
          </Box>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                labelFormatter={(label) => `Dia: ${label}`}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1976d2" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6, fill: '#1976d2' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                fill="rgba(25, 118, 210, 0.1)" 
                stroke="none" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>

    {/* Gráfico de Top Produtos */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: 400,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ height: '100%', p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Top produtos (por quantidade)
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="productName" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#666', fontSize: 11, angle: -45, textAnchor: 'end' }}
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [value, 'Quantidade']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="totalQuantity" 
                fill="#4caf50"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Box>
  );
}
