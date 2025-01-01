const express = require('express');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const PORT = process.env.PORT || 3000;


const generateTemplate = (name, number, message) => {
    return `
        <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
            color: #4CAF50;
        }
        .email-content {
            line-height: 1.6;
        }
        .email-content p {
            margin: 10px 0;
        }
        .email-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            New Contact Us Submission
        </div>
        <div class="email-content">
            <p><strong>Full Name:</strong> ${name}</p>
            <p><strong>Mobile Number:</strong> ${number}</p>
            <p><strong>Message:</strong>${message}</p>
        </div>
        <div class="email-footer">
            <p>This email was generated from the Contact Us form on your website.</p>
        </div>
    </div>
</body>
</html>

    `
}


app.get("/", (req, res) => {
    res.send("hello there")
})
app.post('/api/send-email', async (req, res, next) => {

    const { name, number, message, email, subject } = req.body;

    // Validation function
    const validateContactForm = ({ name, number, message, email, subject }) => {
        const errors = [];

        // Validate name
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long.');
        }

        // Validate mobile number (example: only digits and 10-15 characters long)
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!number || !phoneRegex.test(number)) {
            errors.push('Invalid mobile number. It should be 10-15 digits long.');
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Invalid email address.');
        }

        // Validate subject
        if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
            errors.push('Subject must be at least 3 characters long.');
        }

        // Validate message
        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long.');
        }

        return errors;
    };

    // Perform validation
    const errors = validateContactForm({ name, number, message, email, subject });

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    try {
        const options = {
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        };


        const htmlTemplate = generateTemplate(name, number, message)

        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject: subject,
            html: htmlTemplate,
        };

        const transporter = nodemailer.createTransport(options);
        const info = await transporter.sendMail(mailOptions);


        res.status(200).json({ status: true, message: "mail sent." })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
})


app.listen(PORT, () =>
    console.log('server running on http://localhost:' + PORT)
);
