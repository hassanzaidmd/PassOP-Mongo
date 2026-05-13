import express from "express";
import cors from "cors";
import passwordRoutes from "./routes/passwordRoutes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoute.js"
import { authenticate } from "./middleware/authMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js"

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:4173"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  }
};

app.use(express.json());
app.use(cors(corsOptions));

await connectDB();

app.use("/", passwordRoutes);
app.use("/api/auth",authRoutes);
app.use("/admin",adminRoutes);
app.get("/middleware", authenticate, (req,res)=>{
    res.json({message:"Middleware working", userId:req.userId});
});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});
