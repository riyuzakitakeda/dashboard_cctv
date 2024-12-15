import React, { useCallback } from "react";
import { useState } from "react";
import {
    Button, Modal,
    useTheme, Typography,
    Grid, TextField,
    Divider, Fade
} from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import ShowAlert from "../../global/alert";
import { useAuth } from "../../../auth/auth_provider";

const TambahData = ({execute}) => {
    const { token } = useAuth();
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
    const hadleAlert = () => {
        setOpenAlert(false);
    };


    const [dataKategori, setdataKategori] = useState({
        kategori: null
    })

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


    const sendData = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/kategori/", {
            method: 'post',
            headers: HeaderData(token),
            body: JSON.stringify(dataKategori)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                execute()
                if(data.code === 500){
                    setAlertOption(
                        {
                            title: 'Gagal',
                            desc: data.message,
                            type: 'error'
                        }
                    );
                }else if(data.code === 201){
                    setAlertOption(
                        {
                            title: 'Sukses',
                            desc: data.message,
                            type: 'success'
                        }
                    );
                    handleCloseModal()
                }
                setOpenAlert(true);
                setTimeout(hadleAlert, 4000);
            })
            .catch(err => {
                console.log(err)
            })
    },[dataKategori, execute, token]);


    return (
        <div>
            <ShowAlert
                title={alertOption.title}
                desc={alertOption.desc}
                type={alertOption.type}
                openAlert={openAlert}
                onAlertClose={hadleAlert}
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
                    <Grid container xs={11} md={7} lg={5} sx={style}>
                        <Grid item container justifyContent={"space-between"} alignItems={"end"}>
                            <Typography variant="h4">
                                {"Tambah Kategori"}
                            </Typography>
                            <Button
                                variant="text"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minWidth: 25
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
                        <Grid container item m={1}>
                            <Grid item xs={12}>
                                <TextField
                                    id={'kategori'}
                                    value={dataKategori.kategori}
                                    label={'Nama Kategori'}
                                    placeholder={'Silahkan masukkan nama kategori'}
                                    variant="outlined"
                                    type={'text'}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        marginTop: "10px",
                                        ":target-text": {
                                            borderColor: colors.greenAccent[400]
                                        }
                                    }}
                                    onInput={(e) => setdataKategori({ ...dataKategori, kategori: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} m={1} justifyContent={"end"}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: colors.greenAccent[500]
                                }}
                                onClick={() => sendData()}
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

export default TambahData;