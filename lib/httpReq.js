'use strict';

const http = require('http');
const https = require('https');
const qs = require('querystring');

/**
 * http模块发送请求
 * @param  info object { host, port, path, params, method, headers, encoding }
 * @param security boolean
 */
function httpReq(info, security = false) {
    let options = {
        host: info.host,
        port: info.port || null,
        path: info.path || '/',
        method: info.method || 'GET',
        headers: info.headers || {},
    };
    const encoding = info.encoding || 'utf8';
    let params = info.params || '';
    params = qs.stringify(params);
    return new Promise(function (resolve, reject) {
        let data = '';
        let req = ( security === true ? https : http ).request(options, function(res) {
            res.setEncoding(encoding);
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                resolve({
                    result: true,
                    data: data
                });
            });
        });
        req.on('error', (e) => {
            resolve({
                result: false,
                errmsg: e.message
            });
        });
        req.write(params);
        req.end();
    });
}

module.exports = httpReq;
