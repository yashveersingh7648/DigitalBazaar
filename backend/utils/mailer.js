import nodemailer from "nodemailer";

// EMAIL_USER/EMAIL_PASS set na ho to null return karta hai — server crash nahi hoga,
// sirf email jaana skip ho jaayega aur message phir bhi DB me save ho jaayega.
export const getTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
};
