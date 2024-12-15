import React, { useState, useEffect, useCallback } from "react";
import {
    Button, Modal,
    useTheme, Typography,
    Grid, TextField,
    Divider, Fade,
    MenuItem, Select,
    InputLabel, FormControl,
    Checkbox, FormControlLabel
} from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import ShowAlert from "../../global/alert";
import { useAuth } from "../../../auth/auth_provider";
import { EditNoteRounded } from "@mui/icons-material";

const EditdataUser = ({ id, execute }) => {
    const { token, logout } = useAuth();
    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [dataUser, setDataUser] = useState({
        username: '',
        password: '',
        nama: '',
        email: '',
        no_hp: '',
        skpd_id: '',
        role: '',
        status: 'active' // Default status
    });

    const [passwordValue, setPasswordValue] = useState('');
    const [openPassword, setOpenPassword] = useState(false);
    const handleOpenPassword = () => setOpenPassword(!openPassword);
    
    const [alertOption, setAlertOption] = useState({
        title: '',
        desc: '',
        type: 'info'
    });
    
    const [openAlert, setOpenAlert] = useState(false);
    const handleAlertClose = () => setOpenAlert(false);
    const [skpdOptions, setSkpdOptions] = useState([]); // State for SKPD options

    const getDataUser = useCallback(() => {
        fetch(`${process.env.REACT_APP_API_URL}api/user/${id}`, {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => {
                if(res.status === 403){
                    logout()
                }
                return res.json()}
            )
            .then(data => {
                setDataUser(data); // Set all user data
            })
            .catch(err => console.log(err));
    }, [id, token]);

    const fetchSkpdData = useCallback(() => {
        fetch(`${process.env.REACT_APP_API_URL}api/skpd`, { // Adjust the endpoint as needed
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => {
                if(res.status === 403){
                    logout()
                }
                return res.json()
            })
            .then(data => {
                setSkpdOptions(data); // Store the fetched SKPD options
            })
            .catch(err => console.log(err));
    }, [token]);

    const sendEditData = useCallback(() => {
        const updatedUserData = {
            ...dataUser,
            password: passwordValue ? passwordValue : undefined // Only update password if provided
        };

        fetch(`${process.env.REACT_APP_API_URL}api/user/${id}`, {
            method: 'put',
            headers: HeaderData(token),
            body: JSON.stringify(updatedUserData)
        })
            .then(res => res.json())
            .then(data => {
                execute();
                if (data.code === 500) {
                    setAlertOption({ title: 'Gagal', desc: data.message, type: 'error' });
                } else if (data.code === 200) {
                    setAlertOption({ title: 'Sukses', desc: data.message, type: 'success' });
                    handleCloseModal();
                }
                setOpenAlert(true);
                getDataUser();
                setTimeout(handleAlertClose, 4000);
            })
            .catch(err => console.log(err));
    }, [id, execute, getDataUser, dataUser, passwordValue, token]);

    useEffect(() => {
        if (openModal) {
            getDataUser();
            fetchSkpdData(); // Fetch SKPD data when modal opens
        }
    }, [openModal, getDataUser, fetchSkpdData]);

    return (
        <div>
            <ShowAlert
                desc={alertOption.desc}
                title={alertOption.title}
                onAlertClose={handleAlertClose}
                openAlert={openAlert}
                type={alertOption.type}
            />
            <Button
                variant='contained'
                sx={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                    ":hover": { backgroundColor: colors.greenAccent[800] }
                }}
                onClick={handleOpenModal}
                size="small"
            >
                <EditNoteRounded />
            </Button>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Fade in={openModal}>
                    <Grid container item xs={11} md={7} lg={5} sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: colors.primary[400],
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 24
                    }}>
                        <Grid item container justifyContent={"space-between"} alignItems={"end"}>
                            <Typography variant="h4">Edit Data User</Typography>
                            <Button
                                variant="text"
                                sx={{ justifyContent: "center", alignItems: "center", minWidth: 25 }}
                                onClick={handleCloseModal}
                            >
                                <Typography variant="button" color={colors.redAccent[400]}>x</Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={12} paddingTop={2}>
                            <Divider />
                        </Grid>
                        <Grid container item m={1}>
                            <Grid item xs={12}>
                                <TextField
                                    id='username'
                                    value={dataUser.username || ''}
                                    label='User Name'
                                    placeholder='Silahkan masukkan username anda'
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataUser({ ...dataUser, username: e.target.value })}
                                />
                                <TextField
                                    id='password'
                                    label='Password'
                                    value={passwordValue}
                                    placeholder='Silahkan masukkan password anda'
                                    variant="outlined"
                                    type={openPassword ? 'text' : 'password'}
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setPasswordValue(e.target.value)}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={openPassword} onChange={handleOpenPassword} />}
                                    label="Show Password"
                                />
                                <TextField
                                    id='nama'
                                    value={dataUser.nama || ''}
                                    label='Nama'
                                    placeholder='Masukkan nama anda'
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataUser({ ...dataUser, nama: e.target.value })}
                                />
                                <TextField
                                    id='email'
                                    value={dataUser.email || ''}
                                    label='Email'
                                    placeholder='Masukkan email anda'
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataUser({ ...dataUser, email: e.target.value })}
                                />
                                <TextField
                                    id='no_hp'
                                    value={dataUser.no_hp || ''}
                                    label='No. HP'
                                    placeholder='Masukkan nomor handphone anda'
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataUser({ ...dataUser, no_hp: e.target.value })}
                                />
                                <FormControl sx={{ marginTop: 2 }} fullWidth>
                                    <InputLabel size="small" id="select-skpd">SKPD</InputLabel>
                                    <Select
                                        labelId="select-skpd"
                                        id="skpd"
                                        value={dataUser.skpd_id || ''}
                                        label="SKPD"
                                        size="small"
                                        onChange={(e) => setDataUser({ ...dataUser, skpd_id: e.target.value })}
                                    >
                                        {skpdOptions.map((skpd) => (
                                            <MenuItem key={skpd.id} value={skpd.id}>{skpd.nama_skpd}</MenuItem> // Adjust property names as per your API response
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ marginTop: 2 }} fullWidth>
                                    <InputLabel size="small" id="select-role">Role</InputLabel>
                                    <Select
                                        labelId="select-role"
                                        id="role"
                                        value={dataUser.role || ''}
                                        label="Role"
                                        size="small"
                                        onChange={(e) => setDataUser({ ...dataUser, role: e.target.value })}
                                    >
                                        <MenuItem value='admin'>Admin</MenuItem>
                                        <MenuItem value='user'>User</MenuItem>
                                        <MenuItem value='superadmin'>Superadmin</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ marginTop: 2 }} fullWidth>
                                    <InputLabel size="small" id="select-status">Status</InputLabel>
                                    <Select
                                        labelId="select-status"
                                        id="status"
                                        value={dataUser.status || 'active'}
                                        label="Status"
                                        size="small"
                                        onChange={(e) => setDataUser({ ...dataUser, status: e.target.value })}
                                    >
                                        <MenuItem value='active'>Active</MenuItem>
                                        <MenuItem value='inactive'>Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} m={1} justifyContent={"end"}>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: colors.greenAccent[500] }}
                                onClick={sendEditData}
                            >
                                Simpan
                            </Button>
                        </Grid>
                    </Grid>
                </Fade>
            </Modal>
        </div>
    );
}

export default EditdataUser;
