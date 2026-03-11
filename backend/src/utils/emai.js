import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
}

const sendEmail = async (to, subject, text) => {
    await getTransporter().sendMail({
        from: `"Mange Wallet" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    });
};

const sendHTMLEmail = async (to, subject, html) => {
    await getTransporter().sendMail({
        from: `"Mange Wallet" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

export { sendEmail, sendHTMLEmail };
