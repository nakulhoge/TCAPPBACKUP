import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Timer = ({ deadline, taskId, status, taskName }) => {
    const navigate = useNavigate();

    const calculateTimeLeft = () => {
        const difference = new Date(deadline) - new Date();
        return difference > 0 ? difference : 0;
    };

    const [time, setTime] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submittedComments, setSubmittedComments] = useState(() => {
        // Get submitted comments from local storage
        const savedComments = localStorage.getItem('submittedComments');
        return savedComments ? JSON.parse(savedComments) : {};
    });

    useEffect(() => {
        if (status === "Completed/Not Validated") {
            setTime(calculateTimeLeft());
            setIsExpired(false);
            return;
        }

        const intervalId = setInterval(() => {
            const timeLeft = calculateTimeLeft();
            setTime(timeLeft);

            if (timeLeft === 0) {
                setIsExpired(true);
                clearInterval(intervalId);
                if (!submittedComments[taskId]) {
                    setShowModal(true);
                }
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [deadline, status, submittedComments, taskId]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (showModal && !inputValue.trim()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        if (showModal) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        } else {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [showModal, inputValue]);

    const getFormattedTime = (time) => {
        const total_seconds = Math.floor(time / 1000);
        const total_minutes = Math.floor(total_seconds / 60);
        const total_hours = Math.floor(total_minutes / 60);
        const days = Math.floor(total_hours / 24);

        const seconds = total_seconds % 60;
        const minutes = total_minutes % 60;
        const hours = total_hours % 24;

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputValue.trim()) {
            setErrorMessage('Comment is required.');
            return;
        }

        if (selectedFiles.length === 0) {
            setErrorMessage('Please upload at least one image.');
            return;
        }

        const formData = new FormData();
        formData.append('note', inputValue);
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('images', selectedFiles[i]);
        }

        try {
            await axios.post(`http://localhost:3000/tasks/${taskId}/complete`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Task note and images uploaded successfully');
            setInputValue('');
            setSelectedFiles([]);
            setShowModal(false); // Hide the modal

            // Update submitted comments state
            const updatedSubmittedComments = { ...submittedComments, [taskId]: true };
            setSubmittedComments(updatedSubmittedComments);
            localStorage.setItem('submittedComments', JSON.stringify(updatedSubmittedComments));
        } catch (error) {
            console.error('Error submitting input:', error);
            toast.error('Failed to submit task challenge');
        }
    };

    const handleModalClose = () => {
        if (!inputValue.trim()) {
            setErrorMessage('Comment is required.');
        } else {
            setShowModal(false);
        }
    };

    return (
        <div>
            {isExpired && showModal && !submittedComments[taskId] && ( // Ensure modal is shown only when both conditions are met
            
                <div style={overlayStyle}>
                    <ToastContainer />
                    <div style={popupStyle}>
                        <div style={modalStyle}>
                            <h4>{`Comment for ${taskName}`}</h4>
                            <form onSubmit={handleSubmit} style={formStyle}>
                                <textarea
                                    type="text"
                                    placeholder="Challenges/Issues"
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        setErrorMessage('');
                                    }}
                                    style={textareaStyle}
                                />
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    style={inputFileStyle}
                                />
                                {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
                                <button type="submit" style={buttonStyle}>
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {!isExpired && <h6>{getFormattedTime(time)}</h6>}
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black with partial opacity
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const popupStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
};

const modalStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '80%',
    maxWidth: '500px',
    textAlign: 'center',
};

const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

const textareaStyle = {
    width: "100%",
    height: "100px",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
    resize: "vertical",
};

const inputFileStyle = {
    margin: "10px 0",
};

const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
};

const errorStyle = {
    color: 'red',
    fontSize: '14px',
};

// Add global styles to make sure the overlay works as expected
const globalStyles = {
    html: {
        height: '100%',
    },
    body: {
        height: '100%',
        margin: 0,
        overflow: 'hidden', // Prevent scrolling
    },
};

Object.assign(document.documentElement.style, globalStyles.html);
Object.assign(document.body.style, globalStyles.body);

export default Timer;