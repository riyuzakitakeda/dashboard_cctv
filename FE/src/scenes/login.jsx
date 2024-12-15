import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth } from '../auth/auth_provider';
import { HeaderData } from '../data/headerCostum';
import Logo from '../assets/image/logoPemkot.png';
import { FormControl, Grid, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import Left_background from "../assets/image/backgroud_login.png";
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Copyright(props) {
    return (
        <Typography variant="body2" color="darkslategray" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://diskominfo.makassarkota.go.id/">
                Diskominfo Kota Makassar
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const Login = () => {
    const { login, token } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        
        setLoading(true);
        setError(null); // Reset error state before submission

        const username = data.get('username');
        const password = data.get('password');

        if (!username || !password) {
            setLoading(false);
            setError("Username and password are required.");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}api/user/login`, {
                method: 'POST',
                headers: HeaderData(token), // Use the updated HeaderData
                body: JSON.stringify({ username, password }),
            });
            
            const resData = await response.json();

            if (response.ok) {
                login(resData); // Assuming login function saves the token
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container sx={{
            width: "100%",
            height: "100vh"
        }}>
            <Grid item md={6} sx={{
                background: `url(${Left_background})`,
                backgroundSize: 'cover'
            }}>
            </Grid>
            <Grid item md={6} alignContent={"center"}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <img src={Logo} alt="Kota Makassar" width={'150px'} />
                    </Box>
                    <Typography margin={2} width={300} align='center' textTransform={"uppercase"} variant='h4' fontWeight={700}>
                        {"SISTEM INFORMASI MANAJEMEN ASET TIK"}
                    </Typography>
                    <Box
                        sx={{
                            height: 2,
                            width: '50%',
                            marginX: 20,
                            marginTop: 1
                        }}
                    />
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "80%" }}>
                        {error && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <FormControl fullWidth>
                            <Typography>
                                {"Username"}
                            </Typography>
                            <OutlinedInput
                                id="username_id"
                                type="text"
                                label=""
                                name='username'
                                placeholder="Username"
                            />
                        </FormControl>
                        <FormControl fullWidth sx={{ mt: 4}}>
                            <Typography>
                                {"Password"}
                            </Typography>
                            <OutlinedInput
                                id="password_id"
                                type={showPassword ? 'text' : 'password'}
                                label=""
                                placeholder="Password"
                                name='password'
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                backgroundColor: '#D30007',
                            }}
                            size='large'
                            disabled={loading} // Disable button while loading
                        >
                            <Typography textTransform={'none'}>
                                {loading ? "Logging in..." : "Login"}
                            </Typography>
                        </Button>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Box>
            </Grid>
        </Grid>
    );
}

export default Login;
