# wechat
 WeChat components

# Simple use
```javascript
const Wechat = require('@zctod/wechat').Wechat;
const config = {
    appid: '123',
    appsecret: '123'
};
const wechat = new Wechat(config);
```

# Wechat API
配置
```javascript
wechat.setConfig(config);
```
通过code换取个人网页授权access_token
```javascript
wechat.getAuth(code);
```
刷新access_token
```javascript
wechat.refreshToken(refreshToken);
```
检验授权凭证（access_token）是否有效
```javascript
wechat.auth(accessToken, openId);
```
获取用户个人信息
```javascript
wechat.getUserInfo(accessToken, openId);
```
获取公众号/小程序access_token
```javascript
wechat.getAccessToken();
```
# 微信公众号 API
wechat方法public都可直接调用。
```javascript
const Pub = require('@zctod/wechat').WechatPublic;
const pub = new Pub(config);
```
获取网页授权链接
```javascript
public.getAuthorizeUrl(redirectUri, scopeType, state = null);
```
检验微信开发者
```javascript
public.checkToken(nonce, timestamp, signature, echostr);
```
发送模板消息
```javascript
public.sendTemplate(tempObj);
```
配置自定义菜单
```javascript
public.changeMenu(obj);
```
公众号获取永久素材列表
```javascript
public.getmaterialList(type = 'news', offset = 0, count = 20);
```
获取jsapi_ticket
```javascript
public.getJsapiTicket();
```
js-sdk签名signature
```javascript
public.buildSignature(url);
```
# 微信小程序 API
wechat方法xcx都可直接调用。
```javascript
const Xcx = require('@zctod/wechat').WechatXcx;
const xcx = new Xcx(config);
```
code2Session(获取openid)
```javascript
public.getAuth(code);
```
发送模板消息
```javascript
public.sendTemplate(openId, tempId, formId, contentObj, page);
```
