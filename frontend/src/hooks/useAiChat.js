import { useState } from "react";
import { getAiStatus, setAiConsent} from "../api/api";

export default function useAiChat() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /*
    ======================================
    Fetch AI Consent Status
    ======================================
  */
    async function fetchStatus() {
        try {
            setLoading(true);
            setError(null);;
            const data = await getAiStatus();
            setStatus(data);
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }
    /*
   ======================================
   Approve AI Consent
   ======================================
 */
    async function approveConsent() {
        try {
            setLoading(true);
            setError(null);
            const data = await setAiConsent(true);
            setStatus(data);
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }


    return {
        status,
        loading,
        error,
        fetchStatus,
        approveConsent,
    };
}