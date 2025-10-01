"use client"
import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Signin(){
    const [userName,setuserName]=useState("");
    const [password,setPassword]=useState("");
    const navigation=useRouter();
    return <div className="flex justify-center items-center min-h-screen bg-background bg-gray-300">
        <div className="w-full max-w-md p-8 space-y-6 bg-card bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center">Sign in to your account</h2>
            <form className="space-y-4">
                <input type="email" placeholder="Email" value={userName} className="w-full px-4 py-2 border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary" onChange={(e)=>{
                    setuserName(e.target.value)
                }}/>
                <input type="password" placeholder="Password" value={password} className="w-full px-4 py-2 border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary" onChange={(e)=>{
                    setPassword(e.target.value)
                }}/>
                <button type="submit" className="w-full bg-blue-500 py-2 px-4 bg-primary text-primary foreground rounded-md hover:bg-primary/90" onClick={async (e)=>{
                    e.preventDefault();
                    const response=await axios.post("http://localhost:3001/signin",{
                        userName,
                        password
                    });
                    const token=response.data.token
                    localStorage.setItem("token",token);//store token
                    //create room
                    const room=await axios.post("http://localhost:3001/room",{
                        name:`${userName}-room`
                    },{
                        headers:{
                            Authorization:`${token}`
                        }
                    })
                    //roomid 
                    const roomId=room.data.id;
                    navigation.push(`/canvas/${roomId}`);
                }}>
                Sign In
                </button>
                <p className="text-center text-sm text-muted-foreground">
                    Dont't have an account?<a href="/signup" className="text-primary hover:underline">Sign up</a>
                </p>
            </form>
        </div>

    </div>
}


