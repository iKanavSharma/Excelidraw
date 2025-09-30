import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool="circle"|"rect"|"pencil";

export function Canvas({
    roomId,
    socket
}:{
    roomId:string;
    socket:WebSocket
}){
    const canvasRef=useRef<HTMLCanvasElement>(null);
    const [game,setGame]=useState<Game>();
    const [selectedTool,setSelectedTool]=useState<Tool>("rect");

    useEffect(()=>{
        game?.setTool(selectedTool);

    },[selectedTool,game]);

    useEffect(()=>{

        if(canvasRef.current){
            //using class
            const g=new Game(canvasRef.current,roomId,socket);
            setGame(g);

            return ()=>{
                g.destroy();
            }
           
        }
                
    },[canvasRef]);

    return <div className="h-screen bg-red overflow-hideen">
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool}/>
    </div>

}

function TopBar({selectedTool,setSelectedTool}:{
    selectedTool:Tool,
    setSelectedTool:(s:Tool)=>void
}){
    return <div className="fixed top-10 left-10">
        <div className="flex gap-2">
            <IconButton activated={selectedTool==="pencil"} icon={<Pencil/>} onClick={()=>{
                setSelectedTool("pencil")
            }}></IconButton>
            <IconButton activated={selectedTool==="rect"} icon={<RectangleHorizontal/>} onClick={()=>{
                setSelectedTool("rect")
            }}></IconButton>
            <IconButton activated={selectedTool==="circle"} icon={<Circle/>} onClick={()=>{
                setSelectedTool("circle")
            }}></IconButton>
        </div>    
    </div>
}