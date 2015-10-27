var oauthshim = require('oauth-shim'),
    express = require('express');
 
var app = express();
app.listen(3000);
app.all('/oauth', oauthshim);
 
oauthshim.init({
    '3ea86a3e6b1e167680797d8ebfd525eb' : '692961567827f248'
});