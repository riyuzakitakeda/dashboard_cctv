import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, FormControl, Grid2 as Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

const dataset = [
    {
        macet: 59,
        lancar: 57,
        ramaiLancar: 86,
        jenis: 'Tingkat Kemacetan',
    },
];

const chartSetting = {
    xAxis: [
        {
            label: 'Kemacetan',
        },
    ],
    width: 500,
    height: 400,
};

// classes_to_count = [2 car, 3 motorcycle, 5 bus, 7 truck]

const DashboardCCTV = () => {
    const [datacctv, setData] = useState(null);
    const [jumlahMotor, setJumlahMotor] = useState(0);
    const [jumlahMobil, setJumlahMobil] = useState(0);
    const [jumlahBus, setJumlahBus] = useState(0);
    const [jumlahTruk, setJumlahTruk] = useState(0);
    const [jalurKanan, setJalurKanan] = useState('Lancar');
    const [jalurKiri, setJalurKiri] = useState('Lancar');
    const [titik_cctv, setTitikCCTV] = useState('pettarani');

    
    const getdata = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "image-data/" + titik_cctv, {
            method: 'get',
        })
            .then(res => res.json())
            .then((data) => {
                setData(data);

                console.log(data.counts_left.length)

                if (data.counts_left.length <= 4) {
                    setJalurKiri('Lancar');
                }
                if (data.counts_left.length > 4 && data.counts_left.length() <= 7) {
                    setJalurKiri('Ramai Lancar');
                }
                if (data.counts_left.length > 7) {
                    setJalurKiri('Macet');
                }

                if (data.counts_right.length <= 4) {
                    setJalurKanan('Lancar');
                }
                if (data.counts_right.length > 4 && data.counts_right.length() <= 7) {
                    setJalurKanan('Ramai Lancar');
                }
                if (data.counts_right.length > 7) {
                    setJalurKanan('Macet');
                }

                // setJalurKanan(length(data['counts_right']))
                data.counts_left.forEach(element => {
                    switch (element) {
                        case 2: setJumlahMobil(jumlahMobil => jumlahMobil + 1); break;
                        case 3: setJumlahMotor(jumlahMotor => jumlahMotor + 1); break;
                        case 5: setJumlahBus(jumlahBus => jumlahBus + 1); break;
                        case 7: setJumlahTruk(jumlahTruk => jumlahTruk + 1); break;
                        default: break;
                    }
                });
                data.counts_right.forEach(element => {
                    switch (element) {
                        case 2: setJumlahMobil(jumlahMobil => jumlahMobil + 1); break;
                        case 3: setJumlahMotor(jumlahMotor => jumlahMotor + 1); break;
                        case 5: setJumlahBus(jumlahBus => jumlahBus + 1); break;
                        case 7: setJumlahTruk(jumlahTruk => jumlahTruk + 1); break;
                        default: break;
                    }
                });
            })
            .catch(err => console.log(err));
    }, [setData, setJalurKanan, setJalurKiri, setJumlahBus, setJumlahMobil, setJumlahMotor, setJumlahTruk, titik_cctv]);

    const handleChange = useCallback((e) => {
        getdata()
        setTitikCCTV(e.target.value)
    }, [getdata, setTitikCCTV]);


    useEffect(() => {
        // Fetch data immediately when the component mounts
        getdata();

        // Set up a timer to fetch data every 1 minute
        const intervalId = setInterval(() => {
            getdata();
        }, 60000); // 60000ms = 1 minute

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [getdata]);

    return (
        <Grid container direction={'row'} spacing={1}>
            <Grid container direction={'column'} spacing={2} size={3}>
                <Card sx={{
                    padding: 2,
                    marginTop: 2,
                    marginX: 1
                }}>
                    <Grid container direction={'column'} spacing={2}>
                        <Grid>
                            <Typography fontSize={12} fontWeight={'700'}>
                                {"Trafic Counting"}
                            </Typography>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid container direction={'row'} size={3}>
                                <DirectionsCarIcon />
                                <Typography>
                                    {jumlahMobil}
                                </Typography>
                            </Grid>
                            <Grid container direction={'row'} size={3}>
                                <TwoWheelerIcon />
                                <Typography>
                                    {jumlahMotor}
                                </Typography>
                            </Grid>
                            <Grid container direction={'row'} size={3}>
                                <DirectionsBusIcon />
                                <Typography>
                                    {jumlahBus}
                                </Typography>
                            </Grid>
                            <Grid container direction={'row'} size={3}>
                                <LocalShippingIcon />
                                <Typography>
                                    {jumlahTruk}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>

                <Card sx={{
                    marginX: 1,
                    padding: 2,
                }}>
                    <Grid container direction={'column'} spacing={2}>
                        <Grid>
                            <Typography fontSize={12} fontWeight={'700'}>
                                {"Total Quantity"}
                            </Typography>
                        </Grid>
                        <Grid>
                            <Typography color={'rgb(245 153 34)'} fontSize={30} fontWeight={'700'}>
                                {jumlahMobil + jumlahMotor + jumlahBus + jumlahTruk}
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
            <Grid container size={6} direction={'column'} spacing={2}>
                <Grid>
                    <FormControl fullWidth
                    sx={{
                        marginTop: 2,
                        marginX: 1
                    }}>
                        <InputLabel id="demo-simple-select-label">Titik CCTV</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={titik_cctv}
                            label="Age"
                            onChange={handleChange}
                        >
                            <MenuItem value={'pettarani'}>Pettarani</MenuItem>
                            <MenuItem value={'barombong'}>Barombong</MenuItem>
                            <MenuItem value={'alauddin'}>Alauddin</MenuItem>
                            <MenuItem value={'mtos'}>Veteran Sungai Saddang</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid container justifyContent={'center'} justifySelf={'center'}>
                    <Card sx={{
                        marginTop: 2,
                        marginX: 1,
                        width: '100%',
                        justifyItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {datacctv ? <img height={400} width={800} alt='cctv' src={'data:image/jpeg;base64,' + datacctv.image} /> : ''}
                    </Card>
                </Grid>
                <Grid container justifyContent={'center'}>
                    <Card sx={{
                        width: '100%',
                        marginX: 1,
                    }}>
                        <BarChart
                            xAxis={[
                                {
                                    id: 'Jumlah Kendaaran',
                                    data: ['Mobil', 'Motor', 'Bus', 'Truk'],
                                    scaleType: 'band',
                                },
                            ]}
                            series={[
                                {
                                    data: [jumlahMobil, jumlahMotor, jumlahBus, jumlahTruk],
                                },
                            ]}
                            width={500}
                            height={300}
                        />
                    </Card>
                </Grid>
            </Grid>
            <Grid container direction={'column'} size={2} spacing={2}>
                <Grid container justifyContent={'center'}>
                    <Card
                        sx={{
                            width: '100%',
                            marginTop: 2,
                            marginX: 1,
                        }}
                    >
                        <PieChart
                            series={[
                                {
                                    data: [
                                        { id: 0, value: jumlahMobil, label: 'Mobil' },
                                        { id: 1, value: jumlahMotor, label: 'Motor' },
                                        { id: 2, value: jumlahBus, label: 'Bus' },
                                        { id: 3, value: jumlahTruk, label: 'Truk' },
                                    ],
                                },
                            ]}

                            width={400}
                            height={200}
                        />
                    </Card>
                </Grid>
                <Grid container justifyContent={'center'}>
                    <Card
                        sx={{
                            width: '100%',
                            marginTop: 2,
                            marginX: 1,
                            padding: 2
                        }}
                    >
                        <Typography fontSize={15} fontWeight={700}>
                            {"Status Kemacetan"}
                        </Typography>
                        <Grid>
                            <Typography color={'rgb(245 153 34)'} fontSize={30} fontWeight={'700'}>
                                {
                                    'Jalur Kiri: ' + jalurKiri
                                }
                            </Typography>
                        </Grid>
                        <Grid>
                            <Typography color={'rgb(245 153 34)'} fontSize={30} fontWeight={'700'}>
                                {
                                    'Jalur Kanan: ' + jalurKanan
                                }
                            </Typography>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default DashboardCCTV;
