// import nodemailer from "nodemailer";

// // Priority: SendGrid (SENDGRID_API_KEY) agar set hai to wahi use hota hai — zyada reliable
// // deliverability deta hai. Nahi to Gmail (EMAIL_USER/EMAIL_PASS) par fallback hota hai.
// // Dono me se kuch bhi set na ho to null — server crash nahi hoga, email sirf skip ho jaayegi
// // aur query phir bhi DB me save ho jaayegi.
// export const getMailer = () => {
//   const { SENDGRID_API_KEY, EMAIL_USER_SAND, EMAIL_USER, EMAIL_PASS } = process.env;

//   if (SENDGRID_API_KEY) {
//     // SendGrid SMTP relay — username hamesha literally "apikey" hota hai, password aapki API key
//     const transporter = nodemailer.createTransport({
//       host: "smtp.sendgrid.net",
//       port: 587,
//       auth: { user: "apikey", pass: SENDGRID_API_KEY },
//     });
//     // "from" address SendGrid me verified Single Sender hona chahiye, warna email bounce hoga
//     const from = EMAIL_USER_SAND || EMAIL_USER;
//     return from ? { transporter, from } : null;
//   }

//   if (EMAIL_USER && EMAIL_PASS) {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: { user: EMAIL_USER, pass: EMAIL_PASS },
//     });
//     return { transporter, from: EMAIL_USER };
//   }

//   return null;
// };


import nodemailer from "nodemailer";

export const getMailer = () => {
  const {
    SENDGRID_API_KEY,
    EMAIL_USER_SAND,
    EMAIL_USER,
    EMAIL_PASS,
  } = process.env;

  console.log("Mailer configuration:", {
    sendgridConfigured: Boolean(SENDGRID_API_KEY),
    sendgridSender: EMAIL_USER_SAND || null,
    gmailConfigured: Boolean(EMAIL_USER && EMAIL_PASS),
  });

  if (SENDGRID_API_KEY) {
    const from = EMAIL_USER_SAND || EMAIL_USER;

    if (!from) {
      console.error(
        "SendGrid API key exists, but EMAIL_USER_SAND or EMAIL_USER is missing"
      );
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: SENDGRID_API_KEY,
      },
    });

    return {
      transporter,
      from,
    };
  }

  if (EMAIL_USER && EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    return {
      transporter,
      from: EMAIL_USER,
    };
  }

  console.error(
    "No email provider configured. Add SendGrid or Gmail variables."
  );

  return null;
};