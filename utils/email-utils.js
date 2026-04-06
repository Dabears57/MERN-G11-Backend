const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendEmail(to, from, subject, text, html){
    // const msg = {
    //   to: 'test@gmail.com', // Change to your recipient
    //   from: 'from@{domain-name}', // Change to your verified sender
    //   subject: 'Sending with SendGrid is Fun',
    //   text: 'and easy to do anywhere, even with Node.js',
    //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    // }
    await sgMail.send(msg); 
}

function userSendAccountVerificationEmail(toEmail, verifyLink) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Account - TimeTrack</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <tr>
            <td style="background-color:#2563eb; color:#ffffff; padding:20px; text-align:center; font-size:24px; font-weight:bold;">
              TimeTrack
            </td>
          </tr>

          <tr>
            <td style="padding:30px; color:#333333;">
              
              <h2 style="margin-top:0;">Verify Your Account</h2>
              
              <p>
                Thanks for signing up for <strong>TimeTrack</strong>!  
                Please confirm your email address to activate your account.
              </p>

              <p style="text-align:center; margin:30px 0;">
                <a href="${verifyLink}" 
                   style="background-color:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
                  Verify Email
                </a>
              </p>

              <p>
                If the button above doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="word-break:break-all; color:#2563eb;">
                ${verifyLink}
              </p>

              <p>
                If you didn’t create this account, you can safely ignore this email.
              </p>

              <p style="margin-top:30px;">
                — The TimeTrack Team
              </p>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#888888;">
              © 2026 TimeTrack. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  const fromEmail = process.env.ACCOUNTS_FROM_EMAIL;
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: 'Verify your TimeTrack account',
    html: html
  };

  return sgMail.send(msg);
}

function userSendPasswordResetEmail(toEmail, resetLink) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password - TimeTrack</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#dc2626; color:#ffffff; padding:20px; text-align:center; font-size:24px; font-weight:bold;">
              TimeTrack
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              
              <h2 style="margin-top:0;">Reset Your Password</h2>
              
              <p>
                We received a request to reset your <strong>TimeTrack</strong> password.
              </p>

              <p style="text-align:center; margin:30px 0;">
                <a href="${resetLink}" 
                   style="background-color:#dc2626; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
                  Reset Password
                </a>
              </p>

              <p>
                If the button above doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="word-break:break-all; color:#dc2626;">
                ${resetLink}
              </p>

              <p>
                This link will expire shortly for security reasons.
              </p>

              <p>
                If you didn’t request a password reset, you can safely ignore this email.
              </p>

              <p style="margin-top:30px;">
                — The TimeTrack Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#888888;">
              © 2026 TimeTrack. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  const fromEmail = process.env.ACCOUNTS_FROM_EMAIL;
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: 'Reset your TimeTrack password',
    html: html
  };

  return sgMail.send(msg);
}

module.exports = {
    sendEmail,
    userSendAccountVerificationEmail,
    userSendPasswordResetEmail
}