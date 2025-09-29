# Email API (Vercel Serverless)

Deploy this folder as a separate Vercel project. It exposes `/api/send-email` to send emails via SMTP.

## Deploy
1. New Vercel Project → Root Directory: `email-api`
2. No build step required
3. Environment Variables:
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_SECURE=false
   - SMTP_USER=your-smtp-user
   - SMTP_PASS=your-smtp-pass-or-app-password
   - SMTP_FROM=Your App <no-reply@yourdomain.com>
   - EMAIL_FUNCTION_SECRET=optional-shared-secret
4. Deploy → Function URL: `https://<email-api-domain>/api/send-email`

## Integrate with Backend (Render)
- VERCEL_EMAIL_ENDPOINT=https://<email-api-domain>/api/send-email
- EMAIL_FUNCTION_SECRET (if set above) with the same value

## Test
```
curl -X POST https://<email-api-domain>/api/send-email \
  -H "Content-Type: application/json" \
  -H "X-Email-Secret: <your-secret>" \
  -d '{"to":"you@example.com","subject":"Test","text":"Hello"}'
```
