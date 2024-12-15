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



const ShowImage = ({source}) => {
    const { token, user } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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

    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    return (
        <div>
            <img src={source} width={"50px"} onClick={handleOpenModal} />
            {/* <Button
                variant='contained'
                sx={{
                    backgroundColor: colors.greenAccent[400],
                    ":hover": { backgroundColor: colors.greenAccent[500] },
                }}
                
            >
                <Typography color={"white"} textTransform={"capitalize"}>
                    {"Tambah"}
                </Typography>
            </Button> */}
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
                                {"Foto Barang"}
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
                            <img src={source} width={"100%"} /> 
                        </Grid>
                    </Grid>
                </Fade>
            </Modal>
        </div>
    );
};

export default ShowImage;
