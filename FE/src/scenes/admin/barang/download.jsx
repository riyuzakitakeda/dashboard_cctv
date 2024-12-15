import { Button, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react"
import PrintPDF from "./download_laporan";
import { HeaderData } from "../../../data/headerCostum";
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import { PrintRounded } from "@mui/icons-material";

const ViewData = () => {
    const [data, setData] = useState(null);

    const printRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const getDataLaporan = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/laporan/kategori", {
            method: 'get',
            headers: HeaderData
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                setData(data)
            })
            .catch(err => {
                console.log(err)
            })
    }, [setData]);

    useEffect(() => {
        if (!data) {
            getDataLaporan();
        }
    }, [data, getDataLaporan])

    return (
        <Grid container direction={"column"}>
            <Grid item container>
                <Button
                    onClick={() => handlePrint()}
                    sx={{
                        textTransform: "none",

                    }}
                    variant="contained"
                    color="success"
                >
                    <Typography marginRight={2}>
                        {"Print Data"}
                    </Typography>
                    <PrintRounded />
                </Button>
            </Grid>
            <Grid item ref={printRef} >
                {
                    data ? <PrintPDF data={data} /> : <></>
                }
            </Grid>
        </Grid>
    );
}


export default ViewData;