import React, { useCallback, useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {
    Grid,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { HeaderData } from '../../../data/headerCostum';
import TambahData from './tambah';
import { useAuth } from '../../../auth/auth_provider';
import ShowImage from './show_image';
import DeleteData from './delete';
import EditData from './edit';
import ShowData from './show';

const columns = [
    { id: 'no_seri', label: 'No. Seri', minWidth: 150 },
    {
        id: 'foto_barang',
        label: 'Foto Barang',
        minWidth: 100,
        format: (value) => {
            return <ShowImage source={process.env.REACT_APP_API_URL + 'uploads/barang/' + value} />
        }
    },
    { id: 'nama_barang', label: 'Nama Barang', minWidth: 100 },
    { id: 'tahun_pengadaan', label: 'Tahun Pengadaan', minWidth: 100 },
    { id: 'harga_barang', label: 'Harga Barang', minWidth: 120, format: (value) => "Rp." + parseInt(value).toLocaleString() },
    { id: 'harga_barang', label: 'Harga Penyusutan', minWidth: 150 },
    {
        id: 'waktu_pemeliharaan',
        label: 'Waktu Pemeliharaan',
        minWidth: 100,
        format: (value) => {
            const dateCreated = Date.parse(value);
            const date = new Date(dateCreated);
            const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
            const year = date.getFullYear();
            return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
        }
    },
    { id: 'MasterKategoriBarang', label: 'Kategori', minWidth: 100, format: (value) => value.kategori },
    { id: 'MasterSKPD', label: 'SKPD', minWidth: 200, format: (value) => value.nama_skpd },
    { id: 'User', label: 'Nama User', minWidth: 150, format: (value) => value.nama },
    { id: 'User', label: 'Email User', minWidth: 150, format: (value) => value.email },
    { id: 'User', label: 'Kontak User', minWidth: 150, format: (value) => value.no_hp },
    {
        id: 'status',
        label: 'Status',
        minWidth: 100,
        format: (value) => {
            let color = '';
            switch (value) {
                case 'rusak': color = 'error'; break;
                case 'baik': color = 'success'; break;
                case 'pemeliharaan': color = 'warning'; break;
                default: color = 'black'; break;
            }
            return <Chip color={color} label={value} />
        }
    },
    {
        id: 'createdAt', label: 'Tanggal', minWidth: 100, format: (value) => {
            let dateCreated = Date.parse(value);
            const date = new Date(dateCreated);
            return (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ", " + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
        }
    },
];

export default function Barang() {
    const [rows, setRows] = useState(null);
    const { token, logout, user } = useAuth();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [copyList, setCopyList] = useState([]);
    const [kategori, setKategori] = useState(null);
    const [kategoriID, setIDKategori] = useState(0);
    const [skpd, setSKPD] = useState(null);
    const [skpdID, setIDSKPD] = useState(0);
    const [nilaiPenyusutan, setNilaiPenyusutan] = useState(0);

    // Fetch data for Barang, Kategori, and SKPD
    const getDataBarang = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "api/barang", {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => {
                if (res.status === 403) {
                    logout()
                }
                return res.json()
            })
            .then(data => {
                let dataFilter;
                switch (user.role) {
                    case "superadmin": dataFilter = data; break;
                    case "admin": dataFilter = data.filter((item) => item.id_skpd.toString().includes(user.id_skpd)); break;
                    case "user": dataFilter = data.filter((item) => item.id_skpd.toString().includes(user.id_skpd)); break;
                    default: dataFilter = []; break;
                }
                return setRows(dataFilter)
            })
            .catch(err => console.log(err));
    }, [token, logout, user.role, user.id_skpd]);

    const getDataKategori = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "api/kategori", {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => res.json())
            .then(data => setKategori(data))
            .catch(err => console.log(err));
    }, [token]);

    const getDataSetting = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "api/setting", {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => res.json())
            .then(data => data.forEach(element => {
                if (element.kategori === "Penyusutan") {
                    setNilaiPenyusutan(element.nilai)
                }
            }))
            .catch(err => console.log(err));
    }, [token]);

    const getDataSKPD = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "api/skpd", {
            method: 'get',
            headers: HeaderData(token)
        })
            .then(res => res.json())
            .then(data => setSKPD(data))
            .catch(err => console.log(err));
    }, [token]);

    useEffect(() => {
        if (nilaiPenyusutan === 0) getDataSetting();
        if (!rows) getDataBarang();
        else setCopyList(rows);

        if (!kategori) getDataKategori();
        if (!skpd) getDataSKPD();
    }, [rows, kategori, skpd, getDataBarang, getDataKategori, getDataSKPD, getDataSetting]);

    // Handle page and rows per page change
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // Filter handling for Kategori and SKPD
    const handleKategoriData = useCallback((e) => {
        setIDKategori(e);
        if (parseInt(e) === 0) {
            setCopyList(rows);
        } else {
            setCopyList(rows.filter(row => parseInt(row.id_kategori) === parseInt(e)));
        }
    }, [rows]);

    const handleSKPDData = useCallback((e) => {
        setIDSKPD(e);
        if (parseInt(e) === 0) {
            setCopyList(rows);
        } else {
            setCopyList(rows.filter(row => parseInt(row.id_skpd) === parseInt(e)));
        }
    }, [rows]);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Grid container spacing={1} xs={12} m={1} alignItems={'center'} justifyContent={'space-between'}>
                <Grid item>
                    <Box sx={{ marginTop: 0.5, marginBottom: 1 }}>
                        <TambahData execute={getDataBarang} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box sx={{ marginTop: 0.5, marginBottom: 1, marginRight: 3 }}>
                        {/* <Button
                            variant='contained'
                            color='success'
                            sx={{ borderRadius: 0 }}
                            onClick={() => window.open('#/admin/print')}
                        >
                            <Typography marginRight={2} textTransform={"none"} fontWeight={700}>
                                {"Cetak Data"}
                            </Typography>
                            <PrintRounded />
                        </Button> */}
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={1} xs={12} m={1} alignItems={'center'}>
                <Grid item xs={6} md={4} lg={3}>
                    <FormControl fullWidth>
                        <InputLabel size='small' id="opd-select-label">Filter Kategori</InputLabel>
                        <Select
                            labelId="opd-select-label"
                            id="opd-select"
                            value={kategoriID}
                            label="Kategori"
                            onChange={(e) => handleKategoriData(e.target.value)}
                            size="small"
                        >
                            <MenuItem value={0}>{"Semua"}</MenuItem>
                            {kategori && kategori.length > 0
                                ? kategori.map((items) => (
                                    <MenuItem key={items.id} value={items.id}>
                                        {items.kategori}
                                    </MenuItem>
                                ))
                                : <MenuItem disabled>No data available</MenuItem>
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} md={4} lg={3}>
                    <FormControl fullWidth>
                        <InputLabel size='small' id="skpd-select-label">Filter SKPD</InputLabel>
                        <Select
                            labelId="skpd-select-label"
                            id="skpd-select"
                            value={skpdID}
                            label="SKPD"
                            onChange={(e) => handleSKPDData(e.target.value)}
                            size="small"
                        >
                            <MenuItem value={0}>{"Semua"}</MenuItem>
                            {skpd && skpd.length > 0
                                ? skpd.map((items) => (
                                    <MenuItem key={items.id} value={items.id}>
                                        {items.nama_skpd}
                                    </MenuItem>
                                ))
                                : <MenuItem disabled>No data available</MenuItem>
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <TableContainer sx={{ maxHeight: '90vh', marginTop: 4 }}>
                <Table size='small' stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell key={'no'} align={'center'} sx={{ minWidth: 5 }}>
                                {'No'}
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell key={column.id === 'User' ? column.label : column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                                    {column.label}
                                </TableCell>
                            ))}
                            {
                                <TableCell key={'aksi'} align={'center'} style={{ minWidth: 180 }}>
                                    {'Aksi'}
                                </TableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {copyList
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                    <TableCell align='center' key={'no'}>
                                        {page * rowsPerPage + index + 1}
                                    </TableCell>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        if (column.id === 'harga_barang' && !column.format) {
                                            return (
                                                <TableCell key={'harga_penysutan' + index} align={column.align}>
                                                    {"Rp. " + (parseInt(value) - (parseInt(value) * (parseInt(nilaiPenyusutan) / 100))).toLocaleString()}
                                                </TableCell>
                                            )
                                        } else {
                                            return (
                                                <TableCell key={column.id === 'User' ? column.label : column.id} align={column.align}>
                                                    {column.format ? column.format(value) : value}
                                                </TableCell>
                                            );
                                        }

                                    })}
                                    {
                                        (user.role === "superadmin" || user.role === "admin") &&
                                        <TableCell
                                            align='center'
                                            key={'aksi'}>
                                            <Grid container direction={"row"} justifyContent={'center'}>
                                                <Grid item>
                                                    <EditData id={row.id} key={"edit-" + row.id} execute={getDataBarang} />
                                                </Grid>
                                                <Grid item>
                                                    <DeleteData key={'delete-' + row.id} id={row.id} execute={getDataBarang} />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    }
                                    {
                                        (user.role === "user") &&
                                        <TableCell
                                            align='center'
                                            key={'aksi'}>
                                            <Grid container direction={"row"} justifyContent={'center'}>
                                                <Grid item>
                                                    <ShowData id={row.id} key={"show-" + row.id} />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    }
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={copyList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}