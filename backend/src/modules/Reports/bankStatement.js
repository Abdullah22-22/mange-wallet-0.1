import MockTransaction from "../Transactions/Local/MockTransaction.js";

/*
  ======================================
  Mock Transaction Categories
  ======================================
  Predefined merchants used to generate
  realistic demo transactions.
*/
const CATEGORIES = [
  { merchant: "City Market", desc: "Groceries", min: 5, max: 60, dir: "OUT", tag: "food" },
  { merchant: "Cafe", desc: "Coffee", min: 3, max: 12, dir: "OUT", tag: "food" },
  { merchant: "Uber", desc: "Ride", min: 6, max: 35, dir: "OUT", tag: "transport" },
  { merchant: "Netflix", desc: "Subscription", min: 9, max: 20, dir: "OUT", tag: "subscriptions" },
  { merchant: "Electric Company", desc: "Electric bill", min: 40, max: 120, dir: "OUT", tag: "subscriptions" },
  { merchant: "Cinema", desc: "Movie ticket", min: 8, max: 18, dir: "OUT", tag: "entertainment" },
  { merchant: "Steam", desc: "Game purchase", min: 10, max: 70, dir: "OUT", tag: "entertainment" },
  { merchant: "PlayStation Store", desc: "Game content", min: 5, max: 50, dir: "OUT", tag: "entertainment" },
  { merchant: "City Bar", desc: "Night out", min: 15, max: 80, dir: "OUT", tag: "entertainment" },
  { merchant: "Employer Ltd", desc: "Salary", min: 900, max: 1600, dir: "IN", tag: "income" },
];

/*
  ======================================
  Utility Functions
  ======================================
*/

/**
 * Generate random amount between min and max.
 * Returns a number with 2 decimal places.
 */
function rand(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

/**
 * Pick a random item from an array.
 */
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/*
  ======================================
  Seed Mock Transactions
  ======================================
  - Generates demo transactions for a user
  - Creates random transactions for each day
  - Prevents duplicate seeding
*/
export async function seedMockTransactions({ userId, accountId, days = 365 }) {
  if (!userId) throw new Error("userId is required");

  // Prevent seeding if mock transactions already exist
  const alreadySeeded = await MockTransaction.exists({
    userId,
    accountId,
    source: "mock",
  });

  if (alreadySeeded) {
    return {
      allowed: false,
      inserted: 0,
    };
  }

  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const docs = [];

  // Loop through each day
  for (let i = 0; i < days; i++) {
    const day = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);

    // Generate 1–3 transactions per day
    const txCount = 1 + Math.floor(Math.random() * 3);

    for (let k = 0; k < txCount; k++) {
      const item = randomItem(CATEGORIES);

      // Random time during the day
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);

      const occurredAt = new Date(
        Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          hour,
          minute
        )
      );

      // Push transaction document
      docs.push({
        userId,
        accountId,
        amount: rand(item.min, item.max),
        currency: "EUR",
        direction: item.dir,
        merchantName: item.merchant,
        description: item.desc,
        occurredAt,
        category: item.tag,
        tags: ["demo"],
        source: "mock",
      });
    }
  }

  // Insert all transactions at once
  const insertedDocs = await MockTransaction.insertMany(docs, {
    ordered: false,
  });

  return {
    allowed: true,
    inserted: insertedDocs.length,
    reason: null,
  };
}
