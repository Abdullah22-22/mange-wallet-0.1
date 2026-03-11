import UserToken from "./UserToken.js";


const PROVIDER = "truelayer";
/*
   ========================
     Save Token
   ========================
*/
export async function saveToken(userId, tokenObj) {
  const connectionId = tokenObj.connectionId ?? null;

  let doc = await UserToken.findOne({ userId, provider: PROVIDER, connectionId })
    .select("+accessToken +refreshToken")
    .exec();

  if (!doc) doc = new UserToken({ userId, provider: PROVIDER, connectionId });

  doc.accessToken = tokenObj.accessToken;
  doc.refreshToken = tokenObj.refreshToken;
  doc.expiresAt = tokenObj.expiresAt;
  doc.scope = tokenObj.scope || "";

  await doc.save(); 
  return doc;
}
/*
   ========================
     Get Token
   ========================
*/
export async function getToken(userId) {
  return await UserToken.findOne({ userId, provider: "truelayer" })
    .select("+accessToken +refreshToken")
    .exec();
}

/*
   ========================
     Clear Token
   ========================
*/
export async function clearToken(userId) {
  return await UserToken.deleteMany({ userId, provider: "truelayer" });
}


