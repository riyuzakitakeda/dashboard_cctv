import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { Button, Modal, useTheme, Typography, Grid, TextField, Divider, Fade } from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import { EditNoteRounded } from "@mui/icons-material";
import ShowAlert from "../../global/alert";
import { useAuth } from "../../../auth/auth_provider";

const EditData = ({ id, execute }) => {
    const {token} = useAuth();
    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [alertOption, setAlertOption] = useState({
        title: '',
        desc: '',
        type: 'info'
    });
    const [openAlert, setOpenAlert] = useState(false);
    const hadleAlert = () => {
        setOpenAlert(false);
    };

    const [dataskpd, setdataskpd] = useState({
        nama_skpd: ''
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

    const sendData = () => {
        fetch(process.env.REACT_APP_API_URL + "api/skpd/" + id, {
            method: 'put',
            headers: HeaderData(token),
            body: JSON.stringify(dataskpd)
        })
            .then(res => {
                return res.json();
            })
            .then(res => {
                execute()
                if (res.code === 200) {
                    setAlertOption(
                        {
                            title: 'Sukses',
                            desc: res.message,
                            type: 'success'
                        }
                    );
                    handleCloseModal()
                } else if (res.code === 500) {
                    setAlertOption(
                        {
                            title: 'Gagal',
                            desc: res.message,
                            type: 'error'
                        }
                    );
                }
                setOpenAlert(true);
                setTimeout(hadleAlert, 4000);
            })
            .catch(err => {
                console.log(err)
            })
    };

    const getData = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/skpd/" + id, {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                setdataskpd({
                    id_kategori: res.id_kategori,
                    nama_skpd: res.nama_skpd
                });
            })
            .catch(err => {
                console.log(err)
            });
    }, [id, token]);


    useEffect(() => {
        if (dataskpd.nama_skpd === '') {
            getData();
        }
    }, [dataskpd, getData])



    return (
        <div>
            <ShowAlert
                title={alertOption.title}
                desc={alertOption.desc}
                type={alertOption.type}
                openAlert={openAlert}
                onAlertClose={hadleAlert}
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
                <EditNoteRounded />
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
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                textTransform={"uppercase"}
                            >
                                {"Form Edit"}
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
                        <Grid container marginTop={1} item spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    id={'nama_skpd'}
                                    value={dataskpd.nama_skpd}
                                    label={'Nama skpd'}
                                    placeholder={'Silahkan masukkan nama skpd'}
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
                                    onInput={(e) => setdataskpd({ ...dataskpd, nama_skpd: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} m={1} justifyContent={"end"}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: colors.greenAccent[500]
                                }}
                                onClick={sendData}
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

export default EditData;