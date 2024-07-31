import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { UseAuth } from '../store/auth'

const Logout = () => {
  const { LogoutUser } = UseAuth()
  useEffect(() => {
    LogoutUser()
  }, [LogoutUser])

  return <Navigate to="/login" />
}

export default Logout
