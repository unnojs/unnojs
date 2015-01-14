/*------- Utilities ------- */
function isNull(value) { return (value === null || value === undefined); }
function isObject(value) { return (typeof value === 'object'); }
function isFunction(value) { return (typeof value === 'function'); }
function isArray(value) { return (value instanceof Array); }

function each(list, callback) {
    if (isNull(list) || isFunction(list)) return;
    for(var idx=0, count = list.length; idx<count; idx++) {
        callback(list[idx], idx);
    }
}

function _copy(from, to) {
    if(!from) return;
    Object.keys(from).forEach(function(key) {
        if (to.prototype) {
            to.prototype[key] = from[key];
        } else {
            to[key] = from[key];
        }
    });
}

module.exports = {
    each: each, // @deprecated, will be removed in next version
    merge: _copy, // @deprecated, will be removed in next version
    copy: _copy,
    isNull: isNull,
    isObject: isObject,
    isArray: isArray,
    isFunction: isFunction
};
