document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById("pay-button");
    const statusMessage = document.getElementById("payment-status");
    const transactionNote = document.getElementById("txn-note").innerText;

    payButton.addEventListener("click", () => {
        // --- !!! EDIT THIS SECTION !!! ---
        const upiId = "YOUR_UPI_ID@OKBANK"; // Example: "yourname@ybl" or "1234567890@upi"
        const merchantName = "Your Name";   // Example: "My Test Store"
        // ---------------------------------

        const amount = "1.00"; // Amount (INR 1.00)
        const currency = "INR";
        
        // Construct the UPI deep-link
        // pa = Payee Address (UPI ID)
        // pn = Payee Name
        // am = Amount
        // cu = Currency
        // tn = Transaction Note (can be your order ID)
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;

        console.log("Generated UPI URL:", upiUrl);

        // Show a message to the user
        statusMessage.classList.remove("hidden");
        payButton.disabled = true;
        payButton.innerText = "Opening UPI App...";

        // Redirect the browser to the UPI link
        // On mobile, this will open the app picker
        // On desktop, this will likely do nothing
        window.location.href = upiUrl;
        
        // Note: The browser cannot know if the payment was successful.
        // We'd need a backend for that.
    });
});