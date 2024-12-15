import React, { useCallback, useEffect, useState } from "react";
import {
    Button, Modal,
    Typography, Grid,
    TextField, Divider, Fade,
    MenuItem, Select,
    FormControl, InputLabel, Checkbox,
    FormControlLabel,
    useTheme
} from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import ShowAlert from "../../global/alert";
import { useAuth } from "../../../auth/auth_provider";

const TambahUser = ({ execute }) => {
    const { token } = useAuth(); // Retrieve the token using the useAuth hook
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openModal, setOpenModal] = useState(false);
    const [openPassword, setOpenPassword] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertOption, setAlertOption] = useState({
        title: '',
        desc: '',
        type: 'info'
    });
    const [dataSKPD, setDataSKPD] = useState(null);
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

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #000',
        boxShadow: 24,
        bgcolor: colors.primary[400],
        p: 3,
        borderRadius: 2
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const handleOpenPassword = () => setOpenPassword(!openPassword);
    const handleAlert = () => setOpenAlert(false);

    // Validate required fields
    const validateFields = useCallback(() => {
        const { username, password, role } = dataUser;
        if (!username || !password || !role) {
            setAlertOption({
                title: 'Error',
                desc: 'Please fill all required fields.',
                type: 'error'
            });
            setOpenAlert(true);
            return false;
        }
        return true;
    }, [dataUser]);

    // Fetch SKPD data
    const getDataSKPD = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/skpd", {
            method: 'GET',
            headers: HeaderData(token)
        })
            .then(res => res.json())
            .then(data => setDataSKPD(data))
            .catch(err => console.error("Error fetching SKPD data:", err));
    }, [token]);

    // Send data to the server
    const sendData = useCallback(async () => {
        if (!validateFields()) return;

        try {
            const response = await fetch(process.env.REACT_APP_API_URL + "api/user/", {
                method: 'POST',
                headers: HeaderData(token),
                body: JSON.stringify(dataUser)
            });

            const data = await response.json();

            if (response.ok) {
                setAlertOption({
                    title: 'Sukses',
                    desc: 'User created successfully!',
                    type: 'success'
                });
                execute(); // Refresh user list
                handleCloseModal();
            } else {
                setAlertOption({
                    title: 'Error',
                    desc: data.message || 'Failed to create user.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error(err);
            setAlertOption({
                title: 'Error',
                desc: 'An error occurred while creating the user.',
                type: 'error'
            });
        }
        setOpenAlert(true);
        setTimeout(handleAlert, 4000); // Close alert after 4 seconds
    }, [dataUser, execute, token, validateFields]);

    // Fetch SKPD data on component mount
    useEffect(() => {
        if (!dataSKPD) getDataSKPD();
    }, [dataSKPD, getDataSKPD]);

    return (
        <div>
            <ShowAlert
                title={alertOption.title}
                desc={alertOption.desc}
                type={alertOption.type}
                openAlert={openAlert}
                onAlertClose={handleAlert}
            />
            <Button
                variant='contained'
                sx={{
                    backgroundColor: colors.greenAccent[400],
                    ":hover": { backgroundColor: colors.greenAccent[500] }
                }}
                onClick={handleOpenModal}
            >
                <Typography
                    color={"white"}
                    textTransform={"capitalize"}
                >
                    {"Tambah"}
                </Typography>
            </Button>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Fade in={openModal}>
                    <Grid container item xs={11} md={7} lg={5} sx={style}>
                        <Grid item container justifyContent={"space-between"} alignItems={"center"}>
                            <Typography variant="h4">Tambah User</Typography>
                            <Button
                                variant="text"
                                sx={{ justifyContent: "center", alignItems: "center", minWidth: 25 }}
                                onClick={handleCloseModal}
                            >
                                <Typography variant="button" color={colors.redAccent[400]}>x</Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={12} marginTop={2}>
                            <Divider />
                        </Grid>
                        <Grid container item spacing={2} marginTop={0.5}>
                            {/* Username */}
                            <Grid item xs={12}>
                                <TextField
                                    label="User Name"
                                    value={dataUser.username}
                                    onChange={(e) => setDataUser({ ...dataUser, username: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            {/* Password */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Password"
                                    type={openPassword ? 'text' : 'password'}
                                    value={dataUser.password}
                                    onChange={(e) => setDataUser({ ...dataUser, password: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleOpenPassword} />}
                                    label="Show Password"
                                />
                            </Grid>

                            {/* Other fields */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Nama"
                                    value={dataUser.nama}
                                    onChange={(e) => setDataUser({ ...dataUser, nama: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={dataUser.email}
                                    onChange={(e) => setDataUser({ ...dataUser, email: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="No. HP"
                                    type="tel"
                                    value={dataUser.no_hp}
                                    onChange={(e) => setDataUser({ ...dataUser, no_hp: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            {/* SKPD */}
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>SKPD</InputLabel>
                                    <Select
                                        value={dataUser.skpd_id}
                                        onChange={(e) => setDataUser({ ...dataUser, skpd_id: e.target.value })}
                                    >
                                        {dataSKPD?.map((skpd) => (
                                            <MenuItem key={skpd.id} value={skpd.id}>
                                                {skpd.nama_skpd}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Role */}
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Tipe Akun</InputLabel>
                                    <Select
                                        value={dataUser.role}
                                        onChange={(e) => setDataUser({ ...dataUser, role: e.target.value })}
                                    >
                                        <MenuItem value="superadmin">Superadmin</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="user">User</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Status */}
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={dataUser.status}
                                        onChange={(e) => setDataUser({ ...dataUser, status: e.target.value })}
                                    >
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Save Button */}
                            <Grid item xs={12} textAlign="right">
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: colors.greenAccent[500] }}
                                    onClick={sendData}
                                >
                                    Simpan
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Fade>
            </Modal>
        </div>
    );
}

export default TambahUser;
