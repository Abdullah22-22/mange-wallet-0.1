function AccountCard({ account, selected, onClick }) {
  return (
    <button
      className={`acc-card ${selected ? "acc-card--selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="acc-title">{account?.name || "—"}</div>
      <div className="acc-meta">
        <div className="acc-dashes">----</div>
        <div className="acc-currency">{account?.currency || "GBP"}</div>
      </div>
    </button>
  );
}

export default function AccountsSection({
  localAccount,
  tlAccounts,
  selectedAccount,
  onSelectAccount,
  error,
  loading,
}) {
  const safeLocal = localAccount || {
    id: "local_main",
    name: "Local Account",
    currency: "EUR",
    source: "local",
  };

  return (
    <div className="accounts-wrap">
      <div className="accounts-row" role="list">
        {/* Local Account */}
        <div
          className={`acc-card ${
            selectedAccount?.id === safeLocal?.id &&
            selectedAccount?.source === safeLocal?.source
              ? "acc-card--selected"
              : ""
          }`}
          onClick={() => onSelectAccount?.(safeLocal)}
          style={{ textAlign: "left", cursor: "pointer" }}
        >
          <div className="acc-title">{safeLocal?.name}</div>

          <div className="acc-meta">
            <div className="acc-dashes">----</div>
            <div className="acc-currency">{safeLocal?.currency}</div>
          </div>
        </div>

        {/* TrueLayer Accounts */}
        {(tlAccounts || [])
          .filter((a) => a && a.id)
          .map((acc, idx) => (
            <AccountCard
              key={acc.id || `acc_${idx}`}
              account={acc}
              selected={
                selectedAccount?.id === acc.id &&
                selectedAccount?.source === acc.source
              }
              onClick={() => onSelectAccount?.(acc)}
            />
          ))}

        {loading ? <div className="accounts-hint">Loading accounts...</div> : null}

        {error ? (
          <div className="accounts-error">
            Error: {String(error?.message || error)}
          </div>
        ) : null}
      </div>
    </div>
  );
}