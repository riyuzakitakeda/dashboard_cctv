import React, { useCallback, useEffect, useState } from "react";
import {
    Button, Modal,
    useTheme, Typography,
    Grid, TextField,
    Divider, Fade, Select, MenuItem, FormControl, InputLabel,
    LinearProgress,
} from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import ShowAlert from "../../global/alert";
import { useAuth } from "../../../auth/auth_provider";
import { EditNoteRounded, ShowChartRounded, VisibilityRounded } from "@mui/icons-material";

const ShowData = ({ id }) => {
    const { token, user } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const [nilaiPenyusutan, setNilaiPenyusutan] = useState(0);

    const [alertOption, setAlertOption] = useState({
        title: '',
        desc: '',
        type: 'info'
    });
    const [openAlert, setOpenAlert] = useState(false);
    const handleAlertClose = () => setOpenAlert(false);


    const [dataForm, setDataForm] = useState({
        no_seri: '',
        nama_barang: '',
        tahun_pengadaan: '',
        harga_barang: '',
        waktu_pemeliharaan: '',
        id_kategori: '',
        id_skpd: user?.id_skpd || '',
        id_user: user?.id || '',
        status: '',
    });

    const [imagePreview, setImagePreview] = useState(null); // State to store the image preview
    const [categories, setCategories] = useState([]); // State to store categories

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #000',
        boxShadow: 24,
        bgcolor: colors.primary[400],
        p: 3,
        borderRadius: 2,
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        return date.split(' ')[0]; // Extract the 'YYYY-MM-DD' part
    }

    const getDataSetting = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "api/setting", {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => res.json())
            .then(data => data.forEach(element => {
                if (element.kategori === "Penyusutan") {
                    setNilaiPenyusutan(element.nilai)
                }
            }))
            .catch(err => console.log(err));
    }, [token]);

    const getDataKategori = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/kategori", {
            method: 'GET',
            headers: HeaderData(token),
        })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setCategories(data);
                } else {
                    setAlertOption({
                        title: 'Gagal',
                        desc: data.message,
                        type: 'error',
                    });
                    setOpenAlert(true);
                }
            })
            .catch(err => {
                console.error(err);
                setAlertOption({
                    title: 'Error',
                    desc: 'Failed to fetch categories.',
                    type: 'error',
                });
                setOpenAlert(true);
            });
    }, [token]);

    const getDataBarang = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/barang/" + id, {
            method: 'GET',
            headers: HeaderData(token),
        })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setDataForm({
                        no_seri: data.no_seri,
                        nama_barang: data.nama_barang,
                        tahun_pengadaan: parseInt(data.tahun_pengadaan),
                        harga_barang: data.harga_barang,
                        waktu_pemeliharaan: data.waktu_pemeliharaan,
                        id_kategori: parseInt(data.id_kategori),
                        id_skpd: user?.id_skpd || data.id_skpd,
                        id_user: user?.id || data.id_user,
                        status: data.status,
                    });
                    setImagePreview(process.env.REACT_APP_API_URL + 'uploads/barang/' + data.foto_barang)
                } else {
                    setAlertOption({
                        title: 'Gagal',
                        desc: data.message,
                        type: 'error',
                    });
                    setOpenAlert(true);
                }
            })
            .catch(err => {
                console.error(err);
                setAlertOption({
                    title: 'Error',
                    desc: 'Failed to fetch categories.',
                    type: 'error',
                });
                setOpenAlert(true);
            });
    }, [token, id, user?.id, user?.id_skpd]);

    useEffect(() => {
        if (nilaiPenyusutan === 0) getDataSetting();
        if (dataForm.nama_barang === '') getDataBarang();
        if (categories.length === 0) getDataKategori();
    }, [categories, getDataKategori, dataForm.nama_barang, getDataBarang, nilaiPenyusutan, getDataSetting]);

    return (
        <div>
            <ShowAlert
                title={alertOption.title}
                desc={alertOption.desc}
                type={alertOption.type}
                openAlert={openAlert}
                onAlertClose={handleAlertClose}
            />
            <Button variant='contained' sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                ":hover": {
                    backgroundColor: colors.greenAccent[800]
                },
                marginX: 0.5
            }}
                onClick={handleOpenModal}
                size="small"
            >
                <VisibilityRounded />
            </Button>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Fade in={openModal}>
                    <Grid container xs={11} md={7} lg={5} sx={style}>
                        <Grid item container justifyContent={"space-between"} alignItems={"end"}>
                            <Typography variant="h4">
                                {"Show Data"}
                            </Typography>
                            <Button
                                variant="text"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minWidth: 25,
                                }}
                                onClick={handleCloseModal}
                            >
                                <Typography variant="button" color={colors.redAccent[400]}>
                                    x
                                </Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={12} paddingTop={2}>
                            <Divider />
                        </Grid>
                        <Grid container item m={1} spacing={2}>
                            {/* Form Fields */}
                            <Grid item xs={12}>
                                <TextField
                                    id="no_seri"
                                    label="No. Seri"
                                    value={dataForm.no_seri}
                                    placeholder="No. seri"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="nama_barang"
                                    label="Nama Barang"
                                    value={dataForm.nama_barang}
                                    placeholder="Nama Barang"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="tahun_pengadaan"
                                    label="Tahun Pengadaan"
                                    value={dataForm.tahun_pengadaan}
                                    placeholder="Silahkan masukkan tahun pengadaan"
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="harga_barang"
                                    label="Harga Barang"
                                    value={
                                        dataForm.harga_barang
                                            ? new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0
                                            }).format(dataForm.harga_barang)
                                            : ''
                                    } // Format as currency for display
                                    placeholder="Harga Barang"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: "10px",
                                        ":target-text": {
                                            borderColor: colors.greenAccent[400]
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    id="harga_barang"
                                    label="Harga Penyusutan"
                                    value={
                                        dataForm.harga_barang
                                            ? new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0
                                            }).format((parseInt(dataForm.harga_barang) - (parseInt(dataForm.harga_barang) * (parseInt(nilaiPenyusutan) / 100))))
                                            : ''
                                    } // Format as currency for display
                                    placeholder="Harga Penyusutan"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: "10px",
                                        ":target-text": {
                                            borderColor: colors.greenAccent[400]
                                        }
                                    }}
                                />
                            </Grid>

                            {/* Kategori Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined" size="small" sx={{ marginTop: "10px" }}>
                                    <InputLabel id="kategori-select-label">Kategori</InputLabel>
                                    <Select
                                        labelId="kategori-select-label"
                                        value={dataForm.id_kategori}
                                        // onChange={(e) => setDataForm({ ...dataForm, id_kategori: e.target.value })}
                                        label="Kategori"
                                        disabled
                                    >
                                        {categories.map((kategori) => (
                                            <MenuItem key={kategori.id} value={kategori.id}>
                                                {kategori.kategori}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    id="waktu_pemeliharaan"
                                    label="Waktu Pemeliharaan"
                                    value={formatDateForInput(dataForm.waktu_pemeliharaan)} // Ensure date is in YYYY-MM-DD format for the input
                                    placeholder="Silahkan masukkan waktu pemeliharaan"
                                    variant="outlined"
                                    type="date"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                />

                            </Grid>

                            {/* Status Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined" size="small" sx={{ marginTop: "10px" }}>
                                    <InputLabel id="status-select-label">Status</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        value={dataForm.status}
                                        // onChange={(e) => setDataForm({ ...dataForm, status: e.target.value })}
                                        label="Status"
                                        disabled
                                    >
                                        <MenuItem value="baik">Baik</MenuItem>
                                        <MenuItem value="rusak">Rusak</MenuItem>
                                        <MenuItem value="pemeliharaan">Pemeliharaan</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* File Upload and Progress */}
                            <Grid item xs={12}>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Uploaded"
                                        height={"150px"}
                                        style={{ marginTop: "10px" }}
                                    />
                                )}
                            </Grid>
                        </Grid>
                        <Grid container item justifyContent={"center"} xs={12} m={2}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: colors.greenAccent[400],
                                    ":hover": { backgroundColor: colors.greenAccent[500] },
                                }}
                                onClick={handleCloseModal}
                            >
                                <Typography color={"white"} textTransform={"capitalize"}>
                                    {"Tutup"}
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </Fade>
            </Modal>
        </div>
    );
};

export default ShowData;
