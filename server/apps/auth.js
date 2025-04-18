import { Router } from "express";
import { client,db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
const authRouter = Router();
const collection = db.collection("users");
// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register",async (req,res)=>{
    const {username,password,firstName,lastName} = req.body
    const user = {username,password,firstName,lastName}
    try{
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt)
    
    await collection.insertOne(user);
    return res.status(200).json({message:"User has been create successfully"})
    }catch(e){return res.status(500).json({message:e})}
})

authRouter.post("/login",async(req,res)=>{
    const {username,password} = req.body
    const user ={username,password}
    
    try{
    const data = await collection.findOne({username:user.username})
    if(!data){return res.status(401).json({message: "Invalid username or password",})}

    const isPassword = await bcrypt.compare(user.password,data.password)
    if(!isPassword){return res.status(401).json({message: "Invalid username or password",})}
    console.log("1----------------------------------------------------------")
    const token = jwt.sign(
        { id: data._id, firstName: data.firstName, lastName: data.lastName },
        process.env.SECRET_KEY,
        {expiresIn:"4h"}
    )
    console.log("2----------------------------------------------------------")
    return res.status(200).json({ message: "Login successful",token,})
    }catch(e){return res.status(500).json({message:"🛑"+e})}
})

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้


await client.close();
export default authRouter;
