import nodeMailer from 'nodemailer'
const sendMail = async options => {
    const transporter = nodeMailer.createTransport({
        host: process.env.EMAILHOST,
        port: process.env.EMAILPORT,
        auth: {
            user: process.env.EMAILUSER,
            pass: process.env.EMAILPASSWORD
        }
    })

    const mailOptions = {
        from: 'Aj <aj@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOptions);
}

module.exports = sendMail