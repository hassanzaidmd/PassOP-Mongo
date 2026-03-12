import express from "express";
import {
    getPasswords,
    addPassword,
    deletePassword,
    updatePassword
} from "../controllers/passwordController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",authenticate, getPasswords);
router.post("/",authenticate, addPassword);
router.delete("/:id",authenticate, deletePassword);
router.put("/:id",authenticate, updatePassword);

export default router;