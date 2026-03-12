import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";

export async function register(req, res) {
    try {

        const { username, email, password } = req.body;

        const users = getCollection("users");

        const existingUser = await users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
            username,
            email,
            password: hashedPassword
        });

        res.json({
            message: "User registered successfully",
            result
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: "Server Error"});
    }
}

export async function login(req,res) {
    try {
        
        const {email, password} = req.body;

        const users = getCollection("users");

        const user = await users.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User Not Found"
            });
        }

        const match = await bcrypt.compare(password,user.password)

        if(!match){
            return res.status(400).json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({
            message: "Login Successful",
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
}