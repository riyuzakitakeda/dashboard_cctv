import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { Button, Modal, useTheme, Typography, Grid, TextField, Divider, Fade } from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import { EditNoteRounded } from "@mui/icons-material";
import ShowAlert from "../../global/alert";
import { useAuth } from "../../../auth/auth_provider";

const EditData = ({ id, execute }) => {
    const { token } = useAuth();
    const [openModal, setOpenModal] = useState(false);
    const [data, setData] = useState({
        kategori: null,
        nilai: null
    })
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
        fetch(process.env.REACT_APP_API_URL + "api/setting", {
            method: 'post',
            headers: HeaderData(token),
            body: JSON.stringify(data)
        })
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res)
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
        fetch(process.env.REACT_APP_API_URL + "api/setting/" + id, {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                setData({
                    kategori: res.kategori,
                    nilai: res.nilai
                })
            })
            .catch(err => {
                console.log(err)
            })
    }, [token, id]);


    useEffect(() => {
        if (!data.kategori) {
            getData();
        }
    }, [data, getData])
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
                                    id={'kategori'}
                                    value={data.kategori}
                                    label={'Nama Kategori'}
                                    placeholder={'Silahkan masukkan nama kategori'}
                                    variant="outlined"
                                    type={'text'}
                                    size="small"
                                    disabled
                                    fullWidth
                                    sx={{
                                        marginTop: "10px",
                                        ":target-text": {
                                            borderColor: colors.greenAccent[400]
                                        }
                                    }}
                                    // onInput={(e) => setData({ ...data, kategori: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id={'nilai'}
                                    value={data.nilai}
                                    label={'Nilai'}
                                    placeholder={'Silahkan masukkan nilai'}
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
                                    onInput={(e) => setData({ ...data, nilai: e.target.value })}
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