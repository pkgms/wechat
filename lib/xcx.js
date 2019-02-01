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
        const params = JSON.stringify({
            'touser': openId,
            'template_id': tempId,
            'page': page || '',
            'form_id': formId,
            'data': contentObj,
        });
        return await this.httpReq({ path, params, method: 'POST' });
    }

    /**
     * 创建小程序支付
     * @param info obj { body, notifyUrl, openid, ip, amount, outTradeNo }
     * @returns {Promise<*>}
     */
    async createPay(info = {})
    {
        if (!info.notifyUrl) {
            throw new Error('notifyUrl is null');
        }
        const host = 'api.mch.weixin.qq.com';
        const path = '/pay/unifiedorder';
        const method = 'POST';
        const obj = {
            appid: this.appid,
            body: info.body || '支付测试',
            mch_id: this.mch_id || '',
            nonce_str: this.randomStr(32),
            notify_url: info.notifyUrl,
            openid: info.openid || '',
            out_trade_no: info.outTradeNo || Math.round(new Date().getTime() / 1000).toString(),
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
        return this.xmlToObj(res);
    }

    /**
     * 小程序支付签名
     * @param pkg
     * @returns {string}
     */
    buildSignature(pkg) {
        const obj = {
            appId: this.appid,
            nonceStr: this.randomStr(32),
            package: 'prepay_id=' + pkg,
            signType: 'MD5',
            timeStamp: Math.round((new Date()).valueOf() / 1000).toString(),
        };
        const arr = ['appId', 'nonceStr', 'package', 'signType', 'timeStamp'];
        let str = this.buildHttpQuery(obj, arr);
        str += '&key=' + this.mch_key;//key为商户平台设置的密钥key
        str = this.md5(str);
        obj.sign = str;
        return obj;
    }

}

module.exports = Xcx;
