import React from "react";
import { useState, useContext } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Outlet, useLocation, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListIcon from '@mui/icons-material/List';
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import Drawer from "@mui/material/Drawer";
import {
  Avatar,
  Grid2 as Grid,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { tokens, ColorModeContext } from "../../theme";
import Logo from "../../assets/image/logo_musrembang.png";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { useAuth } from "../../auth/auth_provider";
import { Settings, SubdirectoryArrowRightRounded } from '@mui/icons-material';

const drawerWidth = 250;
const iconMenuSize = 20;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  //   backgroundColor: "black",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerMini = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const Item = ({ title, to, icon, selected, setSelected, isOpen }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <ListItem
      key={title.replace(/\W+/g, "_").toLowerCase()}
      disablePadding
    >
      <ListItemButton
        sx={{
          minHeight: 35,
          justifyContent: isOpen ? "flex-start" : "center",
          alignContent: isOpen ? "center" : "center",
          px: 2.5,
          color: "#000",
          borderRadius: 2,
          marginX: isOpen ? 2 : 0.5,
          marginY: 1,
          ":hover": {
            backgroundColor: "rgba(217, 52, 56, 0.2)",
          },
          background: selected === to ? "rgba(217, 52, 56, 0.2)" : "rgba(217, 52, 56, 0)",
        }}
        component={Link}
        to={to}
        onClick={() => setSelected(title)}
      >
        <Grid container>
          <Grid item xs={4}>
            <ListItemIcon
              sx={{
                justifyContent: "flex-start",
                alignItems: "center",
                display: "flex",
                color: "#D93438",
                marginY: 1
              }}
            >
              {icon}
            </ListItemIcon>
          </Grid>
          <Grid item xs={8}>
            <ListItemText
              primary={title}
              sx={{
                whiteSpace: "nowrap",
                maxWidth: 100,
                opacity: isOpen ? 1 : 0,
                color: "#D93438",
                textAlign: "left",
                display: isOpen ? "block" : "none",
                marginY: 1
              }}
              primaryTypographyProps={{ fontWeight: "bold", fontSize: "12px" }}
            />
          </Grid>
        </Grid>
      </ListItemButton>
    </ListItem>
  );
};

