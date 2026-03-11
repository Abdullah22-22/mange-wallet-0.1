import { useState } from "react";
import {
  createMockAccount,
  getBankAccount,
  seedMockStatement,
  getBankTransactions,
} from "../api/api";

export default function useMockCard() {
  const [account, setAccount] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [checkingTx, setCheckingTx] = useState(false);

  async function fetchAccount() {
    try {
      setLoading(true);
      setError(null);

      const data = await getBankAccount();
      const acc = data?.account ?? null;

      setAccount(acc);
      setCard(acc);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function createCard(payload) {
    try {
      setLoading(true);
      setError(null);

      const data = await createMockAccount({
        fullName: payload.fullName,
        cardNumber: payload.cardNumber,
      });

      await fetchAccount();

      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions(params) {
    try {
      setTxLoading(true);
      setTxError(null);

      const data = await getBankTransactions(params);
      const txs = data?.transactions ?? [];

      setTransactions(txs);

      const count = data?.count ?? txs.length;
      setHasTransactions(count > 0);

      return data;
    } catch (e) {
      setTxError(e);
      throw e;
    } finally {
      setTxLoading(false);
    }
  }

  async function checkTransactions() {
    try {
      setCheckingTx(true);
      setError(null);

      const data = await getBankTransactions();
      setHasTransactions((data?.count ?? 0) > 0);

      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setCheckingTx(false);
    }
  }

  async function seedStatement(
    payload = { days: 365, currency: "EUR", minDailySpend: 100 }
  ) {
    try {
      setLoading(true);
      setError(null);

      const data = await seedMockStatement(payload);

      await checkTransactions();
      await fetchTransactions();

      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    card,
    account,
    loading,
    error,
    transactions,
    txLoading,
    txError,
    hasTransactions,
    checkingTx,
    fetchAccount,
    createCard,
    seedStatement,
    fetchTransactions,
    checkTransactions,
  };
}