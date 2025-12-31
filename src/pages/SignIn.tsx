import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../api/authApi';


export default function SignIn() {
const { login } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState<string | null>(null);
const navigate = useNavigate();


async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
        //await signIn({email, password});
        await login(email, password);
        if(email === 'admin@local' && password === 'admin123'){
            navigate('/admin/products');
            return;
        }
        else{
            navigate('/');
        }
        
    } 
    catch (err) {
        setError('Login failed — check credentials and backend running');
        console.error(err);
}
}


return (
<Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }} component="form" onSubmit={handleSubmit}>
    <Typography variant="h5" gutterBottom>Sign In</Typography>
    <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
    <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
    <div>
        <Button variant="contained" type="submit"
        style={{ marginTop: '16px', display: 'flex', justifyContent:'center', alignContent:'center' }}
        >Sign in</Button>
    </div>
    <div style={{ marginTop: '16px', display: 'flex', justifyContent:'center' }}>
        Não tem uma conta ainda? <a href="/signup">Sign up</a>
    </div>
    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
</Box>
);
}