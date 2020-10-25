const nodemailer = require("nodemailer");
const { emailAccount } = require("./../config/credentials");
exports.sendEmailNotification = async (
  judul,
  emailTujuan,
  deskripsi,
  link = "localhost:3000/login"
) => {
  const configMail = {
    service: "gmail",
    auth: {
      user: emailAccount.user,
      pass: emailAccount.pass,
    },
  };

  const transporter = await nodemailer.createTransport(configMail);
  const mail = {
    to: emailTujuan,
    from: "testing.feb.psik@gmail.com",
    subject: judul,
    html: deskripsi,
  };
  transporter.sendMail(mail);
};
