import { getCollection } from "../config/db.js";
import { encryptData, decryptData } from "../utils/crypto.js";

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

    const updatedPassword = req.body;
    
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