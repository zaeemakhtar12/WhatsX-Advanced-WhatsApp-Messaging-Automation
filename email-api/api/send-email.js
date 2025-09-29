const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method Not Allowed' });
	}

	const expectedSecret = process.env.EMAIL_FUNCTION_SECRET;
	if (expectedSecret) {
		const provided = req.headers['x-email-secret'];
		if (!provided || provided !== expectedSecret) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
	}

	const {
		SMTP_HOST = 'smtp.gmail.com',
		SMTP_PORT = '587',
		SMTP_SECURE = 'false',
		SMTP_USER,
		SMTP_PASS,
		SMTP_FROM
	} = process.env;

	const { to, subject, text, html } = req.body || {};

	if (!to || !subject || (!text && !html)) {
		return res.status(400).json({ error: 'Missing required fields: to, subject, text|html' });
	}

	try {
		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: Number(SMTP_PORT),
			secure: false,
			auth: { user: SMTP_USER, pass: SMTP_PASS },
			connectionTimeout: 60_000,
			greetingTimeout: 30_000,
			socketTimeout: 60_000,
			pool: true,
			maxConnections: 1,
			maxMessages: 3,
			tls: { rejectUnauthorized: false }
		});

		await transporter.verify();

		const info = await transporter.sendMail({
			from: SMTP_FROM,
			to,
			subject,
			text,
			html
		});

		return res.status(200).json({ messageId: info.messageId });
	} catch (error) {
		console.error('Serverless email error:', error);
		return res.status(500).json({ error: error.message });
	}
};


