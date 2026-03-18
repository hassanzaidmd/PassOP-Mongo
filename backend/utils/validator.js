import { toast } from "react-toastify";

export const validate = (fields) => {
    for( const key in fields){
        const value = fields[key];

        if(!value){
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            toast.error(`${capitalizedKey} is required.`);
            return false;
        }

        if(key === "email"){
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(value)){
                toast.error("Invalild Email Format");
                return false;
            }
        }
        
        if(key === "password"){
            if( value.length < 6 ){
                toast.error(" Password must be 6 characters minimum");
                return false;
            }
        }
        
        if(value.length < 3){
            toast.error(`${key} must atleat be 3 characters`);
            return false;
        }
    }

    return true
};