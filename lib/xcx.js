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

}

module.exports = Xcx;
