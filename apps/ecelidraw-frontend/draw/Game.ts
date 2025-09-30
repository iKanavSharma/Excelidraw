import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape={
    type:"rect";
    x:number;
    y:number;
    width: number;
    height: number;
} | {
    type:"circle";
    centerX:number;
    centerY:number;
    radius:number;
} | {
    type:"pencil";
    startX:number;
    startY:number;
    endX:number;
    endY:number;
}

export class Game{

    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private existingShapes:Shape[];
    private roomId:string;
    private clicked:boolean;
    private startX=0;
    private startY=0;
    private selectedTool:Tool="rect";
    socket:WebSocket;
    

    constructor(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket){
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d")!;
        this.existingShapes=[];
        this.roomId=roomId;
        this.socket=socket;
        this.clicked=false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy(){
        this.canvas.removeEventListener("mousedown",this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup",this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove",this.mouseMoveHandler);
    }

    setTool(tool:"circle"|"pencil"|"rect"){
        this.selectedTool=tool;
    }

    async init(){
        this.existingShapes=await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers(){
        this.socket.onmessage=(event)=>{
            const message=JSON.parse(event.data);

            if(message.type=="chat"){
                const parsedShape=JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                //rerender everything
                this.clearCanvas();
            }
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle="rgba(0,0,0)"
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        //rendering existing shapes
        this.existingShapes.map((shape)=>{
            if(shape.type==="rect"){
                this.ctx.strokeStyle="rgba(255,255,255)"
                this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
            }else if(shape.type==="circle"){
                
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX,shape.centerY,Math.abs(shape.radius),0,Math.PI*2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }
    //creating functions
    mouseDownHandler=(e)=>{
        this.clicked=true;
        this.startX=e.clientX;
        this.startY=e.clientY;
    }

    mouseUpHandler=(e)=>{
        this.clicked=false;
        const width=e.clientX-this.startX;
        const height=e.clientY-this.startY;
        
        const selectedTool=this.selectedTool;
        let shape:Shape|null=null;
        if(selectedTool==="rect"){
            shape={
                type:"rect",
                x:this.startX,
                y:this.startY,
                height,
                width
            }
            
        }else if(selectedTool==="circle"){
            const radius=Math.max(width,height)/2;
            shape={
                type:"circle",
                radius:radius,
                centerX:this.startX+radius,
                centerY:this.startY+radius,
            }
        
        }
        if(!shape){
            return;
        }
            
        this.existingShapes.push(shape);

        //send the message
        this.socket.send(JSON.stringify({
            type:"chat",
            message:JSON.stringify({
                shape
            }),
            roomId:this.roomId
        }))
    }

    mouseMoveHandler=(e)=>{
        if(this.clicked){
            const width=e.clientX-this.startX;
            const height=e.clientY-this.startY;
            this.clearCanvas();
            
            this.ctx.strokeStyle="rgba(255,255,255)"
            //@ts-ignore
            const selectedTool=this.selectedTool;//now tis can also be a member
            if(selectedTool==="rect"){
                //render rectangle
                this.ctx.strokeRect(this.startX,this.startY,width,height);
            }else if(selectedTool==="circle"){
                const centerX=this.startX+width/2;
                const centerY=this.startY+height/2;
                const radius=Math.max(width,height)/2;
                this.ctx.beginPath();
                this.ctx.arc(centerX,centerY,Math.abs(radius),0,Math.PI*2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    initMouseHandlers(){

        this.canvas.addEventListener("mousedown",this.mouseDownHandler);
        this.canvas.addEventListener("mouseup",this.mouseUpHandler)
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler);
        
    }
}