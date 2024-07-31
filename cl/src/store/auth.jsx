import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState("");
    const [isLoadding,setIsLoadding] = useState(true);
    const authorizationToken =`Bearer ${token}`;

    const storeTokenInLS = (serverToken) => {
        localStorage.setItem("token", serverToken);
        setToken(serverToken);
    };

    const LogoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("formFields");
        setToken(null);
    };

    const isLoggedIn = !!token;

    const userAuthentication = async () => {
        try{
            setIsLoadding(true);
            const response = await fetch("http://localhost:3000/user", {
                method: "GET",
                headers: {
                    Authorization: authorizationToken,
                },
            });
            if(response.ok){
                const data = await response.json();
                console.log("data",data)
                setUser(data.userData);
                setIsLoadding(false);
            }else{
                console.log("Error fetching user data");
                setIsLoadding(false);
            }

        }catch(error){
            console.error("Error Fetching user data");

        }


    }
    useEffect(()=>{
        if(isLoggedIn){
            userAuthentication();
        }else{
            setUser(null);
        }
    },[isLoggedIn]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, storeTokenInLS, LogoutUser, user, authorizationToken,isLoadding, }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UseAuth = () => useContext(AuthContext);
