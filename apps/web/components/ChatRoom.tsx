import axios from "axios"
import { BACKEND_URL } from "../app/config"
import { ChatRoomClient } from "./ChatRoomClient";

//given all this we should render the chat room 
async function getChats(roomId:string){
    const response=await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return response.data.messages;//messages return by the path in http-backend
}

//get all chats 
export async function ChatRoom({id}:{
    id:string
}) {
    const messages=await getChats(id);
    console.log(messages);
    return <ChatRoomClient id={id} messages={messages}/>
}