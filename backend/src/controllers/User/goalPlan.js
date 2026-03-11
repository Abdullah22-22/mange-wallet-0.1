import GoalPlan from "../../modules/User/GoalPlan.js";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
const VALID_STRICTNESS = ["flexible", "balanced", "strict"];

function normalizeAndValidate(body) {
  const monthlyIncome = Number(body.monthlyIncome);
  const fixedExpensesMonthly = Number(body.fixedExpensesMonthly ?? 0);
  const targetSavingsMonthly = Number(body.targetSavingsMonthly);

  const difficulty = body.difficulty ?? "medium";
  const strictness = body.strictness ?? "balanced";

  const payday = Number(body.payday ?? 1);
  const priority = Number(body.priority ?? 3);

  const categoriesToReduce = body.categoriesToReduce;
  const reason = (body.reason ?? "").toString();

  const targetDateRaw = body.targetDate;
  const targetDate = new Date(targetDateRaw);

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0)
    return { ok: false, message: "monthlyIncome must be > 0" };

  if (!Number.isFinite(fixedExpensesMonthly) || fixedExpensesMonthly < 0)
    return { ok: false, message: "fixedExpensesMonthly must be >= 0" };

  if (!Number.isFinite(targetSavingsMonthly) || targetSavingsMonthly < 0)
    return { ok: false, message: "targetSavingsMonthly must be >= 0" };

  if (!VALID_DIFFICULTIES.includes(difficulty))
    return { ok: false, message: "Invalid difficulty" };

  if (!VALID_STRICTNESS.includes(strictness))
    return { ok: false, message: "Invalid strictness" };

  if (!Number.isFinite(payday) || payday < 1 || payday > 31)
    return { ok: false, message: "payday must be between 1 and 31" };

  if (!Number.isFinite(priority) || priority < 1 || priority > 5)
    return { ok: false, message: "priority must be between 1 and 5" };

  if (!Array.isArray(categoriesToReduce) || categoriesToReduce.length === 0)
    return { ok: false, message: "categoriesToReduce is required" };

  const cleanCategories = [
    ...new Set(categoriesToReduce.map(String).map((s) => s.trim()).filter(Boolean)),
  ];

  if (cleanCategories.length === 0)
    return { ok: false, message: "categoriesToReduce is empty" };

  if (!targetDateRaw || Number.isNaN(targetDate.getTime()))
    return { ok: false, message: "targetDate is required (YYYY-MM-DD)" };

  return {
    ok: true,
    value: {
      monthlyIncome,
      fixedExpensesMonthly,
      targetSavingsMonthly,
      targetDate,
      payday,
      difficulty,
      strictness,
      priority,
      categoriesToReduce: cleanCategories,
      reason,
    },
  };
}

export const createGoalPlan = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const v = normalizeAndValidate(req.body);
    if (!v.ok) return res.status(400).json({ message: v.message });

    await GoalPlan.updateMany(
      { userId, status: "active" },
      { $set: { status: "archived" } }
    );

    const plan = await GoalPlan.create({
      userId,
      monthlyIncome: v.value.monthlyIncome,
      fixedExpensesMonthly: v.value.fixedExpensesMonthly,
      targetSavingsMonthly: v.value.targetSavingsMonthly,
      targetDate: v.value.targetDate,
      payday: v.value.payday,
      difficulty: v.value.difficulty,
      strictness: v.value.strictness,
      priority: v.value.priority,
      categoriesToReduce: v.value.categoriesToReduce,
      reason: v.value.reason,
      status: "active",
    });

    return res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
};

export const getMyGoalPlan = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const plan = await GoalPlan.findOne({ userId, status: "active" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ plan: plan || null });
  } catch (err) {
    next(err);
  }
};

export const updateMyGoalPlan = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const v = normalizeAndValidate(req.body);
    if (!v.ok) return res.status(400).json({ message: v.message });

    const plan = await GoalPlan.findOneAndUpdate(
      { userId, status: "active" },
      {
        monthlyIncome: v.value.monthlyIncome,
        fixedExpensesMonthly: v.value.fixedExpensesMonthly,
        targetSavingsMonthly: v.value.targetSavingsMonthly,
        targetDate: v.value.targetDate,
        payday: v.value.payday,
        difficulty: v.value.difficulty,
        strictness: v.value.strictness,
        priority: v.value.priority,
        categoriesToReduce: v.value.categoriesToReduce,
        reason: v.value.reason,
      },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    return res.status(200).json({ plan });
  } catch (err) {
    next(err);
  }
};