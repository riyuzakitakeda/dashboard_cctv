import React from "react";
import { useState, useCallback } from "react";
import { Button, Dialog, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { HeaderData } from "../../../data/headerCostum";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DeleteForeverRounded } from "@mui/icons-material";
import { useAuth } from "../../../auth/auth_provider";

const DeleteData = ({ id, execute }) => {
    const { token, logout } = useAuth();
    const [open, setOpenDialog] = useState(false);
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    const handleConfirmation = () => deleteData(id);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const deleteData = useCallback((keyid) => {
        fetch(process.env.REACT_APP_API_URL + "api/user/" + keyid, {
            method: 'delete',
            headers: HeaderData(token)
        })
            .then(res => {
                if(res.status === 403){
                    logout()
                }
                execute();
                setOpenDialog(false)
            })
            .catch(err => {
                console.log(err)
            })
    }, [execute, token])

    return (
        <div>
            <Button variant='contained' sx={{
                backgroundColor: colors.redAccent[600],
                color: colors.grey[100],
                ":hover": {
                    backgroundColor: colors.redAccent[800]
                },
            }}
                onClick={() => { handleOpenDialog() }}
                size="small"
            >
                <DeleteForeverRounded />
            </Button>

            <Dialog
                open={open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
               
                    <DialogTitle id="alert-dialog-title">
                        {"Hapus Data"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Apakah anda yakin ingin menghapus data User ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" size="small" color="error" onClick={handleConfirmation}>Ya</Button>
                        <Button variant="contained" size="small" color="success" onClick={handleCloseDialog} autoFocus>
                            Tidak
                        </Button>
                    </DialogActions>
             
            </Dialog>

        </div>
    );
}

export default DeleteData;