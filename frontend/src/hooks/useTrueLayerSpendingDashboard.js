import { useEffect, useState } from "react";
import {
  getTrueLayerSpendingDashboard,
  renewToken,
  tlGetAccounts,
  tlSelectAccount,
  tlGetSelectedAccount,
  tlStatus,
} from "../api/api";

export default function useTrueLayerSpendingDashboard(currency = "GBP") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function ensureSelectedAccount() {
      const sel = await tlGetSelectedAccount();
      if (sel?.selected?.accountId) return;

      const accountsRes = await tlGetAccounts();
      const accounts =
        accountsRes?.data?.results ||
        accountsRes?.data ||
        accountsRes?.results ||
        [];
      const first = accounts?.[0];
      const firstId = first?.account_id;
      if (!firstId) throw new Error("No TrueLayer accounts found to select");

      await tlSelectAccount(firstId);
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const st = await tlStatus();
        if (!st?.connected) {
          if (mounted) {
            setConnected(false);
            setData(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) setConnected(true);

        await renewToken();
        await ensureSelectedAccount();

        const d = await getTrueLayerSpendingDashboard(currency);
        if (mounted) setData(d);
      } catch (err) {
        if (mounted) {
          setError(err);
          setData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [currency]);

  return { data, loading, error, connected };
}