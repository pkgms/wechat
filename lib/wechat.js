'use strict';

const httpReq = require('./httpReq');
const host = 'api.weixin.qq.com';

/**
 * 微信接口
 */
class Wechat {

    constructor( config )
    {
        this.setConfig(config);
    }

    /**
     * 网路请求
     * @param obj
     * @param security
     * @returns {Promise<*>}
     */
     async httpReq ( obj, security = true )
     {
        const res = await httpReq({
            host: obj.host || this.host || host,
            port: obj.port || null,
            path: obj.path || null,
            params: obj.params || {},
            method: obj.method || 'GET',
            headers: obj.headers || {},
        }, security);
        return res.data ? res.data : res;
    }

    /**
     * 配置
     * @param config
     */
    setConfig( config )
    {
        if (['[Object Object]', '[object Object]'].indexOf(Object.prototype.toString.call(config)) > -1) {
            config.appid ? this.appid = config.appid : null;
            config.appsecret ? this.appsecret = config.appsecret : null;
            config.accessToken ? this.accessToken = config.accessToken : null;
            config.host ? this.host = config.host : null;
            config.token ? this.token = config.token : null;
        }
    }

    /**
     * 获取配置
     * @returns {*}
     */
    getConfig()
    {
        return this;
    }

    /**
     * 通过code换取个人网页授权access_token
     * @param code
     * @returns {Promise<void>}
     */
    async getAuth( code )
    {
        const path = '/sns/oauth2/access_token?appid=' + this.appid + '&secret=' + this.appsecret + '&code=' + code + '&grant_type=authorization_code';
        return await this.httpReq({ path });
    }

    /**
     * 刷新access_token
     * @param refreshToken
     * @returns {Promise<void>}
     */
    async refreshToken( refreshToken )
    {
        const path = '/sns/oauth2/refresh_token?appid=' + this.appid + '&grant_type=refresh_token&refresh_token=' + refreshToken;
        return await this.httpReq({ path });
    }

    /**
     * 检验授权凭证（access_token）是否有效
     * @param accessToken
     * @param openId
     * @returns {Promise<void>}
     */
    async auth( accessToken, openId )
    {
        const path = '/sns/auth?access_token=' + accessToken + '&openid=' + openId;
        return await this.httpReq({ path });
    }

    /**
     * 获取用户个人信息
     * @param accessToken
     * @param openId
     * @returns {Promise<void>}
     */
    async getUserInfo( accessToken, openId )
    {
        const path = '/sns/userinfo?access_token=' + accessToken + '&openid=' + openId;
        return await this.httpReq({ path });
    }

    /**
     * 获取公众号/小程序access_token
     * @returns {Promise<void>}
     */
    async getAccessToken()
    {
        const path = '/cgi-bin/token?grant_type=client_credential&appid=' + this.appid + '&secret=' + this.appsecret;
        return await this.httpReq({ path });
    }

}

module.exports = Wechat;
