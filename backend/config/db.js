import { MongoClient } from "mongodb";
import 'dotenv/config';

const client = new MongoClient(process.env.MONGO_URI);

let db;

export async function connectDB(){
    await client.connect();
    db = client.db("PassOP");
    console.log("MongoDB Connected");
}

export function getCollection(name){
    return db.collection(name);
}