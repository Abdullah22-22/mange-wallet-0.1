

function Month(raw) {
    /* =========================
       BUILD POINTS
       ========================= */
    const points = (raw?.monthlyTotals || []).map(m => ({
        x: m.month,
        y: m.total
    }));

    /* =========================
       DEFAULT MARKER
       ========================= */
    const markerIndex = Math.min(5, Math.max(0, points.length - 1));

    /* =========================
       RETURN VIEW MODEL
       ========================= */
    return {
        currency: raw?.currency || "EUR",
        points,
        markerIndex

    };
}

export default Month
