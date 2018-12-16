'use strict';
const crypto = require('crypto');

class Xcx extends require('./wechat') {

    constructor(config) {
        super(config);
        this.setConfig(config);
    }

    /**
     * 检验数据的真实性，并且获取解密后的明文.
     * @param sessionKey string 用户在小程序登录后获取的会话密钥
     * @param encryptedData string 加密的用户数据
     * @param iv string 与用户数据一同返回的初始向量
     * @returns obj
     */
    decryptData(sessionKey, encryptedData, iv)
    {
        sessionKey = new Buffer(sessionKey, 'base64');
        encryptedData = new Buffer(encryptedData, 'base64');
        iv = new Buffer(iv, 'base64');
        try {
            // 解密
            const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
            decipher.setAutoPadding(true);// 设置自动 padding 为 true，删除填充补位
            let decoded = decipher.update(encryptedData, 'binary', 'utf8');
            decoded += decipher.final('utf8');
            decoded = JSON.parse(decoded);
            if (decoded.watermark.appid === this.appid) {
                return decoded;
            }
        } catch (err) {
            throw new Error('Illegal Buffer');
        }
        throw new Error('Illegal Buffer');
    }

    /**
     * code2Session(获取openid)
     * @param code
     * @returns {Promise<void>}
     */
    async getAuth( code )
    {
        const path = '/sns/jscode2session?appid=' + this.appid + '&secret=' + this.appsecret + '&js_code=' + code + '&grant_type=authorization_code';
        return await this.httpReq({ path });
    }

    /**
     * 发送模板消息
     * @param openId
     * @param tempId
     * @param formId
     * @param contentObj
     * @param page
     * @returns {Promise<void>}
     */
    async sendTemplate( openId, tempId, formId, contentObj, page )
    {
        const path = '/cgi-bin/message/wxopen/template/send?access_token=' + this.accessToken;
        const params = {
            'touser': openId,
            'template_id': tempId,
            'page': page || '',
            'form_id': formId,
            'data': contentObj,
        };
        return await this.httpReq({ path, params });
    }

    /**
     * 创建小程序支付
     * @param info obj { body, notifyUrl, openid, ip, amount }
     * @returns {Promise<*>}
     */
    async createPay(info = {})
    {
        const host = 'api.mch.weixin.qq.com';
        const path = '/pay/unifiedorder';
        const method = 'POST';
        const obj = {
            appid: this.appid,
            body: '支付测试',
            mch_id: this.mch_id || '',
            nonce_str: this.randomStr(32),
            notify_url: info.notifyUrl || '',
            openid: info.openid || '',
            out_trade_no: Math.round(new Date().getTime() / 1000).toString(),
            spbill_create_ip: info.ip || '127.0.0.1',
            total_fee: info.amount || 1,
            trade_type: 'JSAPI',
        };
        let arr = ['appid', 'body', 'mch_id', 'nonce_str', 'notify_url', 'openid', 'out_trade_no', 'spbill_create_ip', 'total_fee', 'trade_type'];
        let str = this.buildHttpQuery(obj, arr);
        str += '&key=' + this.mch_key;//key为商户平台设置的密钥key
        str = this.md5(str);
        str = str.toUpperCase();
        arr.push('sign');
        obj.sign = str;
        const params = this.objToXml(obj, arr);
        const headers = {
            "Content-Type": "text/xml; charset=utf-8",
            // "Content-Length": params.length,
        };
        const res = await this.httpReq({ host, path, params, method, headers });
        console.log(res);
        return this.xmlToObj(res);
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
                if (obj[v]) {
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
                if (obj.hasOwnProperty(key)) {
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

module.exports = Xcx;
