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
        const resObj = res.data ? res.data : res;
        return isJsonString(resObj) ? JSON.parse(resObj) : resObj;
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
            config.mchId ? this.mch_id = config.mchId : null;
            config.mchKey ? this.mch_key = config.mchKey : null;
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

    /**
     * md5加密
     * @param str
     * @param salt
     * @returns {string}
     */
    md5(str, salt) {
        salt = salt || '';
        const md5sum = crypto.createHash('md5');
        return md5sum.update(str + salt).digest('hex');
    }

    /**
     * 对象转xml
     * @param obj
     * @param arr 固定标签名
     * @returns {*}
     */
    objToXml(obj, arr)
    {
        if (!obj || typeof obj !== 'object') {
            return;
        }
        let status = true;
        let xml = '<xml>\n';
        if (Array.isArray(arr) && arr.length > 0) {
            for (let v of arr) {
                if (obj[v] || obj[v] === '') {
                    xml += '<' + v + '>' + obj[v] + '</' + v + '>\n';
                } else {
                    status = false;
                    break;
                }
            }
        } else {
            for (let key of obj) {
                if (obj.hasOwnProperty(key)) {
                    xml += '<' + key + '>' + obj[key] + '</' + key + '>\n';
                } else {
                    status = false;
                    break;
                }
            }
        }
        if (!status) {
            return;
        }
        xml += '</xml>';
        return xml;
    }

    /**
     * xml转obj
     * @param xml
     * @returns {*}
     */
    xmlToObj(xml)
    {
        let obj = {};
        try {
            const array = xml.replace('<xml>', '').replace('\n</xml>', '').split('\n');
            for (let a of array) {
                const arr = a.replace(/<\/(.*)>/g, '')
                    .replace(/><!\[CDATA\[/g, ',')
                    .replace(/]]>/g, '')
                    .replace(/</g, '')
                    .split(',');
                obj[arr[0]] = arr[1];
            }
        } catch (e) {}
        return obj;
    }

    /**
     * 对象转httpQuery
     * @param obj
     * @param arr
     * @returns {string}
     */
    buildHttpQuery(obj, arr)
    {
        if (!obj || typeof obj !== 'object') {
            return;
        }
        let status = true;
        let str = '';
        if (Array.isArray(arr) && arr.length > 0) {
            for (let v of arr) {
                if (obj[v] || obj[v] === '') {
                    if (str !== '') {
                        str += '&';
                    }
                    str += v + '=' + obj[v];
                } else {
                    status = false;
                    break;
                }
            }
        } else {
            for (let key of obj) {
                if (obj.hasOwnProperty(key) || obj[key] === '') {
                    if (str !== '') {
                        str += '&';
                    }
                    str += key + '=' + obj[key];
                } else {
                    status = false;
                    break;
                }
            }
        }
        if (!status) {
            return;
        }
        return str;
    }

    /**
     * 生成唯一值
     * @param length
     * @param res
     * @returns {*}
     */
    randomStr(length, res) {
        res = res || '';
        res += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.ceil(Math.random() * 61)];
        if (res.length < length) {
            return this.randomStr(length, res);
        }
        return res;
    }

}

//判断字符串为json字符串
function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) === 'object') {
            return true;
        }
    } catch(e) {
        return false;
    }
}

module.exports = Wechat;
