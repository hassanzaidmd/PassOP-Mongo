import { getCollection } from "../config/db.js";
import { encryptData, decryptData } from "../utils/crypto.js";
import { validatePasswordPayload } from "../utils/validation.js";

export async function getPasswords(req,res){
    const collection = getCollection("passwords");

    const findResult = await collection.find({userId: req.userId}).toArray();

    findResult.forEach(element=>{
        element.password = decryptData(element.password);
    });

    res.json(findResult);
}

export async function addPassword(req,res){
    const collection = getCollection("passwords");
    const password = req.body;
    const validationError = validatePasswordPayload(password);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    password.userId = req.userId;

    password.password = encryptData(password.password);

    const result = await collection.insertOne(password);

    res.json({
        message:"Password Saved",
        result
    });
}

export async function deletePassword(req,res){
    const collection = getCollection("passwords");
    console.log(collection)

    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Password id is required" });
    }
    console.log(id)

    const result = await collection.deleteOne({
        id,
        userId: req.userId
    });

    res.json({
        message:"Password Deleted",
        result
    });
}

export async function updatePassword(req,res){
    const collection = getCollection("passwords");

    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Password id is required" });
    }

    const updatedPassword = req.body;
    const validationError = validatePasswordPayload(updatedPassword);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }
    
    updatedPassword.password = encryptData(updatedPassword.password);
    console.log(updatedPassword)
    
    delete updatedPassword._id;
    delete updatedPassword.id;
    delete updatedPassword.userId;
    console.log(updatedPassword)

    const result = await collection.updateOne(
        {
            id,
            userId: req.userId
        },
        {$set:updatedPassword}
    );

    res.json({
        message:"Password Updated",
        result
    });
}   
