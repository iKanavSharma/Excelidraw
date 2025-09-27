import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types";
import {prismaClient} from "@repo/db/client"

const app=express();

app.use(express.json());

app.post("/signup", async (req,res)=>{
    const parsedData=CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect inputs"
        })
        return;
    }

    try{
        const user=await prismaClient.user.create({
            data:{
                email:parsedData.data.userName,
                password:parsedData.data.password,
                name:parsedData.data.name
            }
        })
        //db call
        res.json({
            userId:user.id
        })
    }catch(e){
        res.status(411).json({
            message:"User already exist with this username"
        })
    }
   
    
})

app.post("/signin", async (req,res)=>{

    const parsedData=SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect Input"
        })
        return;
    }

    const user=await prismaClient.user.findFirst({

        where:{
            email:parsedData.data.userName,
            password:parsedData.data.password
        }

    })

    if(!user){
        res.json({
            message:"Not authorisied"
        })
        return;
    }

    const token=jwt.sign({
        userId:user?.id
    },JWT_SECRET);

    res.json({
        token
    })

})

app.post("/room",middleware,async (req,res)=>{

    const parsedData=CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect inputs"
        })
        return;
    }
    //@ts-ignore TODO:global type
    const userId=req.userId;

    try{
        const room=await prismaClient.room.create({
        data:{
            slug:parsedData.data.name,
            adminId:userId
        }
        })
        //db call
        res.json({
            roomId:room.id
        })
    }catch(e){
        res.status(411).json({
            message:"Room already exists with this name"
        })
    }
    
})

app.get("/chats/:roomId",async (req,res)=>{
    try{
        const roomId=Number(req.params.roomId);
        const messages=await prismaClient.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id:"desc"
            },
            take:50
        });
        res.json({
            messages
        })
    }catch(e){
        console.log(e);
        res.json({
            messages:[]
        })
    }
})

app.get("/room/:slug",async (req,res)=>{
    const slug=req.params.slug;
    const room=await prismaClient.room.findFirst({
        where:{
            slug
        }
    });
    res.json([
        room
    ])
})

console.log("Listening on 3001");

app.listen(3001);