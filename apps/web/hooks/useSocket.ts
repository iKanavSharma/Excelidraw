import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket(){
    const [loading,setLoading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();

    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMzFlOGE1MS1kYjNjLTRlZjctYmM2YS04Y2RjYWVmYzE3NDYiLCJpYXQiOjE3NTg4MjQxNzB9.r9AljuIBGx-gm4mTkEEIgqxuZ2_NylQYrSrkZnLSbl8`);
        ws.onopen=()=>{
            setLoading(false);
            setSocket(ws);
        }
    },[]);

    return {
        socket,
        loading
    }
}