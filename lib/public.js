'use strict';

const crypto = require('crypto');
const qs = require('querystring');

class Public extends require('./wechat') {

    constructor( config ) {
        super(config);
        this.setConfig(config);
    }

    /**
     * 获取网页授权链接
     * @param redirectUri
     * @param scopeType
     * @param state
     * @returns {string}
     */
    getAuthorizeUrl( redirectUri, scopeType, state = null )
    {
        const scope = scopeType === true ? 'snsapi_userinfo' : 'snsapi_base';
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + this.appid + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&response_type=code&scope=' + scope + '&state=' + state + '#wechat_redirect ';
    }

    /**
     * 检验微信开发者
     * @param nonce
     * @param timestamp
     * @param signature
     * @param echostr
     * @returns {*}
     */
    checkToken( nonce, timestamp, signature, echostr )
    {
        if (echostr) {
            let arr = [nonce, timestamp, this.token];
            arr.sort();
            //拼接成字符串,sha1加密 ，然后与signature进行校验
            const str = crypto.createHmac('sha1').update(arr.join('')).toString('base64');
            if ( str === signature ) {
                //第一次接入weixin api接口的时候
                return echostr;
            }
        }
        return false;
    }

    /**
     * 发送模板消息
     * @param tempObj
     * @returns {Promise<void>}
     */
    async sendTemplate( tempObj )
    {
        const path = '/cgi-bin/message/template/send?access_token=' + this.accessToken;
        return await this.httpReq({
            path,
            method: 'POST',
            params: tempObj,
        });
    }

    /**
     * 配置自定义菜单
     * @param obj
     * @returns {Promise<void>}
     */
    async changeMenu( obj )
    {
        const path = '/cgi-bin/menu/create?access_token=' + this.accessToken;
        return await this.httpReq({
            path,
            method: 'POST',
            params: obj,
        });
    }


    /**
     * 公众号获取永久素材列表
     * @param type  类型 图片image 视频video 语音voice 图文news
     * @param offset 从全部素材的该偏移位置开始返回，0表示从第一个素材 返回
     * @param count  返回素材的数量，取值在1到20之间
     * @return {Promise<void>} 返回信息列表
     */
    async getmaterialList( type = 'news', offset = 0, count = 20 )
    {
        const path = '/cgi-bin/material/batchget_material?access_token=' + this.accessToken;
        const data = {
            'type': type,
            'offset': offset,
            'count': count,
        };
        return await this.httpReq({
            path,
            method: 'POST',
            params: data,
        });
    }


    /**
     * 获取jsapi_ticket
     * @returns {Promise<void>}
     */
    async getJsapiTicket()
    {
        const path = '/cgi-bin/ticket/getticket?access_token=' + this.accessToken + '&type=jsapi';
        return await this.httpReq({ path });
    }

    /**
     * js-sdk签名signature
     * @param url 网页URL
     * @returns obj
     */
    buildSignature( url )
    {
        const ticketRes = this.getJsapiTicket();
        const ticket = ticketRes.data;
        let data = {};
        if(ticket['errcode'] === 0){
            data = {
                'jsapi_ticket': ticket['ticket'],
                'noncestr': this.createNoncestr(16),
                'timestamp': new Date().valueOf(),
            };
            const str = qs.stringify(data) + '&url=' + url;
            data['signature'] = crypto.createHmac('sha1').update(str);
            data['url'] = url;
            data['appId'] = this.appid;
        }
        return data;
    }

    createNoncestr( num )
    {
        const arr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
            'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
            '0','1','2','3','4','5','6','7','8','9'];
        let str = '';
        for(let i = 0; i < num; i++){
            str += arr[Math.ceil(Math.random() * 61)];
        }
        if(str.length !== num){
            str = this.createNoncestr(num);
        }
        return str;
    }
}

module.exports = Public;
