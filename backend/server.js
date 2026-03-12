import express from "express";
import cors from "cors";
import passwordRoutes from "./routes/passwordRoutes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoute.js"
import { authenticate } from "./middleware/authMiddleware.js";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

await connectDB();

app.use("/", passwordRoutes);
app.use("/api/auth",authRoutes)
app.get("/middleware", authenticate, (req,res)=>{
    res.json({message:"Middleware working", userId:req.userId});
});

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});