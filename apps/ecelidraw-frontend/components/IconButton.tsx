import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { ReactNode } from "react";

export function IconButton({
    icon,
    onClick,
    activated
}:{
    icon:ReactNode,
    onClick:()=>void,
    activated:boolean
}){
    return <div className={`m-2 cursor-pointer rounded-full border p-2 bg-black hover:bg-gray-800 text-white ${activated ? "text-red":"text-white"}`} onClick={onClick}>
        {icon}
    </div>
}