
/* =========================
   UTIL: ONLY DIGITS
   ========================= */
export function onlyDigits(s) {
    return String(s || "").replace(/\D/g, "");
}


/* =========================
   VALIDATION
   ========================= */
export function validate({ cardNumber, fullName, cvc, expiryMonth, expiryYear }) {


    /* =========================
       CARD NUMBER
       ========================= */
    const digits = onlyDigits(cardNumber);
    if (!fullName || fullName.trim().length < 2) return "Full name is required.";
    if (digits.length < 12 || digits.length > 19) return "Card number is invalid.";

    /* =========================
       CVC
       ========================= */
    const cvcDigits = onlyDigits(cvc)
    if (!(cvcDigits.length === 3 || cvcDigits.length === 4)) return "CVC is invalid.";



    /* =========================
        EXPIRY DATE
        ========================= */
    const m = Number(expiryMonth);
    const y = Number(expiryYear);

    if (!m >= 1 && m <= 12) return "Expiry month is invalid.";
    if (!y >= 2026 && y <= 2100) return "Expiry year is invalid.";

    /* =========================
       SUCCESS
       ========================= */
    return null;
} 
