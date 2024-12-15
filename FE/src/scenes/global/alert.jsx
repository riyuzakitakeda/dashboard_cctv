import React from 'react';
import { Alert, AlertTitle, Grow } from '@mui/material';

const ShowAlert = ({ title, desc, type, openAlert, onAlertClose}) => {
    return (
        <div>
            {openAlert && (
                <Grow in={openAlert}>
                    <Alert sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        zIndex: 10000,
                        transformOrigin: '0 0 0',
                        width: 'auto',
                    }} severity={type} onClose={onAlertClose} variant='filled'>
                        <AlertTitle>{title}: {desc}</AlertTitle>
                    </Alert>
                </Grow>
            )}
        </div>
    );
}

export default ShowAlert;