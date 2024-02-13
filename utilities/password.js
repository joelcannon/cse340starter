// A common and secure system for recovering a lost password involves the following steps:

// Request Password Reset: The user enters their email address. The system checks if the email address exists in the database.

// Generate Reset Token: If the email exists, the system generates a unique password reset token. This token is typically a random string or a JWT. The token is then stored in the database along with an expiration time (usually 1 hour).

// Send Reset Email: The system sends an email to the user's email address. This email contains a link to the password reset page. The link includes the password reset token as a query parameter.

// Enter New Password: The user clicks the link in the email, which takes them to the password reset page. The page checks if the token is valid and has not expired. If the token is valid, the user is prompted to enter a new password.

// Update Password: Once the user enters a new password, the system hashes the password and updates the user's password in the database. The password reset token is then invalidated.

// Here's a simplified example of how you might implement this in an Express.js app:

// Request password reset
app.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(400).send("Email not found");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send reset email
  const resetUrl = `http://${req.headers.host}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(email, resetUrl);

  res.send("Password reset email sent");
});

// Enter new password
app.get("/reset-password", async (req, res) => {
  const { token } = req.query;
  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).send("Invalid or expired token");
  }

  // Render password reset form
  res.render("reset-password", { token });
});

// Update password
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).send("Invalid or expired token");
  }

  // Update password and clear reset token
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.send("Password updated successfully");
});

// In this example, the request-password-reset route generates a password reset token and sends a password reset email. The reset-password GET route displays a form where the user can enter a new password. The reset-password POST route updates the user's password and clears the reset token.

const nodemailer = require("nodemailer");

async function sendPasswordResetEmail(email, resetUrl) {
  // Create a transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Set up email data
  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
}

// In this example, Nodemailer is used to send the email. The createTransport function is used to create a transporter object using Gmail as the service. The sendMail function is used to send the email. The email includes a link to the password reset page, which includes the password reset token as a query parameter.

// Please replace process.env.EMAIL_USERNAME and process.env.EMAIL_PASSWORD with your actual Gmail username and password, or use environment variables to store these values securely. Note that if you're using Gmail, you might need to enable "Less secure apps" in your Google account settings to allow Nodemailer to send emails.
