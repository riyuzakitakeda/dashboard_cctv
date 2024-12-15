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
import { Grid } from '@mui/material';
import TambahData from './tambah';
import EditData from './edit';
import DeleteData from './delete';
import { HeaderData } from '../../../data/headerCostum';
import { useAuth } from '../../../auth/auth_provider';

const columns = [
    {
        id: 'kategori',
        label: 'Kategori Barang',
        minWidth: 250
    },
];


export default function DaftarKategori() {
    const { token, logout } = useAuth();
    const [rows, setRows] = useState(null)

    let rowNumber = 0;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [copyList, setCopyList] = useState([]);

    const getData = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/kategori", {
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

    useEffect(() => {
        if (!rows) {
            getData()
        } else {
            setCopyList(rows)
        }
    },
        [getData, rows]
    )

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Grid container xs={12} m={1} alignItems={'center'} justifyContent={'space-between'}>
                <Grid container item xs={12} paddingRight={'4vw'}
                    justifyContent={'end'}
                >
                    <TambahData execute={getData} />
                </Grid>
            </Grid>
            <TableContainer sx={{ maxHeight: '90vh' }}>
                <Table size='small' stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={'no'}
                                align={'center'}
                                style={{ minWidth: 5 }}
                            >
                                {'No'}
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell
                                key={'aksi'}
                                align={'center'}
                                style={{ minWidth: 100 }}
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
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            align='center'
                                            key={'aksi'}>
                                            <Grid container direction={"row"} justifyContent={'center'}>
                                                <Grid item>
                                                    <EditData id={row.id} key={"edit-" + row.id} execute={getData} />
                                                </Grid>
                                                <Grid item>
                                                    <DeleteData id={row.id} key={"delete-" + row.id} execute={getData} />
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