const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html, attachments = []) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS?.replace(/\s/g, '') // Remove any spaces
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
            attachments
        };

        console.log(`Sending email to: ${to} | Subject: ${subject}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('❌ Nodemailer Error:', error);
        throw error; // Rethrow to handle in the route
    }
};

module.exports = sendEmail;
