import CryptoJS from "crypto-js";
import 'dotenv/config';

const key = process.env.SECRET_KEY;

export function encryptData(data){
    return CryptoJS.AES.encrypt(data, key).toString();
}

export function decryptData(ciphertext){
    return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}