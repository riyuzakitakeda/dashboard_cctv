import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("user", null);
    const [token, setToken] = useLocalStorage("token", null); // Store token separately
    const navigate = useNavigate();

    // call this function when you want to authenticate the user
    const login = async (data) => {
        try {
            if(data.user && data.token){
                await setUser(data.user); // Assuming 'data' contains user details
                await setToken(data.token); // Store token in local storage
                navigate("/admin");
            }
        } catch (error) {
            console.error("Login failed: ", error); // Handle login failure
            // Optionally show an error message or perform other error handling
        }
    };

    // call this function to sign out logged-in user
    const logout = () => {
        setUser(null);
        setToken(null); // Clear the token on logout
        navigate("/login", { replace: true });
    };

    const value = useMemo(
        () => ({
            user,
            token, // Expose token for authenticated requests
            login,
            logout
        }),
        [user, token] // Ensure to include token in dependencies
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
