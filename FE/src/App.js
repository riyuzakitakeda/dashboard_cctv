import React, { Suspense } from "react";
import { Alert, CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import {
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
  defer,
  Route,
  useOutlet,
  useLoaderData,
  Await,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/auth_provider";
import Login from "./scenes/login";
import SplashScreen from "./scenes/global/spashscreen";
import DaftarUser from "./scenes/admin/akun";
import Dashboard from "./scenes/admin/dashboard";
import SideMenu from "./scenes/global/Menu";
import DaftarKategori from "./scenes/admin/kategori";
import DaftarSKPD from "./scenes/admin/skpd";
import Barang from "./scenes/admin/barang";
import DaftarSetting from "./scenes/admin/setting";
import DashboardCCTV from "./scenes/dashboard";

// Component to protect routes based on user roles
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const { role, status } = user;

  if (status !== "active") {
    return <Alert severity="warning">Your account is not active.</Alert>;
  }

  if (!allowedRoles.includes(role)) {
    return <Alert severity="error">You do not have access to this page.</Alert>;
  }

  return children;
};

const App = () => {
  const [theme, colorMode] = useMode();
  const router = createHashRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<AuthLayout />}
        loader={() => defer({ userPromise: getUserData() })}
      >
        {/* Public Routes */}
        <Route index element={<DashboardCCTV />} />
        <Route path="login" element={<Login />} />
        <Route path="dahboard" element={<DashboardCCTV />} />

        {/* Protected Admin Routes */}
        <Route path="admin" element={<ProtectedLayout />}>
          {/* Only admin users can access these routes */}
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="daftaruser"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DaftarUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="daftarkategori"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <DaftarKategori />
              </ProtectedRoute>
            }
          />
          <Route
            path="daftarskpd"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DaftarSKPD />
              </ProtectedRoute>
            }
          />
          <Route
            path="daftarbarang"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'user']}>
                <Barang />
              </ProtectedRoute>
            }
          />
          <Route
            path="setting"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DaftarSetting />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    )
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const getUserData = () =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const user = window.localStorage.getItem("user");
      resolve(user);
      reject("Error");
    }, 3000)
  );

const ProtectedLayout = () => {
  const { user } = useAuth();
  const { status } = user;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (status !== "active") {
    return <Alert severity="warning">Your account is not active.</Alert>;
  }

  return (
    <div>
      <SideMenu />
    </div>
  );
};

const AuthLayout = () => {
  const outlet = useOutlet();
  const { userPromise } = useLoaderData();

  return (
    <Suspense fallback={<SplashScreen />}>
      <Await
        resolve={userPromise}
        errorElement={
          <Alert severity="error">
            404: The page you are looking for does not exist
          </Alert>
        }
        children={(user) => (
          <AuthProvider userData={user}>{outlet}</AuthProvider>
        )}
      />
    </Suspense>
  );
};

export default App;
