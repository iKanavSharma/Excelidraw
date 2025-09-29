import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoomId(slug:string){
    const response=await axios.get(`${BACKEND_URL}/room/${slug}`);
    console.log(response.data);
    
    console.log(response.data.id);
    //console.log(response.data.room);
    return response.data.id;//id retured by the path room chat
}


//slug->room name
export default async function({
    params
}: {
    params:{
        slug:string
    }
}){
    console.log(params);
    const slug=(await params).slug;
    console.log(slug);
    const roomId=await getRoomId(slug);
    console.log(roomId);
    //acess to chat romm
    // return <ChatRoom id={roomId}></ChatRoom> 
    return <div>
        
        </div>
}