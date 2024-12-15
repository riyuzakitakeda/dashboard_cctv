import { CircularProgress, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import Logo from "../../assets/image/logoPemkot.png";
import LogoRakorsus from "../../assets/image/logo_refleksi2.png";
import Background from "../../assets/image/background_refleksi.jpg";

const SplashScreen = () => {
  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(180deg, rgba(146, 28, 32, 1), rgba(0, 0, 0, 1));`,
        backgroundSize: "cover",
        backgroundPosition: "bottom right",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Grid
        container
        justifyContent="center"
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Grid xs={12} md={9} item>
          <Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingX: 3,
                marginY: 2,
              }}
            >
              {/* <Box marginBottom={3}>
                <img src={Logo} alt="logo" height={"150px"} />
              </Box> */}
              <Box alignItems={"center"} display={"flex"}>
                <Typography textTransform={'uppercase'} variant="h4" color={"#FFFFFF"}>
                  {'PEMANTAUAN CCTV'}
                </Typography>
                {/* <img src={LogoRakorsus} alt="logo" height={"50px"} /> */}
              </Box>
              <Box alignItems={"center"} display={"flex"}>
                <Typography textTransform={'uppercase'} variant="h4" color={"#FFFFFF"}>
                  {'AI REGION COUNTER'}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingX: 3,
                marginY: 4,
              }}
            >
              <CircularProgress
                sx={{
                  color: "#FFF000",
                }}
                size={50}
                thickness={7}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyItems: "center",
                justifyContent: "center",
                paddingX: 3,
                marginY: 1,
              }}
            ></Box>
            {/* <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            paddingX: 3,
                            marginY: 1,
                            color: '#5D0000',
                        }}>
                            <Typography fontWeight={700}>
                                RAKORSUS 2024
                            </Typography>
                            <Typography fontWeight={700}>
                                PEMERINTAH KOTA MAKASSAR
                            </Typography>
                        </Box> */}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SplashScreen;
