import React from "react";

export default function ShareTransactionsModal({
  open,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div style={styles.backdrop} role="dialog" aria-modal="true">
      <div style={styles.modal}>
        <h3 style={{ marginTop: 0 }}>Welcome!</h3>
        <p style={{ marginBottom: 12 }}>
          Would you like to share your transactions?
        </p>

        {error ? (
          <div style={{ marginBottom: 10 }} className="error-msg">
            {error}
          </div>
        ) : null}

        <div style={styles.actions}>
          <button type="button" onClick={onClose} disabled={loading}>
            Maybe Later
          </button>

          <button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Sharing..." : "Share Transactions"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: "min(520px, 92vw)",
    background: "#fff",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};