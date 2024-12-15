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

const TambahData = ({ execute }) => {
    const nowDate = Date.now();
    const { token, user } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

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
        waktu_pemeliharaan: nowDate,
        id_kategori: '',
        id_skpd: user?.id_skpd || '',
        id_user: user?.id || '',
        status: '',
    });

    const [fotoBarang, setFotoBarang] = useState(null); // State to store the selected file
    const [imagePreview, setImagePreview] = useState(null); // State to store the image preview
    const [uploadProgress, setUploadProgress] = useState(0); // State for tracking upload progress
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

    useEffect(() => {
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

    const sendData = useCallback(() => {
        const formData = new FormData();
        // Append form fields to formData
        // Ensure the integer fields are parsed correctly
        formData.append('id_user', parseInt(dataForm.id_user, 10)); // Convert to integer
        formData.append('id_kategori', parseInt(dataForm.id_kategori, 10)); // Convert to integer
        formData.append('id_skpd', parseInt(dataForm.id_skpd, 10)); // Convert to integer

        // Append the remaining data fields
        formData.append('no_seri', dataForm.no_seri);
        formData.append('nama_barang', dataForm.nama_barang);
        formData.append('tahun_pengadaan', dataForm.tahun_pengadaan);
        formData.append('waktu_pemeliharaan', dataForm.waktu_pemeliharaan);
        formData.append('harga_barang', dataForm.harga_barang);
        formData.append('status', dataForm.status);

        if (fotoBarang) {
            formData.append('foto_barang', fotoBarang); // Append the image file
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', process.env.REACT_APP_API_URL + "api/barang", true); // Send data to API
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        // Track upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete); // Update progress state
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
                // const response = JSON.parse(xhr.responseText);
                execute();
                setAlertOption({
                    title: 'Sukses',
                    desc: 'Data berhasil ditambahkan!',
                    type: 'success',
                });
                handleCloseModal();
                setOpenAlert(true);
            } else {
                setAlertOption({
                    title: 'Gagal',
                    desc: 'Gagal mengunggah data.',
                    type: 'error',
                });
                setOpenAlert(true);
            }
            setTimeout(handleAlertClose, 4000);
        };

        xhr.onerror = () => {
            setAlertOption({
                title: 'Error',
                desc: 'Terjadi kesalahan saat mengunggah data.',
                type: 'error',
            });
            setOpenAlert(true);
            setTimeout(handleAlertClose, 4000);
        };

        xhr.send(formData); // Send the form data

    }, [dataForm, execute, fotoBarang, token]);

    return (
        <div>
            <ShowAlert
                title={alertOption.title}
                desc={alertOption.desc}
                type={alertOption.type}
                openAlert={openAlert}
                onAlertClose={handleAlertClose}
            />
            <Button
                variant='contained'
                sx={{
                    backgroundColor: colors.greenAccent[400],
                    ":hover": { backgroundColor: colors.greenAccent[500] },
                }}
                onClick={handleOpenModal}
            >
                <Typography color={"white"} textTransform={"capitalize"}>
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
                    <Grid container xs={11} md={7} lg={5} sx={style}>
                        <Grid item container justifyContent={"space-between"} alignItems={"end"}>
                            <Typography variant="h4">
                                {"Tambah Data"}
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
                                    placeholder="Silahkan masukkan no. seri"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataForm({ ...dataForm, no_seri: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="nama_barang"
                                    label="Nama Barang"
                                    value={dataForm.nama_barang}
                                    placeholder="Silahkan masukkan nama barang"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    required
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataForm({ ...dataForm, nama_barang: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="tahun_pengadaan"
                                    label="Tahun Pengadaan"
                                    value={dataForm.tahun_pengadaan}
                                    placeholder="Silahkan masukkan tahun pengadaan"
                                    variant="outlined"
                                    required
                                    type="number"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataForm({ ...dataForm, tahun_pengadaan: e.target.value })}
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
                                    placeholder="Silahkan masukkan harga barang"
                                    variant="outlined"
                                    type="text"
                                    size="small"
                                    required
                                    fullWidth
                                    sx={{
                                        marginTop: "10px",
                                        ":target-text": {
                                            borderColor: colors.greenAccent[400]
                                        }
                                    }}
                                    onChange={(e) => {
                                        // Strip non-numeric characters and store only numbers in state
                                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                                        setDataForm({
                                            ...dataForm,
                                            harga_barang: rawValue ? parseInt(rawValue, 10) : '' // Parse back to number
                                        });
                                    }}
                                />
                            </Grid>

                            {/* Kategori Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth required variant="outlined" size="small" sx={{ marginTop: "10px" }}>
                                    <InputLabel id="kategori-select-label">Kategori</InputLabel>
                                    <Select
                                        labelId="kategori-select-label"
                                        value={dataForm.id_kategori}
                                        onChange={(e) => setDataForm({ ...dataForm, id_kategori: e.target.value })}
                                        label="Kategori"
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
                                    value={dataForm.waktu_pemeliharaan}
                                    placeholder="Silahkan masukkan waktu pemeliharaan"
                                    variant="outlined"
                                    required
                                    type="date"
                                    size="small"
                                    fullWidth
                                    sx={{ marginTop: "10px" }}
                                    onChange={(e) => setDataForm({ ...dataForm, waktu_pemeliharaan: e.target.value })}
                                />
                            </Grid>
                            
                            {/* Status Selection */}
                            <Grid item xs={12}>
                                <FormControl required fullWidth variant="outlined" size="small" sx={{ marginTop: "10px" }}>
                                    <InputLabel id="status-select-label">Status</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        value={dataForm.status}
                                        onChange={(e) => setDataForm({ ...dataForm, status: e.target.value })}
                                        label="Status"
                                    >
                                        <MenuItem value="baik">Baik</MenuItem>
                                        <MenuItem value="rusak">Rusak</MenuItem>
                                        <MenuItem value="pemeliharaan">Pemeliharaan</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* File Upload and Progress */}
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="success"
                                    sx={{
                                        backgroundColor: colors.greenAccent[400],
                                        textTransform: 'none'
                                    }}
                                    
                                >
                                    Upload Foto Barang
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setFotoBarang(file);
                                            setImagePreview(URL.createObjectURL(file)); // Generate preview
                                        }}
                                    />
                                </Button>
                                {uploadProgress > 0 && (
                                    <LinearProgress variant="determinate" color="primary" value={uploadProgress} sx={{ marginTop: 2 }} />
                                )}
                            </Grid>
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
                                onClick={sendData}
                            >
                                <Typography color={"white"} textTransform={"capitalize"}>
                                    {"Simpan"}
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </Fade>
            </Modal>
        </div>
    );
};

export default TambahData;
