# Contact Form Setup for Anexis Labs

This project now includes a static contact form at the bottom of `anexis-labs (3).html`.
The form sends email directly using EmailJS and keeps the visitor on your site.

## How it works

- The form now submits using EmailJS from the browser.
- EmailJS is loaded dynamically and initialized with your account values.
- The contact form includes an inline "I am not a robot" checkbox that is validated before sending.
- The submit button is initially disabled with "Loading..." text until EmailJS loads.
- On successful send, visitors are redirected to `thank-you.html`.
- If EmailJS fails to load within 10 seconds, the button shows "Service unavailable".
- Hidden fields are kept for anti-spam and form subject metadata.

## Important setup

You must replace these placeholders in `anexis-labs (3).html`:

- `YOUR_EMAILJS_USER_ID`
- `YOUR_SERVICE_ID`
- `YOUR_TEMPLATE_ID`

Without those values, the form will not send.

## How to get your EmailJS IDs

1. **Go to https://www.emailjs.com** and sign up or log in
2. **Get your User ID**: In the dashboard, go to "Account" → "General" → copy the "Public Key" (this is your `YOUR_EMAILJS_USER_ID`)
3. **Create a Service**: Go to "Email Services" → "Add New Service" → choose Gmail → connect your Gmail account → copy the Service ID (this is your `YOUR_SERVICE_ID`)
4. **Create a Template**: Go to "Email Templates" → "Create New Template" → use these variables:
   - `{{from_name}}`
   - `{{from_email}}`
   - `{{company}}`
   - `{{message}}`
   - `{{form_subject}}`
   - Set "To Email" to `anandsullad77@gmail.com`
   - Copy the Template ID (this is your `YOUR_TEMPLATE_ID`)

## What to do next

The EmailJS integration is now configured with your account values:

- User ID: `ZlZKWVTs0eyeD0Dd_`
- Service ID: `service_5pvxu91`
- Template ID: `template_uifd6fn`

The "I am not a robot" checkbox is positioned just above the submit button.

1. Test the form by submitting a message.
7. Confirm delivery to `anandsullad77@gmail.com`.

## Customization

- To change the recipient address, update your EmailJS template configuration.
- To change the subject line, update the `form_subject` hidden value.
- To redirect to a different page after success, change the redirect URL in the JavaScript callback.

## Notes

- This solution works without a server-side backend.
- It is a client-side email send through EmailJS.
- The checkbox is a page-local verification step and is validated before sending.
- For better anti-spam protection, consider adding a backend verification layer or using a dedicated form provider with server-side captcha support.
