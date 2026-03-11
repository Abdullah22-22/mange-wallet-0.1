function formatTime(value) {
  if (!value || value === "—") return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapTxRow(t) {
  const amountNum =
    typeof t?.amount === "number" ? t.amount : Number(t?.amount ?? 0);

  return {
    id:
      t?.id ||
      t?.transactionId ||
      t?.transaction_id ||
      t?._id ||
      `${t?.occurredAt || t?.time || t?.timestamp || t?.date}-${amountNum}-${t?.description || t?.info || t?.merchant_name || ""
      }`,
    info: t?.description || t?.info || t?.merchant_name || "—",
    category: t?.category || t?.category_name || "—",
    time: t?.occurredAt || t?.time || t?.timestamp || t?.date || "—",
    amount: amountNum,
    currency: t?.currency || "EUR",
  };
}

export default function TransactionsListSection({
  selectedAccount,
  transactions,

}) {
  const rows = (transactions || []).filter(Boolean).map(mapTxRow);

  return (
    <div className="tx-wrap">
      <div className="tx-header">
        <div className="tx-title">Transactions List</div>
        <div className="tx-subtitle">{selectedAccount?.name || "—"}</div>
      </div>

      <div className="tx-table-wrap">

        <table className="tx-table">
          <thead>
            <tr>
              <th>INFO</th>
              <th>Category</th>
              <th>Time</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.info}</td>
                <td>{r.category}</td>
                <td>{formatTime(r.time)}</td>
                <td>
                  {r.currency} {Number(r.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}