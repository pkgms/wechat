'use strict';

const httpReq = require('./httpReq');
const { Xcx } = require('./class');
const host = 'api.weixin.qq.com';

/**
 * constructor
 * @param appId
 * @param appSecret
 */
Xcx.constructor = (appId, appSecret, accessToken) => {
    this.appid = appId;
    this.appsecret = appSecret;
    this.appsecret = accessToken;
    this.host = host;
};
/**
 * 设置host
 * @param host
 */
Xcx.prototype.setHost = host => {
    this.host = host;
};
/**
 * 设置appid
 * @param appId
 */
Xcx.prototype.setAppid = appId => {
    this.appid = appId;
};
/**
 * 设置appsecret
 * @param appSecret
 */
Xcx.prototype.setAppsecret = appSecret => {
    this.appsecret = appSecret;
};
/**
 * 设置access_token
 * @param accessToken
 */
Xcx.prototype.setAccessToken = accessToken => {
    this.accessToken = accessToken;
};
/**
 * code2Session(获取openid)
 * @param code
 * @returns {Promise<void>}
 */
Xcx.prototype.getAuth = async code => {
    const path = '/sns/jscode2session?appid=' + this.appid + '&secret=' + this.appsecret + '&js_code=' + code + '&grant_type=authorization_code';
    return await httpReq({ host, path }, true);
};
/**
 * 发送模板消息
 * @param openId
 * @param tempId
 * @param formId
 * @param contentObj
 * @param page
 * @returns {Promise<void>}
 */
Xcx.prototype.sendTemplate = async ( openId, tempId, formId, contentObj, page ) => {
    const path = '/cgi-bin/message/wxopen/template/send?access_token=' + this.accessToken;
    const params = {
        'touser': openId,
        'template_id': tempId,
        'page': page || '',
        'form_id': formId,
        'data': contentObj,
    };
    return await httpReq({ host, path, params }, true);
};
