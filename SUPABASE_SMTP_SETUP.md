# Supabase SMTP Configuration Guide

To enable custom email sending (and avoid rate limits), apply these settings in your **Supabase Dashboard**:

### Steps:
1. Go to **Authentication** -> **Settings**.
2. Scroll to **SMTP Settings**.
3. Enable **Enable Custom SMTP**.
4. Fill in the following details:

| Field | Value |
|-------|-------|
| **SMTP Host** | `smtp.gmail.com` |
| **Port** | `587` |
| **User** | `yourgmail@gmail.com` |
| **Pass** | `<the 16-character app password Google gave>` |
| **Sender Email** | `yourgmail@gmail.com` |
| **Sender Name** | `SanctionX` |

### Important Notes:
- **App Password**: You MUST use a Google **App Password**, not your regular Gmail password. 
- **Rate Limits**: Once SMTP is enabled, the Supabase "Email rate exceeded" error will be managed by your Gmail account's limits instead of Supabase's default limits.
