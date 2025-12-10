// Email service using Nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const templates = {
    welcome: (name) => ({
        subject: 'Welcome to Sho8la!',
        html: `<h2>Welcome, ${name}!</h2><p>Your account has been created successfully. Start exploring opportunities now!</p>`
    }),

    proposalReceived: (jobTitle, freelancerName) => ({
        subject: `New Proposal for "${jobTitle}"`,
        html: `<h2>New Proposal Received</h2><p><strong>${freelancerName}</strong> submitted a proposal for your job: <strong>${jobTitle}</strong></p>`
    }),

    proposalAccepted: (jobTitle, clientName) => ({
        subject: `Your Proposal was Accepted!`,
        html: `<h2>Congratulations!</h2><p><strong>${clientName}</strong> accepted your proposal for <strong>${jobTitle}</strong>. Get started!</p>`
    }),

    paymentReceived: (amount, jobTitle) => ({
        subject: `Payment Received: ${amount} EGP`,
        html: `<h2>Payment Received</h2><p>You received <strong>${amount} EGP</strong> for <strong>${jobTitle}</strong>. Funds added to your wallet.</p>`
    }),

    verificationApproved: (name) => ({
        subject: 'Verification Approved',
        html: `<h2>You're Verified!</h2><p>Congratulations ${name}, your student ID has been verified. Enjoy full access!</p>`
    })
};

const sendEmail = async (to, template, ...args) => {
    if (!process.env.SMTP_USER) {
        console.log(`[Email] Would send "${template}" to ${to}`);
        return { sent: false, reason: 'SMTP not configured' };
    }

    try {
        const { subject, html } = templates[template](...args);
        await transporter.sendMail({
            from: `"Sho8la" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`[Email] Sent "${template}" to ${to}`);
        return { sent: true };
    } catch (error) {
        console.error(`[Email] Failed:`, error.message);
        return { sent: false, error: error.message };
    }
};

module.exports = { sendEmail, templates };
