import express from "express";
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import cors from "cors";
import CryptoJS from "crypto-js";

// Connection URL
const url = process.env.MONGO_URI;
const key = process.env.SECRET_KEY;
const client = new MongoClient(url);

// Database Name
const dbName = 'PassOP';

const app = express();
const port = 4000;

await client.connect();
const db = client.db(dbName);
const collection = db.collection('passwords');

app.use(express.json())
app.use(cors())


function encryptData(data, key) {
    const ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
}

function decryptData(ciphertext, key) {
    const data = CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
    return data
}


app.get("/", async (req, res) => {
    const findResult = await collection.find({}).toArray();
    findResult.forEach(element => {
        let ciphertext = element.password;
        let data = decryptData(ciphertext,key)
        element.password = data;
    });
    res.json(findResult)
})

app.post("/", async (req, res) => {
    const password = req.body;
    let data = password.password;
    let ciphertext = encryptData(data, key)
    password.password = ciphertext;
    const result = await collection.insertOne(password);
    res.json({
        message: "Password Saved",
        password,
        result
    })
})

app.delete("/:id", async (req, res) => {
    const id = req.params.id;

    const result = await collection.deleteOne({
        id: id
    });

    res.json({
        message: "Password Deleted",
        result
    });
});

app.put("/:id", async (req,res) => {
    const id =req.params.id;
    const updatedPassword = req.body;

    let ciphertext = encryptData(updatedPassword.password,key);
    updatedPassword.password =ciphertext;

    delete updatedPassword._id;

    const result = await collection.updateOne(
        {id:id},
        {$set:updatedPassword}
    );

    res.json({
        message: "Password Updated",
        result
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})