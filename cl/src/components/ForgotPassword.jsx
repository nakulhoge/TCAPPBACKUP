import React, { useState } from 'react';
import axios from 'axios';
import {  useNavigate } from "react-router-dom";
const ForgotResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState('forgot'); // 'forgot' or 'reset'
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        try {
            setLoading(true); // Set loading state to true
            const response = await axios.post('http://localhost:3000/forgot-password', { email });
            setMessage(response.data.message);
            setMode('reset');
        } catch (error) {
            console.error('Error: ', error.response.data.message);
            setMessage(error.response.data.message);
        } finally {
            setLoading(false); // Set loading state back to false
        }
    };

    const handleResetPassword = async () => {
        try {
            setLoading(true); // Set loading state to true
            const response = await axios.post('http://localhost:3000/reset-password', { email, otp, newPassword });
            setMessage(response.data.message);
            navigate("/login");
        } catch (error) {
            console.error('Error: ', error.response.data.message);
            setMessage(error.response.data.message);
        } finally {
            setLoading(false); // Set loading state back to false
        }
    };

    return (
        <div className='container ForgotPasswordSection'>
            <div className='forgotpassCss'>
            <h2>{mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h2>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {mode === 'forgot' ? (
                <button onClick={handleForgotPassword} disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
            ) : (
                <>
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <button onClick={handleResetPassword} disabled={loading}>{loading ? 'Resetting Password...' : 'Reset Password'}</button>
                </>
            )}
            {message && <p>{message}</p>}
        </div>
        </div>
    );
};

export default ForgotResetPassword;
