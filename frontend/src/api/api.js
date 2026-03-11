import axios from "axios";

/*
  ======================================
  Axios API Instance
  ======================================
*/

const api = axios.create({
  baseURL: "https://manage-wallet-api.onrender.com/api",
  withCredentials: true,
});


/* ======================================
 AUTH
====================================== */
export async function registerUser(payload) {
  const res = await api.post("/users/register", payload);
  return res.data;
}

export async function loginUser(payload) {
  const res = await api.post("/users/login", payload);
  return res.data;
}

export async function renewToken() {
  const res = await api.get("/users/renew");
  return res.data;
}

export async function logoutUser() {
  const res = await api.post("/users/logout");
  return res.data;
}
/* ======================================
   PASSWORD
====================================== */

export async function changePassword(payload) {
  const res = await api.put("/users/change-password", payload);
  return res.data;
}

export async function forgotPassword(payload) {
  const res = await api.post("/users/forgot-password", payload);
  return res.data;
}

export async function resetPassword(payload) {
  const res = await api.post("/users/reset-password", payload);
  return res.data;
}

/* ======================================
   USER
====================================== */

// Get current user info
export async function getUser() {
  const res = await api.get("/users/me");
  return res.data;
}

// Update name or email
export async function updateUser(payload) {
  const res = await api.put("/users/update", payload);
  return res.data;
}

// Delete own account
export async function deleteAccount() {
  const res = await api.delete("/users/delete");
  return res.data;
}

/* ======================================
  REPORTS
====================================== */
export async function getSpendingDashboard(currency = "EUR") {
  const res = await api.get("/reports/spending", { params: { currency } });
  return res.data;
}

export async function createMockAccount(payload) {
  const res = await api.post("/bank/account", payload);
  return res.data;
}

export async function getBankAccount() {
  const res = await api.get("/bank/account");
  return res.data;
}

export async function seedMockStatement(payload) {
  const res = await api.post("/bank/mock/statement", payload);
  return res.data;
}

export async function getBankTransactions(params) {
  const res = await api.get("/bank/transactions", { params });
  return res.data;
}

/* ======================================
  TRUE LAYER
====================================== */
export async function tlStart() {
  const res = await api.get("/tl/start");
  return res.data;
}

export async function tlGetAccounts() {
  const res = await api.get("/tl/accounts");
  return res.data;
}

export async function tlSelectAccount(accountId) {
  const res = await api.post("/tl/accounts/select", { accountId });
  return res.data;
}

export async function tlGetSelectedAccount() {
  const res = await api.get("/tl/accounts/selected");
  return res.data;
}
export async function tlGetTransactions(params) {
  const res = await api.get("/tl/accounts/selected/transactions", {
    params,
  });
  return res.data;
}
export async function getTrueLayerSpendingDashboard(currency = "GBP") {
  const res = await api.get(
    `/reports/truelayer/spending?currency=${currency}`
  );
  return res.data;
}
export async function tlStatus() {
  const res = await api.get("/tl/status");
  return res.data;
}

/* ======================================
  GOAL PLAN
====================================== */
export async function createGoalPlan(payload) {
  const res = await api.post("/goal-plans", payload);
  return res.data;
}

export async function getMyGoalPlan() {
  const res = await api.get("/goal-plans/me");
  return res.data;
}

export async function updateMyGoalPlan(payload) {
  const res = await api.patch(`/goal-plans/me`, payload);
  return res.data;
}

/* ======================================
  AI
====================================== */
export async function getAiStatus() {
  const res = await api.get("/users/ai/status");
  return res.data;
}

export async function setAiConsent(consent) {
  const res = await api.post("/users/ai/consent", { consent });
  return res.data;
}

/* ======================================
  FLASK STOCK API
====================================== */
const flaskApi = axios.create({
  baseURL: "/flask-api",
});

export async function getFlaskStocks() {
  const res = await flaskApi.get("/stocks");
  return res.data;
}

export async function getFlaskStatus() {
  const res = await flaskApi.get("/status");
  return res.data;
}

export async function analyzeFinances(payload) {
  const res = await flaskApi.post("/analyze", payload);
  return res.data;
}

export async function getInvestmentRecs(payload) {
  const res = await flaskApi.post("/invest", payload);
  return res.data;
}