const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sy12294@gmail.com",
        pass: "nimmihoney1"
    }
});

// let transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//         type: 'OAuth2',
//         user: 'user@example.com',
//         accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x'
//     }
// });

var mailOption = {
    from: "sy12294@gmail.com",
    to: "sunil120295@gmail.com",
    subbject: "Testing NodeMailer",
    text: "Hey Buddy"
}

transport.sendMail(mailOption, (err, info) => {
    if (err) console.log("Error " + err);
    else {
        console.log(info);
    }
})