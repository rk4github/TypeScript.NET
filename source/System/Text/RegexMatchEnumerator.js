/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./RegularExpressions", "../Collections/Enumeration/Enumerator", "../Collections/Enumeration/EnumeratorBase"], factory);
    }
})(function (require, exports) {
    "use strict";
    var RegularExpressions_1 = require("./RegularExpressions");
    var Enumerator_1 = require("../Collections/Enumeration/Enumerator");
    var EnumeratorBase_1 = require("../Collections/Enumeration/EnumeratorBase");
    var RegexMatchEnumerator = (function () {
        function RegexMatchEnumerator(pattern) {
            if (pattern instanceof RegularExpressions_1.Regex) {
                this._pattern = pattern;
            }
            else {
                this._pattern = new RegularExpressions_1.Regex(pattern);
            }
        }
        RegexMatchEnumerator.prototype.matches = function (input) {
            var _this = this;
            var p;
            return new EnumeratorBase_1.default(function () {
                p = 0;
            }, function (yielder) {
                var match = _this._pattern.match(input, p);
                if (match.success) {
                    p = match.index + match.length;
                    return yielder.yieldReturn(match);
                }
                return yielder.yieldBreak();
            });
        };
        RegexMatchEnumerator.matches = function (input, pattern) {
            return input && pattern
                ? (new RegexMatchEnumerator(pattern)).matches(input)
                : Enumerator_1.empty;
        };
        return RegexMatchEnumerator;
    }());
    exports.RegexMatchEnumerator = RegexMatchEnumerator;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RegexMatchEnumerator.matches;
});
//# sourceMappingURL=RegexMatchEnumerator.js.map