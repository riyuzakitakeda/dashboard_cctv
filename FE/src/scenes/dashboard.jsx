import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CircularProgress, FormControl, Grid2 as Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
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
    const [jalurKanan, setJalurKanan] = useState('');
    const [jalurKiri, setJalurKiri] = useState('');
    const [titik_cctv, setTitikCCTV] = useState('pettarani');
    const [loading, setLoading] = useState(true);


    const getdata = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "image-data/" + titik_cctv, {
            method: 'get',
        })
            .then(res => res.json())
            .then((data) => {
                setData(data);

                if (parseInt(data.count_region_left) <= 8) {
                    setJalurKiri('Lancar');
                }
                if (parseInt(data.count_region_left) > 8 && parseInt(data.count_region_left) <= 12) {
                    setJalurKiri('Padat');
                }
                if (parseInt(data.count_region_left) > 12) {
                    setJalurKiri('Macet');
                }

                if (parseInt(data.count_region_right) <= 8) {
                    setJalurKanan('Lancar');
                }
                if (parseInt(data.count_region_right) > 8 && parseInt(data.count_region_right) <= 12) {
                    setJalurKanan('Padat');
                }
                if (parseInt(data.count_region_right) > 12) {
                    setJalurKanan('Macet');
                }

                // setJalurKanan(length(data['counts_right']))
                data.counts_left.forEach(element => {
                    switch (element) {
                        case 2: setJumlahMotor(jumlahMotor => jumlahMotor + 1); break;
                        case 1: setJumlahMobil(jumlahMobil => jumlahMobil + 1); break;
                        case 3: setJumlahBus(jumlahBus => jumlahBus + 1); break;
                        case 4: setJumlahTruk(jumlahTruk => jumlahTruk + 1); break;
                        default: break;
                    }
                });
                data.counts_right.forEach(element => {
                    switch (element) {
                        case 2: setJumlahMotor(jumlahMotor => jumlahMotor + 1); break;
                        case 1: setJumlahMobil(jumlahMobil => jumlahMobil + 1); break;
                        case 3: setJumlahBus(jumlahBus => jumlahBus + 1); break;
                        case 4: setJumlahTruk(jumlahTruk => jumlahTruk + 1); break;
                        default: break;
                    }
                });
                setLoading(false)
            })
            .catch(err => console.log(err));
    }, [setData, setLoading, setJalurKanan, setJalurKiri, setJumlahBus, setJumlahMobil, setJumlahMotor, setJumlahTruk, titik_cctv]);

    const handleChange = useCallback(async (e) => {
        setLoading(true)
        await getdata()
        setTitikCCTV(e.target.value)
    }, [getdata, setTitikCCTV, setLoading]);


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
                            <MenuItem value={'simpang_5_bandara'}>Simpang 5 Bandara</MenuItem>
                            <MenuItem value={'taman_macan'}>Taman Macan</MenuItem>
                            <MenuItem value={'pasar_butung'}>Pasar Butung</MenuItem>
                            <MenuItem value={'abdesir_batua_raya'}>Abdesir Batua Raya</MenuItem>
                            <MenuItem value={'waduk_borong'}>Waduk Borong</MenuItem>
                            <MenuItem value={'flyover_atas'}>Flyover Atas</MenuItem>
                            <MenuItem value={'haji_bau_monginsidi'}>Haji Bau Monginsidi</MenuItem>
                            <MenuItem value={'pettarani_andi_djemma'}>Pettarani Andi Djemma</MenuItem>
                            <MenuItem value={'perintis_unhas_pintu_2'}>Perintis UNHAS Pintu 2</MenuItem>
                            <MenuItem value={'andi_tonro_kumala'}>Andi Tonro Kumala</MenuItem>
                            <MenuItem value={'batas_makassar_gowa'}>Batas Makassar Gowa</MenuItem>
                            <MenuItem value={'gunung_nona_1'}>Gunung Nona 1</MenuItem>
                            <MenuItem value={'nipa_nipa_1'}>Nipa-Nipa 1</MenuItem>
                            <MenuItem value={'mtos_1_barat'}>MTOS 1 Barat</MenuItem>
                            <MenuItem value={'gunung_nona_2'}>Gunung Nona 2</MenuItem>
                            <MenuItem value={'nipa_nipa_2'}>Nipa-Nipa 2</MenuItem>
                            <MenuItem value={'masjid_chengho_1'}>Masjid Chengho 1</MenuItem>
                            <MenuItem value={'masjid_chengho_2'}>Masjid Chengho 2</MenuItem>
                            <MenuItem value={'perintis_unhas_pintu_1'}>Perintis UNHAS Pintu 1</MenuItem>
                            <MenuItem value={'antang_raya_baruga'}>Antang Raya Baruga</MenuItem>
                            <MenuItem value={'batua_raya_depan_yamaha'}>Batua Raya Depan Yamaha</MenuItem>
                            <MenuItem value={'pongtiku_urip_sumoharjo'}>Pongtiku Urip Sumoharjo</MenuItem>
                            <MenuItem value={'jembatan_barombong'}>Jembatan Barombong</MenuItem>
                            <MenuItem value={'losari_02_c'}>Losari 02 C</MenuItem>
                            <MenuItem value={'ahmad_yani'}>Ahmad Yani</MenuItem>
                            <MenuItem value={'losari_pintu_masuk_utama'}>Losari Pintu Masuk Utama</MenuItem>
                            <MenuItem value={'depan_sentra_wijaya'}>Depan Sentra Wijaya</MenuItem>
                            <MenuItem value={'pizza_kfc_mtos'}>Pizza KFC MTOS</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid container justifyContent={'center'} justifySelf={'center'}>
                    {
                        loading
                            ?
                            <Card
                                sx={{
                                    marginTop: 2,
                                    marginX: 1,
                                    width: 800,
                                    height: 400,
                                    justifyItems: 'center',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <CircularProgress />
                            </Card>
                            :
                            <Card sx={{
                                marginTop: 2,
                                marginX: 1,
                                width: '100%',
                                justifyItems: 'center',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center'
                            }}>
                                {datacctv ? <img height={400} width={800} alt='cctv' src={'data:image/jpeg;base64,' + datacctv.image} /> : ''}
                            </Card>
                    }

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
