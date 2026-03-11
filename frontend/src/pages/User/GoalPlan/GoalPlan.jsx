import { useEffect, useMemo, useState } from "react";
import useGoalPlan from "../../../hooks/useGoalPlan";
import "./GoalPlanPage.css";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Subscriptions"];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STRICTNESS = [
  { value: "flexible", label: "Flexible" },
  { value: "balanced", label: "Balanced" },
  { value: "strict", label: "Strict" },
];

const INITIAL_FORM_STATE = {
  monthlyIncome: "",
  fixedExpensesMonthly: "",
  targetSavingsMonthly: "",
  targetDate: "",
  payday: 1,
  difficulty: "medium",
  strictness: "balanced",
  priority: 3,
  categoriesToReduce: ["Food"],
  reason: "",
};

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function GoalPlan() {
  const { plan, loading, error, fetchMyPlan, createPlan, updatePlan } =
    useGoalPlan();

  const [form, setForm] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    (async () => {
      const p = await fetchMyPlan();
      if (p) {
        setForm({
          monthlyIncome: String(p.monthlyIncome ?? ""),
          fixedExpensesMonthly: String(p.fixedExpensesMonthly ?? 0),
          targetSavingsMonthly: String(p.targetSavingsMonthly ?? ""),
          targetDate: toDateInputValue(p.targetDate),

          payday: Number(p.payday ?? 1),
          difficulty: p.difficulty ?? "medium",
          strictness: p.strictness ?? "balanced",
          priority: Number(p.priority ?? 3),

          categoriesToReduce:
            Array.isArray(p.categoriesToReduce) && p.categoriesToReduce.length
              ? p.categoriesToReduce
              : ["Food"],

          reason: String(p.reason ?? ""),
        });
      }
    })();
  }, [fetchMyPlan]);

  const isUpdateMode = !!plan?._id;

  const canSubmit = useMemo(() => {
    const income = Number(form.monthlyIncome);
    const fixed = Number(form.fixedExpensesMonthly);
    const target = Number(form.targetSavingsMonthly);

    return (
      Number.isFinite(income) &&
      income > 0 &&
      Number.isFinite(fixed) &&
      fixed >= 0 &&
      Number.isFinite(target) &&
      target >= 0 &&
      !!form.targetDate &&
      form.difficulty &&
      form.strictness &&
      Number(form.payday) >= 1 &&
      Number(form.payday) <= 31 &&
      Number(form.priority) >= 1 &&
      Number(form.priority) <= 5 &&
      Array.isArray(form.categoriesToReduce) &&
      form.categoriesToReduce.length > 0
    );
  }, [form]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onNumberChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleCategory = (category) => {
    setForm((prev) => {
      const exists = prev.categoriesToReduce.includes(category);
      return {
        ...prev,
        categoriesToReduce: exists
          ? prev.categoriesToReduce.filter((c) => c !== category)
          : [...prev.categoriesToReduce, category],
      };
    });
  };

  const selectAll = () =>
    setForm((prev) => ({ ...prev, categoriesToReduce: [...CATEGORIES] }));

  const clearAll = () =>
    setForm((prev) => ({ ...prev, categoriesToReduce: [] }));

  const onSubmit = async () => {
    if (!canSubmit) return;

    try {
      const payload = {
        monthlyIncome: Number(form.monthlyIncome),
        fixedExpensesMonthly: Number(form.fixedExpensesMonthly),
        targetSavingsMonthly: Number(form.targetSavingsMonthly),
        targetDate: form.targetDate,

        payday: Number(form.payday),
        difficulty: form.difficulty,
        strictness: form.strictness,
        priority: Number(form.priority),

        categoriesToReduce: form.categoriesToReduce,
        reason: form.reason,
      };

      if (!isUpdateMode) {
        await createPlan(payload);
      } else {
        await updatePlan(payload);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="gp-page">
      <div className="gp-paper">
        <div className="gp-header">
          <div>
            <h1 className="gp-title">Savings Plan</h1>
            <p className="gp-subtitle">
              Define your income, goal, and what to reduce.
            </p>
          </div>
          <div className="gp-stamp">{isUpdateMode ? "ACTIVE" : "NEW"}</div>
        </div>

        <div className="gp-divider" />

        <div className="gp-section">
          <div className="gp-section-title">Plan Inputs</div>

          <div className="gp-grid-2">
            <div className="gp-field">
              <label className="gp-label">Monthly Income</label>
              <input
                className="gp-input"
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyIncome}
                onChange={onNumberChange("monthlyIncome")}
              />
            </div>

            <div className="gp-field">
              <label className="gp-label">Fixed Expenses (Monthly)</label>
              <input
                className="gp-input"
                type="number"
                min="0"
                step="0.01"
                value={form.fixedExpensesMonthly}
                onChange={onNumberChange("fixedExpensesMonthly")}
              />
            </div>

            <div className="gp-field">
              <label className="gp-label">Target Savings (Monthly)</label>
              <input
                className="gp-input"
                type="number"
                min="0"
                step="0.01"
                value={form.targetSavingsMonthly}
                onChange={onNumberChange("targetSavingsMonthly")}
              />
            </div>

            <div className="gp-field">
              <label className="gp-label">Target Date</label>
              <input
                className="gp-input"
                type="date"
                value={form.targetDate}
                onChange={onChange("targetDate")}
              />
            </div>
          </div>

          <div className="gp-field gp-mt">
            <label className="gp-label">Difficulty Level</label>
            <div className="gp-pills">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`gp-pill ${form.difficulty === d.value ? "is-active" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, difficulty: d.value }))}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-field gp-mt">
            <label className="gp-label">Strictness</label>
            <div className="gp-pills">
              {STRICTNESS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`gp-pill ${form.strictness === s.value ? "is-active" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, strictness: s.value }))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-grid-2 gp-mt">
            <div className="gp-field">
              <label className="gp-label">Payday (1 - 31)</label>
              <input
                className="gp-input"
                type="number"
                min="1"
                max="31"
                value={form.payday}
                onChange={onNumberChange("payday")}
              />
            </div>

            <div className="gp-field">
              <label className="gp-label">Priority (1 - 5)</label>
              <input
                className="gp-input"
                type="number"
                min="1"
                max="5"
                value={form.priority}
                onChange={onNumberChange("priority")}
              />
            </div>
          </div>

          <div className="gp-field gp-mt">
            <div className="gp-row">
              <label className="gp-label">Categories to Reduce</label>
              <div className="gp-actions">
                <button type="button" className="gp-link" onClick={selectAll}>
                  Select All
                </button>
                <button type="button" className="gp-link" onClick={clearAll}>
                  Clear
                </button>
              </div>
            </div>

            <div className="gp-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`gp-chip ${form.categoriesToReduce.includes(c) ? "is-active" : ""}`}
                  onClick={() => toggleCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-field gp-mt">
            <label className="gp-label">Reason (optional)</label>
            <textarea
              className="gp-input"
              rows={3}
              value={form.reason}
              onChange={onChange("reason")}
              placeholder="e.g. I want to save for a trip / emergency fund..."
            />
          </div>

          {error && <div className="gp-error">{error}</div>}
        </div>
        <div className="gp-footer">
          <button
            type="button"
            className="gp-btn"
            onClick={onSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? "Saving..." : isUpdateMode ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoalPlan;