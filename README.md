# Assignment A — UPI Payment Flow

This project demonstrates the first part of the assignment: a static webpage that generates a UPI deep-link to initiate a payment.

**Hosted Project URL:** https://beamish-strudel-caaaa7.netlify.app/ 

---

## How to Test the Live Project

1.  **Open on Mobile:** Visit the Hosted Project URL on a mobile phone that has UPI apps (GPay, PhonePe, etc.) installed.
2.  **Click Pay:** Tap the "Pay ₹1.00 via UPI" button.
3.  **App Picker:** The phone's UPI app picker will open.
4.  **Complete Payment:** Select an app and complete the ₹1 payment.
5.  **Observe:** The user is redirected to the UPI app. The original webpage **has no way of knowing if the payment was successful**. This is the expected limitation of a client-side-only solution.

---

## Part 2: Mechanism for Payment Confirmation

As requested, this document explains the mechanism to confirm if a payment has gone through.

### The Core Limitation of a Static Webpage

A simple webpage (client-side HTML/JS) **cannot** confirm if a payment was successful on its own. For security reasons, the web browser has no access or visibility into what happens *inside* the user's native UPI app (GPay, PhonePe, etc.).

When the webpage redirects to the `upi://` link, its job is finished. It cannot receive a "success" or "failure" message back from the UPI app.

### The Correct Solution: A Backend with Webhooks

To build a reliable mechanism, a backend server is required. This system does not rely on the user's browser; it relies on **server-to-server** communication.

Here is the standard architecture to build this system:

1.  **User Clicks "Pay"**: The user clicks the payment button on the website.
2.  **Frontend Calls Backend**: The JavaScript (frontend) **does not** generate the UPI link. Instead, it sends a request to our own backend server (e.g., `POST /api/create-order`).
3.  **Backend Calls Payment Gateway**: Our server (e.g., using Node.js or Python) receives this request. It then securely calls the API of a payment gateway (like **Razorpay**, **PhonePe**, or **Paytm**) to create an official order.
4.  **Gateway Responds**: The payment gateway creates the order, assigns it a unique `order_id`, and returns an official payment link to our backend.
5.  **Backend Responds to Frontend**: Our backend sends this payment link back to the user's browser (frontend).
6.  **Frontend Redirects User**: The JavaScript redirects the user to this official payment link, which opens the UPI apps.
7.  **User Pays**: The user completes the payment in their UPI app.
8.  **THE CONFIRMATION (Webhook)**: This is the most critical step.
    * In our payment gateway dashboard, we configure a **Webhook URL** (e.g., `https://our-server.com/payment-webhook`).
    * As soon as the user's payment is successful, the payment gateway's server *immediately* sends a secure, automated POST request to our Webhook URL.
    * This request contains the payment details, such as `order_id` and `status: "success"`.
9.  **Backend Verifies and Updates**: Our backend receives this webhook, verifies it's a genuine request (using a secret key), and updates our database to mark that `order_id` as **PAID**.
10. **Frontend Status Update**: The webpage can now be updated. A common way is for the page to "poll" our backend every few seconds (e.g., `GET /api/check-status?order_id=...`). Once our backend sees the "PAID" status in the database, it tells the frontend, which can then display a "Payment Successful!" message.

This webhook-based system is the industry-standard, reliable, and secure way to confirm payments.

---

## Bonus: Analysis of SMS-Based Confirmation

The bonus requirement was to "automatically confirm payment by reading the payment confirmation SMS."

**This is not possible from a web page.**

For critical security and privacy reasons, a website running in a browser (like Chrome or Safari) is sandboxed and **cannot read a user's SMS messages**. There is no browser API or permission that allows this.

### How This *Could* Be Built (As a Native App)

The only way to achieve this specific feature is to build a **native Android App**, not a website. The process would be:

1.  **Build an Android App**: Using Kotlin/Java or a cross-platform framework.
2.  **Request `READ_SMS` Permission**: The app would have to explicitly ask the user for permission to read their SMS messages. This is a very sensitive permission that users are often reluctant to grant.
3.  **Create an SMS Listener**: The app would use a `BroadcastReceiver` to listen in the background for all incoming SMS messages.
4.  **Parse SMS Content**: When an SMS arrives, the app would use Regular Expressions (regex) to check if it's a bank confirmation message (e.g., by looking for keywords like "debited," "credited," "UPI Ref No.," and the specific amount).
5.  **Update Status**: If a matching SMS is found, the app would then make an API call to its backend server to confirm the payment.

**Conclusion:** While possible in a native app, this method is complex, less reliable than webhooks (bank SMS formats can change), and raises significant privacy concerns. The **Webhook** method described in Part 2 remains the standard, most secure, and most reliable solution.
