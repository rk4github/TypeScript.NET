/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
///<reference path="Primitive.d.ts"/>
///<reference path="Collections/Array/IArray.d.ts"/>
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _BOOLEAN = typeof true,
    _NUMBER = typeof 0,
    _STRING = typeof "",
    _OBJECT = typeof {},
    _UNDEFINED = typeof undefined,
    _FUNCTION = typeof function () {};
var typeInfoRegistry = {};

var TypeInfo = (function () {
    function TypeInfo(target) {
        _classCallCheck(this, TypeInfo);

        var _ = this;
        _.isBoolean = false;
        _.isNumber = false;
        _.isString = false;
        _.isTrueNaN = false;
        _.isObject = false;
        _.isFunction = false;
        _.isUndefined = false;
        _.isNull = false;
        _.isPrimitive = false;
        switch (_.type = typeof target) {
            case _BOOLEAN:
                _.isBoolean = true;
                _.isPrimitive = true;
                break;
            case _NUMBER:
                _.isNumber = true;
                _.isTrueNaN = isNaN(target);
                _.isFinite = isFinite(target);
                _.isValidNumber = !_.isTrueNaN;
                _.isPrimitive = true;
                break;
            case _STRING:
                _.isString = true;
                _.isPrimitive = true;
                break;
            case _OBJECT:
                _.target = target;
                if (target === null) {
                    _.isNull = true;
                    _.isNullOrUndefined = true;
                    _.isPrimitive = true;
                } else {
                    _.isObject = true;
                }
                break;
            case _FUNCTION:
                _.target = target;
                _.isString = true;
                break;
            case _UNDEFINED:
                _.isUndefined = true;
                _.isNullOrUndefined = true;
                _.isPrimitive = true;
                break;
            default:
                throw "Fatal type failure.  Unknown type: " + _.type;
        }
        Object.freeze(_);
    }

    _createClass(TypeInfo, [{
        key: "member",
        value: function member(name) {
            var t = this.target;
            return TypeInfo.getFor(t && name in t ? t[name] : undefined);
        }
    }], [{
        key: "getFor",
        value: function getFor(target) {
            var type = typeof target;
            switch (type) {
                case _OBJECT:
                case _FUNCTION:
                    return new TypeInfo(target);
            }
            var info = typeInfoRegistry[type];
            if (!info) typeInfoRegistry[type] = info = new TypeInfo(target);
            return info;
        }
    }]);

    return TypeInfo;
})();

exports.TypeInfo = TypeInfo;

var Type;
(function (Type) {
    Type.BOOLEAN = _BOOLEAN;
    Type.NUMBER = _NUMBER;
    Type.STRING = _STRING;
    Type.OBJECT = _OBJECT;
    Type.UNDEFINED = _UNDEFINED;
    Type.FUNCTION = _FUNCTION;
    function isBoolean(value) {
        return typeof value === _BOOLEAN;
    }
    Type.isBoolean = isBoolean;
    function isNumber(value) {
        var allowNaN = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        return typeof value === _NUMBER && (allowNaN || !isNaN(value));
    }
    Type.isNumber = isNumber;
    function isTrueNaN(value) {
        return typeof value === _NUMBER && isNaN(value);
    }
    Type.isTrueNaN = isTrueNaN;
    function isString(value) {
        return typeof value === _STRING;
    }
    Type.isString = isString;
    function isPrimitive(value) {
        var t = typeof value;
        switch (t) {
            case _BOOLEAN:
            case _STRING:
            case _NUMBER:
            case _UNDEFINED:
                return true;
            case _OBJECT:
                return value === null;
        }
        return false;
    }
    Type.isPrimitive = isPrimitive;
    function isFunction(value) {
        return typeof value === _FUNCTION;
    }
    Type.isFunction = isFunction;
    function isObject(value) {
        return typeof value === _OBJECT;
    }
    Type.isObject = isObject;
    function numberOrNaN(value) {
        return isNaN(value) ? NaN : value;
    }
    Type.numberOrNaN = numberOrNaN;
    function of(target) {
        return TypeInfo.getFor(target);
    }
    Type.of = of;
    function hasMember(value, property) {
        return value && !isPrimitive(value) && property in value;
    }
    Type.hasMember = hasMember;
    function hasMemberOfType(instance, property, type) {
        return hasMember(instance, property) && typeof instance[property] === type;
    }
    Type.hasMemberOfType = hasMemberOfType;
    function isInstanceOf(instance, type) {
        return instance instanceof type;
    }
    Type.isInstanceOf = isInstanceOf;
    function isArrayLike(instance) {
        return instance instanceof Array || hasMember(instance, "length");
    }
    Type.isArrayLike = isArrayLike;
})(Type || (Type = {}));
Object.freeze(Type);
exports["default"] = Type;
//# sourceMappingURL=Types.js.map
