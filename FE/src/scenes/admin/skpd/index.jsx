import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Grid, TextField } from '@mui/material';
import TambahData from './tambah';
import EditData from './edit';
import DeleteData from './delete';
import { HeaderData } from '../../../data/headerCostum';
import { useAuth } from '../../../auth/auth_provider';


const columns = [
    {
        id: 'nama_skpd',
        label: 'Nama SKPD',
        minWidth: 200
    },
];


export default function DaftarSKPD() {
    const { token, logout } = useAuth();
    const [rows, setRows] = useState(null);

    let rowNumber = 0;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [copyList, setCopyList] = useState([]);

    const getDataSKPD = useCallback(async () => {
        await fetch(process.env.REACT_APP_API_URL + "api/skpd", {
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
                setRows(data)
            })
            .catch(err => {
                console.log(err)
            })
    }, [token, logout])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const searchText = (searched) => {
        setCopyList(rows.filter((item) => {
            return item.nama_skpd.toUpperCase().includes(searched.toUpperCase())
        }
        ));
    }

    useEffect(() => {
        if (!rows) {
            getDataSKPD()
        } else {
            setCopyList(rows)
        }
    },
        [getDataSKPD, rows]
    )

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Grid container xs={12} m={1} alignItems={'center'} justifyContent={'space-between'}>
                <Grid item xs={6} md={5} lg={3}>
                    <TextField
                        id="outlined-textarea"
                        label="Cari"
                        placeholder="Cari Nama SKPD"
                        multiline
                        sx={{
                            width: '100%'
                        }}
                        size='small'
                        onInput={(e) => searchText(e.target.value)}
                    />
                </Grid>
                <Grid container item xs={6} md={5} lg={3} paddingRight={'4vw'} sx={{
                    // backgroundColor: colors.blueAccent[100]
                }}
                    justifyContent={'end'}
                >
                    <TambahData execute={getDataSKPD} />
                </Grid>
            </Grid>
            <TableContainer sx={{ maxHeight: '90vh' }}>
                <Table size='small' stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={'no-index-skpd'}
                                align={'center'}
                                style={{ minWidth: 5 }}
                            >
                                {'No'}
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={"index-skpd-" + column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell
                                key={'index-skpd-aksi'}
                                align={'center'}
                                style={{ minWidth: 150 }}
                            >
                                {'Aksi'}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {copyList
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                rowNumber += 1;
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        <TableCell
                                            align='center'
                                            key={'no'}>
                                            {rowNumber + page * rowsPerPage}
                                        </TableCell>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            align='center'
                                            key={'aksi'}
                                            sx={{
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Grid container direction={"row"} justifyContent={'center'}>
                                                <Grid item>
                                                    <EditData id={row.id} key={"edit-" + row.id} execute={getDataSKPD} />
                                                </Grid>
                                                <Grid item>
                                                    <DeleteData id={row.id} key={"delete-" + row.id} execute={getDataSKPD} />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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