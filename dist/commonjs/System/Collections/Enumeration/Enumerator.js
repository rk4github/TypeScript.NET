/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Types_1 = require("../../Types");
var ArrayEnumerator_1 = require("./ArrayEnumerator");
var IndexEnumerator_1 = require("./IndexEnumerator");
var VOID0 = void 0;

var EmptyEnumerator = function () {
    function EmptyEnumerator() {
        _classCallCheck(this, EmptyEnumerator);
    }

    _createClass(EmptyEnumerator, [{
        key: "moveNext",
        value: function moveNext() {
            return false;
        }
    }, {
        key: "nextValue",
        value: function nextValue() {
            return VOID0;
        }
    }, {
        key: "next",
        value: function next() {
            return {
                value: VOID0,
                done: true
            };
        }
    }, {
        key: "reset",
        value: function reset() {}
    }, {
        key: "dispose",
        value: function dispose() {}
    }, {
        key: "current",
        get: function get() {
            return VOID0;
        }
    }]);

    return EmptyEnumerator;
}();

var Empty = new EmptyEnumerator();
Object.freeze(Empty);
exports.empty = Empty;
function from(source) {
    if (!source) return Empty;
    if (Array.isArray(source)) return new ArrayEnumerator_1.default(source);
    if (Types_1.default.isArrayLike(source)) {
        return new IndexEnumerator_1.default(function () {
            return {
                source: source,
                length: source.length,
                pointer: 0,
                step: 1
            };
        });
    }
    if (!Types_1.default.isPrimitive(source)) {
        if (isEnumerable(source)) return source.getEnumerator();
    }
    throw new Error("Unknown enumerable.");
}
exports.from = from;
function isEnumerable(instance) {
    return Types_1.default.hasMemberOfType(instance, "getEnumerator", Types_1.default.FUNCTION);
}
exports.isEnumerable = isEnumerable;
function isEnumerableOrArrayLike(instance) {
    return Types_1.default.isArrayLike(instance) || isEnumerable(instance);
}
exports.isEnumerableOrArrayLike = isEnumerableOrArrayLike;
function isEnumerator(instance) {
    return Types_1.default.hasMemberOfType(instance, "moveNext", Types_1.default.FUNCTION);
}
exports.isEnumerator = isEnumerator;
function forEach(e, action) {
    if (e) {
        if (Types_1.default.isArrayLike(e)) {
            for (var i = 0; i < e.length; i++) {
                if (action(e[i], i) === false) break;
            }return;
        }
        if (isEnumerable(e)) {
            e = e.getEnumerator();
        }
        if (isEnumerator(e)) {
            var index = 0;
            while (e.moveNext()) {
                if (action(e.current, index++) === false) break;
            }
        }
    }
}
exports.forEach = forEach;
//# sourceMappingURL=Enumerator.js.map