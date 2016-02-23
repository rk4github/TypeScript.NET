/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
///<reference path="ISerializable.d.ts"/>
///<reference path="../Primitive.d.ts"/>
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Types', '../Exceptions/InvalidOperationException'], factory);
    }
})(function (require, exports) {
    "use strict";
    var Types_1 = require('../Types');
    var InvalidOperationException_1 = require('../Exceptions/InvalidOperationException');
    var EMPTY = '', TRUE = 'true', FALSE = 'false';
    function toString(value, defaultForUnknown) {
        var v = value;
        switch (typeof v) {
            case Types_1.default.UNDEFINED:
            case Types_1.default.STRING:
                return v;
            case Types_1.default.BOOLEAN:
                return v ? TRUE : FALSE;
            case Types_1.default.NUMBER:
                return EMPTY + v;
            default:
                if (v === null)
                    return v;
                if (isSerializable(v))
                    return v.serialize();
                else if (arguments.length > 1)
                    return defaultForUnknown;
                var ex = new InvalidOperationException_1.default('Attempting to serialize unidentifiable type.');
                ex.data['value'] = v;
                throw ex;
        }
    }
    exports.toString = toString;
    function isSerializable(instance) {
        return Types_1.default.hasMemberOfType(instance, 'serialize', Types_1.default.FUNCTION);
    }
    exports.isSerializable = isSerializable;
    function toPrimitive(value, caseInsensitive, unknownHandler) {
        if (value) {
            if (caseInsensitive)
                value = value.toLowerCase();
            switch (value) {
                case 'null':
                    return null;
                case Types_1.default.UNDEFINED:
                    return undefined;
                case TRUE:
                    return true;
                case FALSE:
                    return false;
                default:
                    var cleaned = value.replace(/^\s+|,|\s+$/g, EMPTY);
                    if (cleaned) {
                        if (/^\d+$/g.test(cleaned)) {
                            var int = parseInt(cleaned);
                            if (!isNaN(int))
                                return int;
                        }
                        else {
                            var number = parseFloat(value);
                            if (!isNaN(number))
                                return number;
                        }
                    }
                    // TODO: Handle Dates...  Possibly JSON?
                    // Instead of throwing we allow for handling...
                    if (unknownHandler)
                        value = unknownHandler(value);
                    break;
            }
        }
        return value;
    }
    exports.toPrimitive = toPrimitive;
});
//# sourceMappingURL=Utility.js.map