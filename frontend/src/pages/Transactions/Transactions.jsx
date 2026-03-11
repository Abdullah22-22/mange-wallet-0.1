import { useEffect, useState } from "react";
import useTrueLayer from "../../hooks/useTrueLayer";
import useLocalShare from "../../hooks/useLocalShare";
import AccountsSection from "./TransactionsInfo/AccountsSection";
import TransactionsListSection from "./TransactionsInfo/TransactionsListSection";
import "./Transactions.css";

function normalizeTLAccount(a) {
  return {
    id: a?.account_id || a?.accountId || a?.id,
    name: a?.display_name || a?.displayName || "TrueLayer Account",
    currency: a?.currency || "EUR",
    source: "truelayer",
    raw: a,
  };
}

const LOCAL_ACCOUNT = {
  id: "local_main",
  name: "Local Account",
  currency: "EUR",
  source: "local",
};

function Transactions() {
  const {
    checkStatus,
    connected,
    fetchAccounts,
    selectAccount,
    fetchTransactions,
    loading,
    error,
  } = useTrueLayer();

  const localShare = useLocalShare();

  const [tlAccounts, setTlAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(LOCAL_ACCOUNT);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const isConnected = await checkStatus({ silent: true });
        if (!mounted) return;

        if (!isConnected) {
          setTlAccounts([]);
          return;
        }

        const accounts = await fetchAccounts();
        if (!mounted) return;

        setTlAccounts((accounts || []).filter(Boolean).map(normalizeTLAccount));
      } catch {
        if (!mounted) return;
        setTlAccounts([]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function handleSelectAccount(acc) {
    if (!acc?.id) return;

    setSelectedAccount(acc);

    try {
      // Local (READ ONLY - no create/share)
      if (acc.source === "local") {
        const txs = await localShare.getLocalTransactions();
        setTransactions(Array.isArray(txs) ? txs : []);
        return;
      }

      // TrueLayer
      if (connected === false) {
        setTransactions([]);
        return;
      }

      setLoadingTx(true);
      await selectAccount(acc.id);

      const tx = await fetchTransactions({});
      setTransactions(Array.isArray(tx) ? tx : []);
    } catch (err) {
      console.log(err);
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }

  return (
    <div className="transactions">
      {connected === false ? (
        <div className="t-box t-box-top" style={{ display: "grid", gap: 12 }}>
          <AccountsSection
            localAccount={LOCAL_ACCOUNT}
            tlAccounts={[]}
            selectedAccount={selectedAccount}
            onSelectAccount={handleSelectAccount}
            error={null}
            loading={loading}
          />
        </div>
      ) : (
        <>
          <div className="t-box t-box-top">
            <AccountsSection
              localAccount={LOCAL_ACCOUNT}
              tlAccounts={tlAccounts}
              selectedAccount={selectedAccount}
              onSelectAccount={handleSelectAccount}
              error={error}
              loading={loading}
            />
          </div>

        </>
      )}
      <div className="t-box t-box-bottom">
        <TransactionsListSection
          selectedAccount={selectedAccount}
          transactions={transactions}
          loading={loadingTx || loading}
        />
      </div>
    </div>
  );
}

export default Transactions;