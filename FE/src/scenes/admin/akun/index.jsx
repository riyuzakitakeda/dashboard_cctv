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
import TextField from '@mui/material/TextField';
import { Chip, Grid } from '@mui/material';
// import { tokens } from '../../../theme';
import TambahUser from './tambah';
import EditDataUser from './edit';
import DeleteUser from './delete';
import { HeaderData } from '../../../data/headerCostum';
import { useAuth } from '../../../auth/auth_provider';

const columns = [
    {
        id: 'username',
        label: 'Username',
        minWidth: 200
    },
    {
        id: 'nama',
        label: 'Nama',
        minWidth: 200
    },
    {
        id: 'MasterSKPD',
        label: 'SKPD',
        minWidth: 200,
        format: (value) => {
            return (<>{value["nama_skpd"]}</>)
        }
    },
    {
        id: 'email',
        label: 'E-mail',
        minWidth: 200
    },
    {
        id: 'no_hp',
        label: 'No HP',
        minWidth: 200
    },
    {
        id: 'role',
        label: 'Role',
        minWidth: 170,
    },
    {
        id: 'status',
        label: 'Status',
        format: (value) => {
            if (value === "active") {
                return (<Chip label={value} color='success' />)
            } else {
                return (<Chip label={value} color='error' />)
            }

        },
        minWidth: 100
    },
];


export default function DaftarUser() {
    const [rows, setRows] = useState([])
    const { token, logout } = useAuth();

    let rowNumber = 0;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [copyList, setCopyList] = useState(rows);

    const getDataUser = useCallback(() => {
        fetch(process.env.REACT_APP_API_URL + "api/user", {
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

    const searchText = (searched) => {
        setCopyList(rows.filter((item) => {
            return (searched)
                ? item.nama.toUpperCase().includes(searched.toUpperCase())
                : item.username.toUpperCase().includes(searched.toUpperCase())
        }
        ));
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        if (rows.length === 0) {
            getDataUser()
        } else {
            setCopyList(rows)
        }
    },
        [getDataUser, rows]
    )

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Grid container item xs={12} m={1} alignItems={'center'} justifyContent={'space-between'}>
                <Grid item xs={6} md={5} lg={3}>
                    <TextField
                        id="outlined-textarea"
                        label="Cari"
                        placeholder="Cari Nama User"
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
                    <TambahUser execute={getDataUser} />
                </Grid>
            </Grid>
            <TableContainer sx={{ maxHeight: '90vh' }}>
                <Table size='small' stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={'no-index'}
                                align={'center'}
                                style={{ minWidth: 5 }}
                            >
                                {'No'}
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={"head-" + column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell
                                key={'aksi-index'}
                                align={'center'}
                                style={{ minWidth: 200 }}
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
                                                <TableCell key={"body" + column.id} align={column.align}>
                                                    {column.format
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            align='center'
                                            key={'aksi'}
                                        >
                                            <Grid container direction={"row"} justifyContent={'center'} spacing={1}>
                                                <Grid item>
                                                    <EditDataUser id={row.id} key={'edit'+row.id} execute={getDataUser} />
                                                </Grid>
                                                <Grid item>
                                                    <DeleteUser id={row.id} key={'delete'+row.id} execute={getDataUser} />
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