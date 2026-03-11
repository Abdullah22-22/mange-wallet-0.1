// creation of cookies for refresh and access token
const RefreshToken = (res, token) => {
  res.cookie("RefreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const AccessToken = (res, token) => {
  res.cookie("AccessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
};

export { RefreshToken, AccessToken };