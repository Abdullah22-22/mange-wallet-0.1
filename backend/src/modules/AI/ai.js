import TLAccount from "../Transactions/truelayer/TLAccount.js";


export async function getSelectedTLAccountIdsForUser(userId) {
    const sel = await TLAccount.findOne({ userId, provider: "truelayer" }).lean();
    return sel?.accountId ? [sel.accountId] : [];
}

export async function getAllTLAccountIdsForUser(userId) {
    const accounts = await TLAccount.find({ userId, provider: "truelayer" }).lean();
    return accounts.map((a) => a.accountId);
}

