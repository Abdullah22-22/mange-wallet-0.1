/* =========================
   DAYS OF WEEK CONFIG
   ========================= */
const DOW = [
  { key: "mon", label: "Mon", kind: "weekday" },
  { key: "tue", label: "Tue", kind: "weekday" },
  { key: "wed", label: "Wed", kind: "weekday" },
  { key: "thu", label: "Thu", kind: "weekday" },
  { key: "fri", label: "Fri", kind: "weekday" },
  { key: "sat", label: "Sat", kind: "weekend" },
  { key: "sun", label: "Sun", kind: "weekend" },
];

/* =========================
   API → INTERNAL KEY MAP
   =========================
   - API weekdayAnalysis uses: "Sun".."Sat"
   - Chart order uses DOW (Mon..Sun)
*/
const API_DAY_TO_KEY = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

/* =========================
   LEGACY DAY INDEX HELPER
   =========================
   - Used only for monthly series fallback
*/
function dayIndexFromDayNumber(dayNumber) {
  return (dayNumber - 1) % 7;
}

/* =========================
   WEEKDAY AGGREGATION (NEW)
   =========================
   - Uses raw.weekdayAnalysis if present
   - Each bucket represents ALL same weekdays in previous month
*/
function pointsFromWeekdayAnalysis(weekdayAnalysis = [], mode = "avg") {
  const map = {};

  for (const item of weekdayAnalysis) {
    const key = API_DAY_TO_KEY[item?.day];
    if (!key) continue;

    map[key] = {
      total: Number(item?.total) || 0,
      count: Number(item?.count) || 0,
      avg: Number(item?.avg) || 0,
    };
  }

  return DOW.map((d) => {
    const v = map[d.key] || { total: 0, count: 0, avg: 0 };
    const y = mode === "sum" ? v.total : mode === "avg" ? v.avg : v.count ? v.total / v.count : 0;

    return { x: d.label, y: Math.round(y) };
  });
}

/* =========================
   MONTH SERIES FALLBACK (OLD)
   =========================
   - Builds a "week view" from this_month daily series
*/
function pointsFromMonthlySeries(raw, mode = "avg") {
  const series = raw?.series || [];
  const current = series.find((s) => s.id === "this_month")?.data || [];

  const buckets = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));

  for (const p of current) {
    const dayNumber = Number(p.x);
    const idx = dayIndexFromDayNumber(dayNumber);
    const value = Number(p.y) || 0;

    buckets[idx].sum += value;
    buckets[idx].count += 1;
  }

  return DOW.map((d, idx) => {
    const { sum, count } = buckets[idx];
    const y = mode === "sum" ? sum : count ? sum / count : 0;

    return { x: d.label, y: Math.round(y) };
  });
}

/* =========================
   WEEK VIEW BUILDER
   =========================
   - Prefers weekdayAnalysis (weekly report)
   - Falls back to monthly series behavior
*/
function Week(raw, mode = "avg") {
  if (Array.isArray(raw?.weekdayAnalysis) && raw.weekdayAnalysis.length) {
    return {
      currency: raw?.currency || "EUR",
      points: pointsFromWeekdayAnalysis(raw.weekdayAnalysis, mode),
    };
  }

  return {
    currency: raw?.currency || "EUR",
    points: pointsFromMonthlySeries(raw, mode),
  };
}

export default Week;
