import { useCallback, useState } from "react";
import { createGoalPlan, getMyGoalPlan, updateMyGoalPlan } from "../api/api";

export default function useGoalPlan() {
  const [plan, setPlan] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


 /*
    ======================================
    Fetch  Goal Plan
    ======================================
  */
  const fetchMyPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyGoalPlan();
      setPlan(data?.plan ?? null);
      return data?.plan ?? null;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch plan");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

   /*
    ======================================
    Create Goal Plan
    ======================================
  */
  const createPlan = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createGoalPlan(payload);
      setPlan(data?.plan ?? null);
      setAiMessage(data?.aiMessage ?? "");
      return data?.plan ?? null;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

 /*
    ======================================
    Update Goal Plan
    ======================================
  */
  const updatePlan = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateMyGoalPlan(payload);
      setPlan(data?.plan ?? null);
      setAiMessage(data?.aiMessage ?? "");
      return data?.plan ?? null;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    plan,
    aiMessage,
    loading,
    error,
    fetchMyPlan,
    createPlan,
    updatePlan,
    setPlan,
  };
}