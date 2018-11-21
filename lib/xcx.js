'use strict';

class Xcx extends require('./wechat') {

    constructor(config) {
        super(config);
        this.setConfig(config);
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
