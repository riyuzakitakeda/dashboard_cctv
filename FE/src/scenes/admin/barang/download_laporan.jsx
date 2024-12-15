import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Logo from '../../../assets/image/logoPemkot.png';
import { Box } from '@mui/system';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    // backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const data = {
  nama_pic: "Muhammad Rezky",
  kontak_pic: "0895805040352",
  nama_longwis: "Buger",
  kecamatan: "Bontoala",
  kelurahan: "Prang Layang",
  alamat: "Jln. Hj. Manila Dg. Pati No. 32",
  tanggal: "2024-05-29",
  status: "Sedang Dikerjakan",
  status_fisik_cctv: "1",
  status_fisik_nvr: "1",
  status_tampilan_system: "1",
  status_tampilan_layar: "1"
}

const PrintPDF = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Grid container width={"297mm"}>
            <Grid item container direction={"row"} sx={{
              marginX: 20,
              marginY: 5
            }}>
              <Grid item container xs={3} justifyContent={"center"} >
                <img src={Logo} width={110} alt='Logo Pemkot' />
              </Grid>
              <Grid item xs={9} container direction={'column'} alignItems={"center"} justifyContent={"center"}>
                <Grid item>
                  <Typography variant='h3' fontSize={35} textTransform={'uppercase'} fontWeight={'700'}>
                    {"Pemerintah Kota Makassar"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='h5' fontSize={19} align='center' textTransform={'uppercase'} fontWeight={'700'}>
                    {"Dinas Komunikasi dan Informatika Kota Makassar"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='body1'>
                    {"Jalan Andi Pangeran Pettarani No. 62 Makassar 9032"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='body1'>
                    {"Email: diskolminfo@makassarkota.go.id, HomePage: diskominfo.makassarkota.go.id"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item sx={{
              background: "GrayText",
              height: "2px",
              width: "100%",
              marginBottom: 1,
              marginX: 10,
            }}>
              <Divider />
            </Grid>
          </Grid>
          {/* <Box height={50} sx={{
            pageBreakBefore: "always"
          }} /> */}
          <Grid item width={"297mm"} container paddingX={10}>
            <TableContainer sx={{
              marginTop: 2
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50} align='center'>
                      <Typography fontWeight={700}>{"No"}</Typography>
                    </TableCell>
                    <TableCell width={50} align='center'>
                      <Typography fontWeight={700}>{"Kategori"}</Typography>
                    </TableCell>
                    <TableCell width={200} align='center'>
                      <Typography fontWeight={700}>{"Nama Site / OPD"}</Typography>
                    </TableCell>
                    <TableCell width={100} align='center'>
                      <Typography fontWeight={700}>{"SID / User ID"}</Typography>
                    </TableCell>
                    <TableCell width={400} align='center'>
                      <Typography fontWeight={700}>{"Bandwidth"}</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    data
                      ? data.map((items, index) => {
                        return (
                          <>
                            <TableRow>
                              <TableCell rowSpan={3}>
                                <Typography>
                                  {index + 1}
                                </Typography>
                              </TableCell>
                              <TableCell rowSpan={3}>
                                <Typography fontWeight={700}>
                                  {items.Kategori.nama_kategori}
                                </Typography>
                              </TableCell>
                              <TableCell rowSpan={3}>
                                <Typography>
                                  {items.Skpd.nama_skpd}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography>
                                  {"Ip Transit"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {
                                  items.ip_transit
                                    ? JSON.parse(items.ip_transit).map((item) => {
                                      return (
                                        <img width={175} height={125} alt={item} src={process.env.REACT_APP_API_URL + "uploads/laporan/" + item} />
                                      )
                                    })
                                    : <></>
                                }
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography>
                                  {"Astinet"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {
                                  items.astinet
                                    ? JSON.parse(items.astinet).map((item) => {
                                      return (
                                        <img width={175} height={125} alt={item} src={process.env.REACT_APP_API_URL + "uploads/laporan/" + item} />
                                      )
                                    })
                                    : <></>
                                }
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography>
                                  {"indibiz"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {
                                  items.indibiz
                                    ? JSON.parse(items.indibiz).map((item) => {
                                      return (
                                        <img width={175} height={125} alt={item} src={process.env.REACT_APP_API_URL + "uploads/laporan/" + item} />
                                      )
                                    })
                                    : <></>
                                }
                              </TableCell>
                            </TableRow>
                          </>
                        )
                      })
                      : <></>
                  }

                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </View>
      </Page>
    </Document>
  );
};

export default PrintPDF;
