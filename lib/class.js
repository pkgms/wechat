'use strict';

const Wechat = require('./wechat');
class Public {}//微信公众号
class Xcx {}//微信小程序
function extend(self, parent) {
    for (let key in parent.prototype) {
        if (parent.prototype.hasOwnProperty(key)) {
            self.prototype[key] = parent.prototype[key];
        }
    }
    return self;
}
extend(Public, Wechat);
extend(Xcx, Wechat);

module.exports = { Public, Xcx };
