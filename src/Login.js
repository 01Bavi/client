import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'

const Login = () => {
    const [name, setName]=useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imageMessage, setImageMessage] = useState('');
    const [profileVideo, setProfileVideo] = useState(null);
    const [videoMessage, setVideoMessage] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                name:name,
                email: email,
                password: password
            });
            setMessage(response.data.message);
            setLoggedInUser(response.data.user);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed');
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!loggedInUser) {
            setImageMessage('You must be logged in to upload a profile image.');
            return;
        }


        const formData = new FormData();
        formData.append('profileImage', profileImage);
        formData.append('email', email);

        try {
            const response = await axios.post('http://localhost:5000/api/users/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImageMessage(response.data.message);
            setLoggedInUser((prevUser) => ({
                ...prevUser,
                profileImage: response.data.imageUrl
            }));

        } catch (error) {
            setImageMessage('Image upload failed');
        }
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        if (!loggedInUser) {
            setVideoMessage('You must be logged in to upload a profile video.');
            return;
        }
    
        const formData = new FormData();
        formData.append('profileVideo', profileVideo); // Append video instead of image
        formData.append('email', email);
    
        try {
            const response = await axios.post('http://localhost:5000/api/users/uploadVideo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setVideoMessage(response.data.message);
            setLoggedInUser((prevUser) => ({
                ...prevUser,
                profileVideo: response.data.videoUrl
            }));
        } catch (error) {
            setVideoMessage('Video upload failed');
        }
    };

    return (
        <div>
            <h2 className='heading'>Login</h2>
            {!loggedInUser && (
            <form onSubmit={handleSubmit} className='loginform'>
                <div>
                <label>Name:</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />

                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className='btn'>Login</button>
            </form>
            )}
            {message && <p>{message}</p>}

             {/* {loggedInUser && !loggedInUser.profileImage && (
                <form onSubmit={handleImageUpload}>
                    <div>
                        <label>Upload Profile Image:</label>
                        <input
                            type="file"
                            onChange={(e) => setProfileImage(e.target.files[0])}
                            required
                        />
                    </div> */}

                    {loggedInUser && !loggedInUser.profileVideo && (
            <form onSubmit={handleVideoUpload}>
                <div>
                    <label>Upload Profile Video:</label>
                    <input
                        type="file"
                        onChange={(e) => setProfileVideo(e.target.files[0])} // Accept video file
                        required
                    />
                </div>

                    <button type="submit" className='btn'>Upload Image</button>
                </form>
            )}

           

            {/* {loggedInUser?.profileImage && (
                <div>
                    <h3>Profile Image:</h3>
                    <img src={loggedInUser.profileImage} alt="Profile" width="200" />
                </div>
            )} */}
            
            {loggedInUser?.profileVideo && (
            <div>
                <h3>Profile Video:</h3>
                <video width="320" height="240" controls>
                    <source src={loggedInUser.profileVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            )}

        </div>
    );
};

export default Login;
