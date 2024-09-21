const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
const jsonwebtoken = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const io = require('socket.io');



const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql2.createPool({
    host: 'database-2.c36uq00ykdig.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Pavan903222',
    database: 'user',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    pool.query('SELECT * FROM login WHERE email = ? AND password = ?', [email, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (result.length > 0) {
            const token = jsonwebtoken.sign({ email}, 'secret_key');
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });

        }
    });
});


app.post('/register', (req, res) => {
    const { name, age, email, password } = req.body;
    pool.query('INSERT INTO login (name,age, email, password) VALUES (?, ?, ?,?)', [name, age,email, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });


        } else {
            res.json({ message: 'User registered successfully' });


        }
        
    });
})


app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    pool.query('SELECT * FROM login WHERE email = ?', [email], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (result.length > 0) {
            const token = jsonwebtoken.sign({ email }, 'secret_key', { expiresIn: '1h' });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host:'smtp.gmail.com',
                port: 587,
                secure: false,

                auth: {
                    user: 'polisettymadhupavan1@gmail.com',
                    pass: 'ogzufytchmvdgdhu'
                }
            });
            const mailOptions = {
                from: 'polisettymadhupavan1@gmail.com',
                to: email,
                subject: 'Reset Password',
                html: `
                    <p>Click the following link to reset your password:</p>
                    <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
                `
                
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json({ message: 'Password reset link sent to your email' });
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid email' });
        }
    });
});

app.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const decoded = jsonwebtoken.verify(token, 'secret_key');
        pool.query('UPDATE login SET password = ? WHERE email = ?', [password, decoded.email], (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json({ message: 'Password reset successfully' });
            }
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
})


















































app.listen(5000, () => {
    console.log('Server is running on port 5000');
});


