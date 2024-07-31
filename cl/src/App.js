import React from 'react';
import { BrowserRouter , Route,  Routes,useNavigate } from 'react-router-dom';
import RegistrationForm from './components/Register';
import Login from './components/Login';
import AdminLogin from './components/Admin_login';
import './App.css';
import Logout from './components/Logout';
import Admin_Layout from './layouts/Admin_Layout';
import Admin_Users from './components/Admin_Users';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import Admin_RoleFormData from './components/Admin_RoleFormData';
import {  UseAuth } from './store/auth';
import AdminTaskToUser from './components/AdminTaskToUser';
import TaskPage from './components/TaskPage';
import UserProfile from './components/UserProfile';
import Reports from './components/Reports';
import PrivateRoute from './components/PrivateRoute';


function App() {
  return (
    
    <BrowserRouter>
      <div>
      {/* {window.location.pathname !== '/admin' && <Navbar />} */}
        <Routes>
          <Route exact path="/" element={<RegistrationForm/>} />
          <Route path="/register" element={<RegistrationForm/>} />
          <Route path="/login" element={<Login/>} />
          {/* <Route path="/admin_login" element={<AdminLogin></AdminLogin>} /> */}
          <Route path="/logout" element={<Logout></Logout>} />
          <Route path="/task" element={<PrivateRoute><TaskPage/></PrivateRoute>} />
          <Route path="/userprofile" element={<PrivateRoute><UserProfile/></PrivateRoute>} />
          <Route path='/forgotpassword' element={<ForgotPassword></ForgotPassword>}></Route>
          {/* <Route path='/home' element={<PrivateRoute><Home/></PrivateRoute>}></Route> */}
          <Route path="/admin/" element={<PrivateRoute><Admin_Layout/></PrivateRoute>}>
            <Route path="users" element={<PrivateRoute><Admin_Users/></PrivateRoute>}/>
            <Route path="taskToTeamMembers" element={<PrivateRoute><AdminTaskToUser/></PrivateRoute>}/>
            <Route path='roleFormData' element={<PrivateRoute><Admin_RoleFormData/></PrivateRoute>}></Route>
            <Route path='reports' element={<PrivateRoute><Reports/></PrivateRoute>}></Route>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
