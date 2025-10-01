import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

export function middleware(req:Request,res:Response,next:NextFunction){
    console.log("hi");
    const token=req.headers["authorization"] ?? "";
    console.log(token);
    const decoded=jwt.verify(token,JWT_SECRET);
    console.log(decoded)
    //add global types
    if(decoded){
        //@ts-ignore
        req.userId=decoded.userId;
        //@ts-ignore
        console.log(req.userId);
        next();
    }else{
        res.status(403).json({
            message:"Unauthorized"
        })
    }
}