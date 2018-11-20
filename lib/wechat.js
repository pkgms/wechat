'use strict';

const httpReq = require('./httpReq');
const host = 'api.weixin.qq.com';

/**
 * 微信接口
 */
class Wechat {}
/**
 * constructor
 * @param appId
 * @param appSecret
 */
Wechat.constructor = (appId, appSecret) => {
    this.appid = appId;
    this.appsecret = appSecret;
    this.host = host;
};
/**
 * 设置host
 * @param host
 */
Wechat.prototype.setHost = host => {
    this.host = host;
};
/**
 * 设置appid
 * @param appId
 */
Wechat.prototype.setAppid = appId => {
    this.appid = appId;
};
/**
 * 设置appsecret
 * @param appSecret
 */
Wechat.prototype.setAppsecret = appSecret => {
    this.appsecret = appSecret;
};
/**
 * 通过code换取个人网页授权access_token
 * @param code
 * @returns {Promise<void>}
 */
Wechat.prototype.getAuth = async code => {
    const path = '/sns/oauth2/access_token?appid=' + this.appid + '&secret=' + this.appsecret + '&code=' + code + '&grant_type=authorization_code';
    return await httpReq({ host, path }, true);
};
/**
 * 刷新access_token
 * @param refreshToken
 * @returns {Promise<void>}
 */
Wechat.prototype.refreshToken = async refreshToken => {
    const path = '/sns/oauth2/refresh_token?appid=' + this.appid + '&grant_type=refresh_token&refresh_token=' + refreshToken;
    return await httpReq({ host, path }, true);
};
/**
 * 检验授权凭证（access_token）是否有效
 * @param accessToken
 * @param openId
 * @returns {Promise<void>}
 */
Wechat.prototype.auth = async ( accessToken, openId ) => {
    const path = '/sns/auth?access_token=' + accessToken + '&openid=' + openId;
    return await httpReq({ host, path }, true);
};
/**
 * 获取用户个人信息
 * @param accessToken
 * @param openId
 * @returns {Promise<void>}
 */
Wechat.prototype.getUserInfo = async ( accessToken, openId ) => {
    const path = '/sns/userinfo?access_token=' + accessToken + '&openid=' + openId;
    return await httpReq({ host, path }, true);
};

module.exports = Wechat;
