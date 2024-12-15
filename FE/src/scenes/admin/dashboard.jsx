import { Box, Card, CardContent, Chip, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { HeaderData } from "../../data/headerCostum";
import { useAuth } from "../../auth/auth_provider";
import ShowImage from "./barang/show_image";

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
    id: 'waktu_pemeliharaan', label: 'Waktu Pemeliharaan', minWidth: 100, format: (value) => {
      let dateCreated = Date.parse(value);
      const date = new Date(dateCreated);
      return (date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
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

const Dashboard = () => {
  const [rows, setRows] = useState(null);
  const [categories, setCategories] = useState([]);
  const { token, logout, user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copyList, setCopyList] = useState([]);

  const [totalAset, setTotalAset] = useState(0);
  const [asetBaik, setAsetBaik] = useState(0);
  const [asetRusak, setAsetRusak] = useState(0);
  const [asetPemeliharaan, setAsetPemeliharaan] = useState(0);

  const [asetHargaBaik, setAsetHargaBaik] = useState(0);
  const [asetHargaRusak, setAsetHargaRusak] = useState(0);
  const [asethargaPemeliharaan, setAsetHargaPemeliharaan] = useState(0);

  const [totalHarga, setTotalHarga] = useState(0);
  const [hargaByKategori, setHargaByKategori] = useState({});
  const [totalByKategori, setTotalByKategori] = useState({});

  const [nilaiPenyusutan, setNilaiPenyusutan] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getDataBarang = useCallback(async () => {
    await fetch(process.env.REACT_APP_API_URL + "api/barang", {
      method: 'get',
      headers: HeaderData(token)
    })
      .then(res => {
        if (res.status === 403) {
          logout()
        }
        return res.json();
      })
      .then(data => {
        let dataFilter;
        switch (user.role) {
          case "superadmin": dataFilter = data; break;
          case "admin": dataFilter = data.filter((item) => item.id_skpd.toString().includes(user.id_skpd)); break;
          case "user": dataFilter = data.filter((item) => item.id_skpd.toString().includes(user.id_skpd)); break;
          default: dataFilter = []; break;
        }

        let totalBaik = 0, totalRusak = 0, totalPemeliharaan = 0, totalHarga = 0;
        let totalHargaBaik = 0, totalHargaRusak = 0, totalHargaPemeliharaan = 0;
        const hargaByKategori = {};
        const totalByKategori = {};

        dataFilter.forEach(item => {
          // Calculate asset condition counts
          if (item.status === "baik") { totalBaik++; totalHargaBaik += parseInt(item.harga_barang); }
          if (item.status === "rusak") { totalRusak++; totalHargaRusak += parseInt(item.harga_barang); }
          if (item.status === "pemeliharaan") { totalPemeliharaan++; totalHargaPemeliharaan += parseInt(item.harga_barang); }

          // Calculate total asset prices
          totalHarga += parseInt(item.harga_barang);

          // Calculate prices by category
          const kategori = item.MasterKategoriBarang.kategori;

          if (!hargaByKategori[kategori]) {
            hargaByKategori[kategori] = parseInt(item.harga_barang);
          } else {
            hargaByKategori[kategori] += parseInt(item.harga_barang);
          }

          if (!totalByKategori[kategori]) {
            totalByKategori[kategori] = 1;
          } else {
            totalByKategori[kategori] += 1;
          }
        });

        setAsetBaik(totalBaik);
        setAsetRusak(totalRusak);
        setAsetPemeliharaan(totalPemeliharaan);

        setAsetHargaBaik(totalHargaBaik);
        setAsetHargaRusak(totalHargaRusak);
        setAsetHargaPemeliharaan(totalHargaPemeliharaan);

        setTotalAset(dataFilter.length);
        setTotalHarga(totalHarga);
        setHargaByKategori(hargaByKategori);
        setTotalByKategori(totalByKategori);

        setRows(dataFilter.reverse());
      })
      .catch(err => console.log(err));
  }, [token, logout, user.role, user.id_skpd]);

  const getDataKategori = useCallback(async () => {
    await fetch(process.env.REACT_APP_API_URL + "api/kategori", {
      method: 'get',
      headers: HeaderData(token)
    })
      .then(res => res.json())
      .then(data => setCategories(data))
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

  useEffect(() => {
    if (nilaiPenyusutan === 0) getDataSetting();
    if (categories.length === 0) getDataKategori();
    if (!rows) getDataBarang();

    else setCopyList(rows);
  }, [rows, categories, getDataBarang, getDataKategori]);

  return (
    <Box>
      <Grid container direction={"column"} mt={2}>
        <Grid item container direction={"row"} justifyContent={'space-evenly'} spacing={1}>
          <Grid item direction={'column'} xs={6} lg={3}>
            <Card >
              <CardContent>
                <Grid item container marginBottom={1} direction={'row'} justifyContent={'space-between'}>
                  <Grid item>
                    <Typography>{"Total Aset"}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography fontWeight={700}>{totalAset}</Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Grid item container sx={{
                  backgroundColor: '#D30007',
                  marginTop: 1,
                  paddingX: 1,
                  paddingY: 1.5,
                  borderRadius: 2
                }}>
                  <Grid item container direction={"row"} justifyContent={"space-between"}>
                    <Grid item>
                      <Typography color={'white'}>{"Kondisi Baik"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={'white'} fontWeight={700}>{asetBaik}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item container direction={"row"} justifyContent={"space-between"}>
                    <Grid item>
                      <Typography color={'white'}>{"Rusak"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={'white'} fontWeight={700}>{asetRusak}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item container direction={"row"} justifyContent={"space-between"}>
                    <Grid item>
                      <Typography color={'white'}>{"Sedang Pemeliharaan"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={'white'} fontWeight={700}>{asetPemeliharaan}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item direction={'column'} xs={6} lg={3}>
            <Card >
              <CardContent>
                <Grid item container marginBottom={1} direction={'row'} justifyContent={'space-between'}>
                  <Grid item>
                    <Typography>{"Total Nilai Aset"}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography fontWeight={700}>{"Rp. " + totalHarga.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Grid item container sx={{
                  backgroundColor: '#D30007',
                  marginTop: 1,
                  paddingX: 1,
                  paddingY: 1.5,
                  borderRadius: 2
                }}>
                  <Grid item container direction={"row"} justifyContent={"space-between"}>
                    <Grid item>
                      <Typography color={'white'}>{"Kondisi Baik"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={'white'} fontWeight={700}>{"Rp. " + asetHargaBaik.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item container direction={"row"} justifyContent={"space-between"}>
                    <Grid item>
                      <Typography color={'white'}>{"Rusak"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={'white'} fontWeight={700}>{"Rp. " + asetHargaRusak.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item container direction={"row"} justifyContent={"space-between"}>
                    <Grid item>
                      <Typography color={'white'}>{"Sedang Pemeliharaan"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography color={'white'} fontWeight={700}>{"Rp. " + asethargaPemeliharaan.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item direction={'column'} xs={6} lg={3}>
            <Card >
              <CardContent>
                <Grid item container marginBottom={1} direction={'row'} justifyContent={'space-between'}>
                  <Grid item>
                    <Typography>{"Total Aset per Kategori"}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography fontWeight={700}>{totalAset}</Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Grid item container direction={"column"} sx={{
                  backgroundColor: '#D30007',
                  marginTop: 1,
                  paddingX: 1,
                  paddingY: 1.5,
                  borderRadius: 2
                }}>
                  {Object.entries(totalByKategori).map(([kategori, jumlah]) => (
                    <Grid item container key={kategori} direction={"row"} justifyContent={"space-between"}>
                      <Grid item>
                        <Typography color={'white'}>{kategori}</Typography>
                      </Grid>
                      <Grid item>
                        <Typography color={'white'} fontWeight={700}>{jumlah + " unit"}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item direction={'column'} xs={6} lg={3}>
            <Card >
              <CardContent>
                <Grid item container marginBottom={1} direction={'row'} justifyContent={'space-between'}>
                  <Grid item>
                    <Typography>{"Total Nilai Aset per Kategori"}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography fontWeight={700}>{"Rp. " + totalHarga.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Grid item container direction={"column"} sx={{
                  backgroundColor: '#D30007',
                  marginTop: 1,
                  paddingX: 1,
                  paddingY: 1.5,
                  borderRadius: 2
                }}>
                  {Object.entries(hargaByKategori).map(([kategori, harga]) => (
                    <Grid item container key={kategori} direction={"row"} justifyContent={"space-between"}>
                      <Grid item>
                        <Typography color={'white'}>{kategori}</Typography>
                      </Grid>
                      <Grid item>
                        <Typography color={'white'} fontWeight={700}>{"Rp. " + harga.toLocaleString()}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        {/* Tabel Aset */}
        <Grid item container mt={2}>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={copyList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          <TableContainer sx={{ maxHeight: '90vh' }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align={'center'}>No</TableCell>
                  {columns.map(column => (
                    <TableCell key={column.id} align={column.align} sx={{ minWidth: column.minWidth}} >{column.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {copyList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell align='center'>{page * rowsPerPage + index + 1}</TableCell>
                    {columns.map(column => {
                      const value = row[column.id];
                      if (column.id === "harga_barang" && !column.format) {
                        return (
                          <TableCell key={'harga_penysutan' + index} align={column.align}>
                            {"Rp. " + (parseInt(value) - (parseInt(value) * (parseInt(nilaiPenyusutan) / 100))).toLocaleString()}
                          </TableCell>
                        )
                      } else {
                        return (
                          <TableCell key={column.id}>
                            {column.format ? column.format(row[column.id]) : row[column.id]}
                          </TableCell>
                        )
                      }
                    }
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
