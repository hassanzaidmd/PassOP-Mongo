import { getCollection } from "../config/db.js";
import { encryptData, decryptData } from "../utils/crypto.js";

export async function getPasswords(req,res){
    const collection = getCollection("passwords");

    const findResult = await collection.find({}).toArray();

    findResult.forEach(element=>{
        element.password = decryptData(element.password);
    });

    res.json(findResult);
}

export async function addPassword(req,res){
    const collection = getCollection("passwords");

    const password = req.body;

    password.password = encryptData(password.password);

    const result = await collection.insertOne(password);

    res.json({
        message:"Password Saved",
        result
    });
}

export async function deletePassword(req,res){
    const collection = getCollection("passwords");

    const id = req.params.id;

    const result = await collection.deleteOne({id});

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

    delete updatedPassword._id;

    const result = await collection.updateOne(
        {id},
        {$set:updatedPassword}
    );

    res.json({
        message:"Password Updated",
        result
    });
}   