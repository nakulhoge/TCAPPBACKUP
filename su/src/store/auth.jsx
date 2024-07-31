import React, { createContext, useContext, useState } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const storeTokenInLS = (serverToken) => {
    localStorage.setItem('token', serverToken)
    setToken(serverToken)
    console.log('token stored:', serverToken)
  }

  const LogoutUser = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ isLoggedIn, storeTokenInLS, LogoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const UseAuth = () => useContext(AuthContext)
