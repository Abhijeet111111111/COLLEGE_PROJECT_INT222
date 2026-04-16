import nodeMailer from 'nodemailer'
export const sendMail = async options => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: 'Aj <aj@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    }
    await transporter.sendMail(mailOptions);
}

