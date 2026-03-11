import useMockCard from "./useMockCard";

export default function useLocalShare() {
  const mock = useMockCard();


  /*
   ======================================
   Seed & Share Local Transactions
   ======================================
 */
  async function shareLocalTransactions() {
    try {
      await mock.seedStatement({
        days: 365,
        currency: "EUR",
        minDailySpend: 100,
      });

      const data = await mock.fetchTransactions();
      return data?.transactions ?? [];

    } catch (err) {
      console.log("Local Share Error:", err);
      return [];
    }
  }

  /*
  ======================================
  Get Existing Local Transactions
  ======================================
*/
  async function getLocalTransactions() {
    try {
      const data = await mock.fetchTransactions();
      return data?.transactions ?? [];
    } catch {
      return [];
    }
  }

  return {
    shareLocalTransactions,
    getLocalTransactions,
    loading: mock.loading,
    hasTransactions: mock.hasTransactions,
  };
}