import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";
import {prismaClient} from "@repo/db/client";

const wss=new WebSocketServer({port:8080});

interface User{
    ws:WebSocket,
    rooms:string[],
    userId:string
}

const users:User[]=[];

function checkUser(token:string):string | null{
    try{
        const decoded=jwt.verify(token,JWT_SECRET)
        console.log(decoded);
        if(typeof decoded=="string"){
            return null;
        }

        if(!decoded || !decoded.userId){
            return null;
        }
        return decoded.userId;
    }catch(e){
        console.log(e);
        return null;
    }
    return null;
}

wss.on('connection',function connection(ws,request){
    // console.log("hi");
    const url=request.url;
    if(!url){
        return;
    }
    // console.log("url found " + url);
    const queryParams=new URLSearchParams(url.split('?')[1]);
    // console.log(queryParams);
    // console.log();
    const token=queryParams.get('token') ?? "";
    // console.log(token);
    // console.log();
    const userId=checkUser(token);
    // console.log(userId);
    // console.log("passed");
    if(userId==null){
        ws.close();
        return null;
    }
    //constrol reached here,we have access to userId 
    //store user in global arry
    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on('message',async function message(data){
        //type check for data
        let parsedData;
        if(typeof data!=="string"){
            parsedData=JSON.parse(data.toString());
        }else{
            parsedData=JSON.parse(data);
        }
        
        
        //if message is join room find the user in global user array and to that rooms [] push room id
        if(parsedData.type==="join_room"){
            const user=users.find(x=>x.ws===ws);
            // if(!user){
            //     return;
            // }
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type==="leave_room"){
            const user=users.find(x=>x.ws===ws);
            if(!user){
                return;
            }
            //removing specific room id from room array
            user.rooms=user?.rooms.filter(x=>x===parsedData.room);
        }

        if(parsedData.type==="chat"){
            const roomId=parsedData.roomId;
            const message=parsedData.message;

            await prismaClient.chat.create({
                data:{
                    roomId:Number(roomId),
                    message,
                    userId
                }
            });

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message,
                        roomId
                    }))
                }
            })
            
        }

    });
});