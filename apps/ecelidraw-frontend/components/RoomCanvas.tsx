"use client"

import { WS_BACKEND } from "@/config";
import { initDraw } from "@/draw";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}:{roomId:string}){
    
    //do here if not canvas wil be rendered but ws connection is still not there
    const [socket,setSocket]=useState<WebSocket | null>(null);

    //making ws connection
    useEffect(()=>{
        const ws=new WebSocket(`${WS_BACKEND}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZWE3MTNiNy1mZDg4LTQzMGYtOTM2My02M2Y2YjY3ZTc2MjgiLCJpYXQiOjE3NTkxNjQwMzV9.TZR5fpsRvW7S70Ug47DWXIta7yl6D9I0UNSYPNFO62Y`);

        ws.onopen=()=>{
            setSocket(ws);
        }
    },[])

    
    if(!socket){
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket}/>
    </div>
}
