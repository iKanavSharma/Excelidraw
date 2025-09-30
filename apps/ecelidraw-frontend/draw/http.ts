import { HTTP_BACKEND } from "@/config";
import axios from "axios";


export async function getExistingShapes(roomId:string){
    const res=await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    //array of messages is array of shapes
    const messages=res.data.messages;
    //iterating over messages to regnerate data
    const shapes=messages.map((x:{message:string})=>{
        const messageData=JSON.parse(x.message);
        return messageData.shape;
    })
    return shapes;
}