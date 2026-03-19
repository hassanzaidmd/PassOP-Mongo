import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: `"PassOp <${process.env.EMAIL}>"`,
            to,
            subject,
            html
        });

        console.log("Email Sent : ", info.response)
    }
    catch(error){
        console.log("Email Error : ",error);
    }
}