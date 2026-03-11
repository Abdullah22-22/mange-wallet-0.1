import { useEffect, useState } from "react";
import { getSpendingDashboard, renewToken } from "../api/api";


export default function useSpendingDashboard(currency = "EUR") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /*
  ======================================
  Load Spending Dashboard Data
  ======================================
*/
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        await renewToken();

        const d = await getSpendingDashboard(currency);
        if (mounted) {
          setData(d);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (mounted) {
          if (status === 401) {
            console.log("No session - user not logged in");
          }
          setError(err);
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [currency]);

  return {
    data,
    loading,
    error
  };
}
