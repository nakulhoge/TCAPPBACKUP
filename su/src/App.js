import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Logout from './components/Logout'
import Admins from './components/Admins'
import Forms from './components/Forms'
import RoleAllocation from './components/RoleAllocation'
import { AuthProvider } from './store/auth'
import './App.css'
import TaskToUser from './components/TaskToUser'
import Reports from './components/Reports'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className='mainWrapper'>
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/admins" element={<Admins />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/allocation" element={<RoleAllocation />} />
              <Route path="/tasktouser" element={<TaskToUser/>} />
              <Route path="/reports" element={<Reports/>} />
              
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
