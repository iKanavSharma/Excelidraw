"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [fullName,setFullName]=useState("");
    const navigate=useRouter();
    return <div className="flex justify-center items-center bg-slate-300 h-screen">
        <div className="w-full max-w-md p-8 space-y-6 bg-card bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center">Sign Up</h2>
            <form className="space-y-6">
                <input type="email" placeholder="Email" value={email} className="px-2 py-2 w-full border rounded-md" onChange={(e)=>{
                    setEmail(e.target.value);
                }}/>

                <input type="password" placeholder="Password" value={password} className="px-2 py-2 w-full border rounded-md" onChange={(e)=>{
                    setPassword(e.target.value);
                }}/>

                <input type="text" placeholder="Full Name" value={fullName} className="px-2 py-2 w-full border rounded-md" onChange={(e)=>{
                    setFullName(e.target.value);
                }}/>
                <div className="pt-4">
                    <button className="bg-blue-500 w-full border px-1 py-1 rounded-md cursor-pointer" onClick={async ()=>{
                        const response=await axios.post("http://localhost:3001/signup",{
                            email,
                            password,
                            name:fullName
                        });
                        localStorage.setItem("token",response.data.token);
                        //creating room just after signup 
                        const room=await axios.post("http://localhost:3001/room",{
                            name:`${fullName}-room`
                        },{
                            headers:{
                                Authorization: `Bearer ${response.data.token}`
                            }
                        })
                        const roomId=room.data.roomId
                        navigate.push(`/canvas/$[roomId]`);
                    }}>Sign Up</button>
                    <p className="text-center text-sm text-muted-foreground py-2">
                        Already  have an account?<a href="/signin" className="text-primary hover:underline hover:text-red-600">Sign In</a>
                    </p>
                    
                </div>
            </form>
        </div>

    </div>
}