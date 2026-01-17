const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, userName, amount) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Uses the .env value
            pass: process.env.EMAIL_PASS  // Uses the .env value
        }
    });

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Donation Receipt</h1>
            </div>
            <div style="padding: 30px; background-color: white;">
                <h2 style="color: #1e293b; margin-top: 0;">Hello ${userName},</h2>
                <p style="color: #475569; line-height: 1.6;">Thank you for your incredible support! We have successfully received your donation. Your contribution plays a vital role in our mission.</p>
                
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px dashed #cbd5e1;">
                    <p style="margin: 5px 0; color: #64748b; font-size: 14px;">Amount Contributed</p>
                    <p style="margin: 0; color: #059669; font-size: 32px; font-weight: bold;">₹${amount}</p>
                </div>

                <p style="color: #475569; font-size: 14px;">You can now download your 80G tax-exempt certificate from your dashboard.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600;">Visit Dashboard</a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                © 2026 NGO Fundraiser System | NSS IIT Roorkee Initiative
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"NGO Fundraiser" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
    });
};

module.exports = sendEmail;