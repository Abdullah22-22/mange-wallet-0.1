import { useState } from "react";
import {
  tlStart,
  tlGetAccounts,
  tlSelectAccount,
  tlGetSelectedAccount,
  tlGetTransactions,
  tlStatus,
} from "../api/api.js";

export default function useTrueLayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(null); 

  async function checkStatus({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const st = await tlStatus();
      const isConn = !!st?.connected;
      setConnected(isConn);
      return isConn;
    } catch (e) {
      setConnected(false);
      if (!silent) setError(e);
      return false;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function startAuth() {
    try {
      setLoading(true);
      setError(null);

      const data = await tlStart();
      if (!data?.ok || !data?.authUrl) {
        throw new Error(data?.message || "Failed to start TrueLayer");
      }
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function fetchAccounts() {
    try {
      setLoading(true);
      setError(null);

      const isConn = await checkStatus({ silent: true });
      if (!isConn) return [];

      const data = await tlGetAccounts();
      if (!data?.ok) return [];

      const results = data?.data?.results || data?.data || [];
      return Array.isArray(results) ? results : [];
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function selectAccount(accountId) {
    try {
      setLoading(true);
      setError(null);

      const data = await tlSelectAccount(accountId);
      if (!data?.ok) throw new Error(data?.message || "Failed to select account");
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function getSelectedAccount() {
    try {
      setLoading(true);
      setError(null);

      const data = await tlGetSelectedAccount();
      if (!data?.ok) throw new Error(data?.message || "Failed to get selected account");
      return data.data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions(params) {
    try {
      setLoading(true);
      setError(null);

      const data = await tlGetTransactions(params);
      if (!data?.ok) throw new Error(data?.message || "Failed to get transactions");
      return data.transactions || data.raw || [];
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    startAuth,
    checkStatus,      
    connected,        
    fetchAccounts,
    selectAccount,
    getSelectedAccount,
    fetchTransactions,
    loading,
    error,
  };
}