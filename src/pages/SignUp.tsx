// src/pages/SignUp.tsx
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Alert } from "@mui/material";
import { signUp } from "../api/authApi";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({ name, email, password, role: "ROLE_USER" });
      // após cadastro, redireciona para login
      navigate("/signin");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err?.message ?? "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2}>
      <Paper sx={{ width: 420, p: 4 }}>
        <Typography variant="h5" mb={2}>Criar conta</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Nome" fullWidth required value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }}/>
          <TextField label="E-mail" fullWidth required value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }}/>
          <TextField label="Senha" type="password" fullWidth required value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }}/>
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "Cadastrando..." : "Criar conta"}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Já tem conta? <RouterLink to="/signin">Entrar</RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
