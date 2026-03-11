/*
   ========================
     Spending Report Builder
   ========================
   - Monthly / Weekly / Yearly summaries
   - Today’s spending summary
   - Top categories within a time range

   Weekly (YOUR DEFINITION):
   - Data source: previous month
   - Output: 7 buckets (Sun..Sat)
     each bucket represents all same weekdays inside previous month
*/

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/*
   ========================
     Date Helpers (UTC)
   ========================
*/
function startOfMonthUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonthUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

function addMonthsUTC(d, n) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

function startOfDayUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDaysUTC(d, days) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function addYearsUTC(d, n) {
  return new Date(Date.UTC(d.getUTCFullYear() + n, d.getUTCMonth(), d.getUTCDate()));
}

function inRange(tx, from, to) {
  const t = new Date(tx.occurredAt).getTime();
  return t >= from.getTime() && t < to.getTime();
}

function onlySpending(txs) {
  return txs.filter((t) => t.direction === "OUT" && (Number(t.amount) || 0) > 0);
}

/*
  IMPORTANT: force Number() to avoid string concatenation bugs
*/
function sum(txs) {
  return txs.reduce((a, t) => a + (Number(t.amount) || 0), 0);
}

/*
   ========================
     Category Breakdown
   ========================
*/
function breakdownByCategory(txs) {
  const map = {};

  for (const t of txs) {
    const k = t.category || "other";
    map[k] = (map[k] || 0) + (Number(t.amount) || 0);
  }

  const total = sum(txs);

  return Object.entries(map)
    .map(([category, value]) => ({
      category,
      total: Number(Number(value).toFixed(2)),
      percent: total ? Number(((value / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => (b?.total ?? 0) - (a?.total ?? 0));
}

/*
   ========================
     Weekday Analysis
   ========================
   - Totals spending per weekday (UTC)
   - Returns FIXED order Sun..Sat (better for charts)
*/
function weekdayStatsFixedOrder(txs) {
  const map = WEEKDAYS.map((day) => ({ day, total: 0, count: 0 }));

  for (const t of txs) {
    const d = new Date(t.occurredAt);
    const idx = d.getUTCDay();
    map[idx].total += Number(t.amount) || 0;
    map[idx].count += 1;
  }

  return map.map((x) => ({
    day: x.day,
    total: Number(x.total.toFixed(2)),
    count: x.count,
    avg: x.count ? Number((x.total / x.count).toFixed(2)) : 0,
  }));
}

/*
   ========================
     Daily Series (Monthly)
   ========================
*/
function dailySeries(txs, monthStart) {
  const map = {};

  for (const t of txs) {
    const day = new Date(t.occurredAt).getUTCDate();
    map[day] = (map[day] || 0) + (Number(t.amount) || 0);
  }

  const daysInMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)
  ).getUTCDate();

  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    data.push({ x: String(i), y: Number((map[i] || 0).toFixed(2)) });
  }
  return data;
}

/*
   ========================
     Monthly Totals (Year)
   ========================
*/
function monthlyTotals(txs, year) {
  const totals = new Array(12).fill(0);

  for (const t of txs) {
    const d = new Date(t.occurredAt);
    if (d.getUTCFullYear() === year) {
      totals[d.getUTCMonth()] += (Number(t.amount) || 0);
    }
  }

  return totals.map((v, i) => ({
    month: MONTHS[i],
    total: Number(v.toFixed(2)),
  }));
}

function monthlyTotalsInRange(txs, from, to) {
  const labels = [];
  const totals = [];
  const counts = [];

  let cursor = startOfMonthUTC(from);
  const end = startOfMonthUTC(to);

  while (cursor.getTime() < end.getTime()) {
    labels.push(`${MONTHS[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}`);
    totals.push(0);
    counts.push(0);
    cursor = addMonthsUTC(cursor, 1);
  }

  const indexMap = {};
  let c = startOfMonthUTC(from);
  for (let i = 0; i < labels.length; i++) {
    const key = `${c.getUTCFullYear()}-${c.getUTCMonth()}`;
    indexMap[key] = i;
    c = addMonthsUTC(c, 1);
  }

  for (const t of txs) {
    const d = new Date(t.occurredAt);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const idx = indexMap[key];
    if (idx !== undefined) {
      totals[idx] += (Number(t.amount) || 0);
      counts[idx] += 1;
    }
  }

  return totals.map((v, i) => ({
    month: labels[i],
    total: Number(v.toFixed(2)),
    transactionsCount: counts[i],
  }));
}

/*
   ========================
     Main Spending Report
   ========================
   - range: week | month | year | today
   - currency: e.g. GBP
*/
export function buildSpendingReport(unifiedTxs, range = "month", currency = "GBP") {
  const txs = onlySpending(unifiedTxs).filter((t) => t.currency === currency);
  const now = new Date();

  // support both "week" and "weekly"
  const r = range === "weekly" ? "week" : range;

  /*
     ========================
       Monthly Report
     ========================
  */
  if (r === "month") {
    const thisStart = startOfMonthUTC(now);
    const thisEnd = endOfMonthUTC(now);
    const prevStart = addMonthsUTC(thisStart, -1);

    const thisMonth = txs.filter((t) => inRange(t, thisStart, thisEnd));
    const lastMonth = txs.filter((t) => inRange(t, prevStart, thisStart));

    return {
      currency,
      range: "monthly",

      series: [
        { id: "last_month", label: "Last Month", data: dailySeries(lastMonth, prevStart) },
        { id: "this_month", label: "This Month", data: dailySeries(thisMonth, thisStart) },
      ],

      totals: {
        lastMonthTotal: Number(sum(lastMonth).toFixed(2)),
        lastMonthCount: lastMonth.length,
        thisMonthTotal: Number(sum(thisMonth).toFixed(2)),
        thisMonthCount: thisMonth.length,
        delta: Number((sum(thisMonth) - sum(lastMonth)).toFixed(2)),
      },

      categories: {
        thisMonth: breakdownByCategory(thisMonth),
        lastMonth: breakdownByCategory(lastMonth),
      },

      weekdayAnalysis: {
        thisMonth: weekdayStatsFixedOrder(thisMonth),
        lastMonth: weekdayStatsFixedOrder(lastMonth),
      },

      monthlyTotals: monthlyTotals(txs, now.getUTCFullYear()),
    };
  }

  /*
     ========================
       Yearly Report
     ========================
     - last 12 months window [from, to)
  */
  if (r === "year") {
    const to = addDaysUTC(startOfDayUTC(now), 1);
    const from = addYearsUTC(to, -1);
    const yearTxs = txs.filter((t) => inRange(t, from, to));

    return {
      currency,
      range: "yearly",
      window: {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      },
      total: Number(sum(yearTxs).toFixed(2)),
      transactionsCount: yearTxs.length,
      categories: breakdownByCategory(yearTxs),
      monthlyTotals: monthlyTotalsInRange(yearTxs, from, to),
    };
  }

  /*
     ========================
       Today's Spending
     ========================
  */
  if (r === "today") {
    const from = startOfDayUTC(now);
    const to = addDaysUTC(from, 1);

    const todayTxs = txs.filter((t) => inRange(t, from, to));

    return {
      currency,
      range: "today",
      window: {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      },
      total: Number(sum(todayTxs).toFixed(2)),
      transactionsCount: todayTxs.length,
      categories: breakdownByCategory(todayTxs),
      weekdayAnalysis: weekdayStatsFixedOrder(todayTxs),
    };
  }

  /*
     ========================
       Weekly Report (YOUR DEFINITION)
     ========================
     - Previous month window [prevMonthStart, thisMonthStart)
     - Output 7 buckets by weekday across that month
  */
  const thisMonthStart = startOfMonthUTC(now);
  const prevMonthStart = addMonthsUTC(thisMonthStart, -1);
  const prevMonthEnd = thisMonthStart;

  const prevMonthTxs = txs.filter((t) => inRange(t, prevMonthStart, prevMonthEnd));

  return {
    currency,
    range: "weekly",
    window: {
      from: prevMonthStart.toISOString().slice(0, 10),
      to: prevMonthEnd.toISOString().slice(0, 10),
    },

    total: Number(sum(prevMonthTxs).toFixed(2)),
    transactionsCount: prevMonthTxs.length,
    categories: breakdownByCategory(prevMonthTxs),

    //  Monday = all Mondays in previous month, etc.
    weekdayAnalysis: weekdayStatsFixedOrder(prevMonthTxs),
  };
}

/*
   ========================
     Today's Spending (light)
   ========================
*/
export function buildTodaysSpending(unifiedTxs, currency = "EUR") {
  const txs = onlySpending(unifiedTxs).filter((t) => t.currency === currency);

  const todayStart = startOfDayUTC(new Date());
  const todayEnd = addDaysUTC(todayStart, 1);

  const todayTx = txs.filter((t) => inRange(t, todayStart, todayEnd));
  const totalSpent = Number(sum(todayTx).toFixed(2));

  return {
    currency,
    date: todayStart.toISOString().slice(0, 10),
    today: {
      totalSpent,
      transactionsCount: todayTx.length,
      expenseCategoriesCount: new Set(todayTx.map((t) => t.category || "other")).size,
    },
  };
}

/*
   ========================
     Top Expense Categories
   ========================
   - range: today | week | month
   - limit: max number of categories to return
*/
export function buildTopExpenseCategories(unifiedTxs, opts = {}) {
  const { range = "month", currency = "EUR", limit = 4 } = opts;

  const txs = onlySpending(unifiedTxs).filter((t) => t.currency === currency);
  const now = new Date();

  let from, to;

  if (range === "today") {
    from = startOfDayUTC(now);
    to = addDaysUTC(from, 1);
  } else if (range === "week" || range === "weekly") {
    // keep original behavior here (last 7 days)
    // if you want it to match "weekly = previous month", tell me and I'll change it.
    to = addDaysUTC(startOfDayUTC(now), 1);
    from = addDaysUTC(to, -7);
  } else {
    from = startOfMonthUTC(now);
    to = endOfMonthUTC(now);
  }

  const rangedTx = txs.filter((t) => inRange(t, from, to));
  const total = sum(rangedTx) || 0;

  const map = {};
  for (const t of rangedTx) {
    const k = t.category || "other";
    map[k] = (map[k] || 0) + (Number(t.amount) || 0);
  }

  const top = Object.entries(map)
    .map(([key, value]) => ({
      key,
      total: Number(Number(value).toFixed(2)),
      percent: total ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, Math.max(1, Math.min(limit, 10)))
    .map((x, i) => ({ rank: i + 1, ...x }));

  return {
    currency,
    range: {
      type: range,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    },
    topCategories: top,
  };
}