const SideMenu = (props) => {
  let location = useLocation();
  const { user, logout } = useAuth();
  const { role, status } = user;

  const [selected, setSelected] = useState("Dashboard");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const [openListMenu, setOpenListMenu] = useState(false);
  const [pathaurl, setPathUrl] = useState('');
  const handleListMenu = () => {
    setOpenListMenu(!openListMenu);
  };

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    document.title = location.pathname.slice(7);
    setSelected(location.pathname.slice(7));
    setPathUrl(location.pathname)
  }, [location, setSelected, setPathUrl]);

  const { window } = props;

  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const contain =
    window !== undefined ? () => window().document.body : undefined;

  const drawer = (
    <Box sx={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}>
      <DrawerHeader>
        <Grid sx={{ flexGrow: 1, margin: 2 }} container justifyContent="center">
          {open ? <img src={Logo} alt="logo" width={"180px"} /> : <></>}
        </Grid>
      </DrawerHeader>
      <Divider sx={{ marginBottom: 2 }} />
      <List>
        {open && (
          <Typography
            variant="h6"
            textTransform={"uppercase"}
            fontWeight={"700"}
            marginX={2}
          >
            {"Menu Menu"}
          </Typography>
        )}
        <Item
          title="Dashboard"
          to="dashboard"
          icon={<GridViewRoundedIcon sx={{ fontSize: iconMenuSize }} />}
          selected={selected}
          setSelected={setSelected}
          isOpen={open}
        />
        <Item
          title="Master Barang"
          to="daftarbarang"
          icon={<ListIcon sx={{ fontSize: iconMenuSize }} />}
          selected={selected}
          setSelected={setSelected}
          isOpen={open}
        />
        <Divider sx={{ marginBottom: 2 }} />

        {/* Show Master Data and Daftar Admin only for super_admin */}
        {(role === "superadmin" && status === "active") && (
          <>
            {open && (
              <Typography
                variant="h6"
                textTransform={"uppercase"}
                fontWeight={"700"}
                marginX={2}
              >
                {"Master Data"}
              </Typography>
            )}
            {/* <ListItemButton
                onClick={handleListMenu}
                sx={{
                  minHeight: 35,
                  justifyContent: open ? "flex-start" : "center",
                  px: 2.5,
                  marginY: 1,
                  backgroundColor: openListMenu ? "rgba(217, 52, 56, 0.2)" : "rgba(217, 52, 56, 0)",
                  borderRadius: 10,
                  marginX: open ? 2 : 0,
                }}
              >
                <Grid container gap="20px">
                  <Grid item>
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                      <DescriptionRounded sx={{ fontSize: iconMenuSize }} />
                    </ListItemIcon>
                  </Grid>
                  <Grid item>
                    <ListItemText
                      primary={"Master"}
                      sx={{
                        opacity: open ? 1 : 0,
                        color: "rgba(142, 25, 31, 1)",
                        textAlign: "center",
                        display: open ? "visible" : "none",
                      }}
                      primaryTypographyProps={{ fontSize: "12px", fontWeight: 700 }}
                    />
                  </Grid>
                  {open && <Grid item>{openListMenu ? <ExpandLess /> : <ExpandMore />}</Grid>}
                </Grid>
              </ListItemButton>
              <Collapse in={openListMenu} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ marginLeft: 2 }}> */}
            <Item
              title="Master Kategori"
              to="daftarkategori"
              icon={<SubdirectoryArrowRightRounded sx={{ fontSize: iconMenuSize }} />}
              selected={selected}
              setSelected={setSelected}
              isOpen={open}
            />
            <Item
              title="Master SKPD"
              to="daftarskpd"
              icon={<SubdirectoryArrowRightRounded sx={{ fontSize: iconMenuSize }} />}
              selected={selected}
              setSelected={setSelected}
              isOpen={open}
            />
            {/* </List>
              </Collapse> */}

            {open && (
              <Typography
                variant="h6"
                textTransform={"uppercase"}
                fontWeight={"700"}
                marginX={2}
              >
                {"Master Akun"}
              </Typography>
            )}
            <Item
              title="Daftar Admin"
              to="daftaruser"
              icon={<PeopleAltRoundedIcon sx={{ fontSize: iconMenuSize }} />}
              selected={selected}
              setSelected={setSelected}
              isOpen={open}
            />
            {open && (
              <Typography
                variant="h6"
                textTransform={"uppercase"}
                fontWeight={"700"}
                marginX={2}
              >
                {"Pengaturan"}
              </Typography>
            )}
            <Item
              title="Pengaturan"
              to="setting"
              icon={<Settings sx={{ fontSize: iconMenuSize }} />}
              selected={selected}
              setSelected={setSelected}
              isOpen={open}
            />
          </>
        )}
      </List>
    </Box>
  );

  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        {/* for styling topbar */}
        <Toolbar
          style={{
            borderBottom: "1px solid #F1D088",
            background: `#801111`,
            backgroundImage: `linear-gradient(90deg, rgba(146, 28, 32, 1), rgba(0, 0, 0, 1))`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            // backgroundSize: "co",
          }}
        >
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
            width={"100%"}
          >
            <Grid item container alignItems={"center"}>
              <Grid item>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={{
                    marginRight: 5,
                    ...(open && { display: "none" }),
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerClose}
                  edge="start"
                  sx={{
                    marginRight: 3,
                    ...(!open && { display: "none" }),
                  }}
                >
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </Grid>
              {/* item in center topbar?? */}

              {/* <Grid item>
                <img src={logo_pemkot} alt="pemkot" width={50} />
              </Grid> */}
            </Grid>
            {/* <Grid
              sx={{
                display: { xs: "none", sm: "block" },
                color: "white",
                padding: { xs: "", sm: "0px" },
                textAlign: "center",
                fontWeight: "bold",
                ml: 10,
                fontSize: "1.8em",
              }}
            >
              <p>Musrenbang RPJPD Tahun 2025 - 2045</p>
            </Grid> */}
            <Grid />
            <Grid item container alignItems={"center"}>
              {/* <Grid item>
                <img src={logo_tagline} alt="tagline" height={50} />
              </Grid>
              <Grid item>
                <img src={logo_makan_enak} alt="makan enak" height={50} />
              </Grid> */}
              <Grid item container py={2}>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleClickMenu}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={openMenu ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? "true" : undefined}
                  >
                    <Avatar sx={{ width: 30, height: 30 }}>
                      <img src={Logo} alt="avatar" width={"100%"} />
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={openMenu}
                  onClose={handleCloseMenu}
                  onClick={handleCloseMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      "&::before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={colorMode.toggleColorMode}>
                    <ListItemIcon>
                      {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                      ) : (
                        <LightModeOutlinedIcon />
                      )}
                    </ListItemIcon>
                    Ganti Warna
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    <ListItemIcon>
                      {/* <IconButton sx={{
                                                backgroundColor: colors.redAccent[500],
                                                ":hover": {
                                                    backgroundColor: colors.redAccent[700]
                                                }
                                            }} onClick={logout}> */}
                      <LogoutRoundedIcon
                        sx={{
                          color: colors.grey[100],
                        }}
                      />
                      {/* </IconButton> */}
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Drawer
        container={contain}
        variant="temporary"
        open={!matches ? open : false}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
          overflow: "auto",
        }}
      >
        {/* <Box sx={{
                    height: '100vh'
                }}> */}
        {drawer}
        {/* </Box> */}
      </Drawer>
      <DrawerMini
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
        }}
        open={open}
      >
        {drawer}
      </DrawerMini>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          maxHeight: "100vh",
          overflow: "auto",
        }}
      >
        <DrawerHeader />
        <Grid>
          <Outlet />
        </Grid>
      </Box>
    </Box>
  );
};

export default SideMenu;
