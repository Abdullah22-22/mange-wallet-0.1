// creation of cookies for refresh and access token

const RefreshToken =(res,token) => {
    res.cookie('RefreshToken', token, {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000, 
        sameSite:'lax'
});
}
const AccessToken = (res, token) => {
    
    res.cookie('AccessToken', token, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,  
        sameSite: 'lax'
    });
}

export { RefreshToken, AccessToken };