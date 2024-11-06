"use client";

import { useState } from "react";
import axios from 'axios';
import { useRouter } from "next/router";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const login = async() =>{
        const url = "http://localhost/contacts-api/users.php";
        const jsonData = {username:username, password:password}

        var response = await axios.get(url, {
            params:{json: JSON.stringify(jsonData), operation: "login"}
        });

        if(response.data.length > 0){
            let params = new URLSearchParams();
            params.append('fullname', response.data[0].usr_fullname);
            params.append('userId', response.data[0].usr_id);
            router.push(`/main?${params}`);
        }else{
            alert("Invalid username or password.");
        }
    }

    return (
        <>
        <h1>Login to MySQL Database</h1>

        <input type="text" placeholder="username" value={username} onChange={(e) =>{setUsername(e.target.value);}}/>
        <br/>
        <input type="text" placeholder="password" value={password} onChange={(e) =>{setPassword(e.target.value);}}/>
        <br/>
        <button onClick={login}>Login</button>
        </>
    );
};

export default Login;