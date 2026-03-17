import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { getAllUsers,deleteUser, promoteUser, createUser } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users",authenticate,isAdmin,getAllUsers);
router.delete("/users/:id",authenticate,isAdmin,deleteUser);
router.put("/promote/:id",authenticate,isAdmin,promoteUser);
router.post("/create-user",authenticate,isAdmin,createUser);

export default router;