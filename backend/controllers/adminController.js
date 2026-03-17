import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export async function createUser(req, res) {

    const { email, password, username } = req.body;

    const usersCollection = getCollection("users");

    // check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        username,
        email,
        password: hashedPassword,
        role: "user",
        twoFactorEnabled: true,
        twoFactorCode: null,
        twoFactorExpire: null
    };

    const result = await usersCollection.insertOne(user);

    res.json({
        message: "User created successfully",
        result
    });

}

export async function getAllUsers(req, res) {

    const users = await getCollection("users").find({}).project({ password: 0 }).toArray();

    console.log(users);
    res.json(users);
}

export async function deleteUser(req, res) {

    const userId = req.params.id;

    // 1️⃣ Admin cannot delete themselves
    if (req.userId.toString() === userId) {
        return res.status(400).json({
            message: "Admin cannot delete their own account"
        });
    }

    const usersCollection = getCollection("users");

    // 2️⃣ Check if target user exists
    const user = await usersCollection.findOne({
        _id: new ObjectId(userId)
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // 3️⃣ Admin cannot delete another admin
    if (user.role === "admin") {
        return res.status(403).json({
            message: "Admin cannot delete another admin"
        });
    }

    // 4️⃣ Delete user
    await usersCollection.deleteOne({
        _id: new ObjectId(userId)
    });

    // 5️⃣ Delete all passwords of that user
    await getCollection("passwords").deleteMany({
        userId: userId
    });

    res.json({
        message: "User and Passwords Deleted"
    });
}

export async function promoteUser(req, res) {

    const userId = req.params.id;

    // 1️⃣ Admin cannot delete themselves
    if (req.userId.toString() === userId) {
        return res.status(400).json({
            message: "You Cannot promote yourself"
        });
    }

    const usersCollection = getCollection("users");

    // 2️⃣ Check if target user exists
    const user = await usersCollection.findOne({
        _id: new ObjectId(userId)
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // 3️⃣ Admin cannot delete another admin
    if (user.role === "admin") {
        return res.status(403).json({
            message: "Already an admin"
        });
    }


    const result = await getCollection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role: "admin" } }
    );

    res.json({
        message: "User promoted to admin",
        result
    });
}