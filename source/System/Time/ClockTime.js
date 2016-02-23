var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './TimeQuantity'], factory);
    }
})(function (require, exports) {
    ///<reference path="ITimeMeasurement.d.ts"/>
    ///<reference path="ITimeQuantity.d.ts"/>
    ///<reference path="../IEquatable.d.ts"/>
    ///<reference path="../IComparable.d.ts"/>
    ///<reference path="../IFormattable.d.ts"/>
    ///<reference path="../IFormatProvider.d.ts"/>
    ///<reference path="ITimeStamp.d.ts"/>
    ///<reference path="HowMany.ts"/>
    /*
     * @author electricessence / https://github.com/electricessence/
     * Originally based upon .NET source but with many additions and improvements.
     * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
     */
    'use strict'; // For compatibility with (let, const, function, class);
    var TimeQuantity_1 = require('./TimeQuantity');
    var ClockTime = (function (_super) {
        __extends(ClockTime, _super);
        function ClockTime() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.call(this, args.length > 1
                ? ClockTime.millisecondsFromTime(args[0] || 0, args[1] || 0, args.length > 2 && args[2] || 0, args.length > 3 && args[3] || 0)
                : (args.length > 0 && args[0] || 0));
            var _ = this;
            var ms = Math.abs(_.getTotalMilliseconds());
            var msi = Math.floor(ms);
            _.tick = (ms - msi) * 10000 /* Millisecond */;
            _.days = (msi / 86400000 /* Day */) | 0;
            msi -= _.days * 86400000 /* Day */;
            _.hour = (msi / 3600000 /* Hour */) | 0;
            msi -= _.hour * 3600000 /* Hour */;
            _.minute = (msi / 60000 /* Minute */) | 0;
            msi -= _.minute * 60000 /* Minute */;
            _.second = (msi / 1000 /* Second */) | 0;
            msi -= _.second * 1000 /* Second */;
            _.millisecond = msi;
            Object.freeze(_);
        }
        // Static version for relative consistency.  Constructor does allow this format.
        ClockTime.from = function (hours, minutes, seconds, milliseconds) {
            if (seconds === void 0) { seconds = 0; }
            if (milliseconds === void 0) { milliseconds = 0; }
            return new ClockTime(hours, minutes, seconds, milliseconds);
        };
        ClockTime.millisecondsFromTime = function (hours, minutes, seconds, milliseconds) {
            if (seconds === void 0) { seconds = 0; }
            if (milliseconds === void 0) { milliseconds = 0; }
            var value = hours;
            value *= 60 /* Hour */;
            value += minutes;
            value *= 60 /* Minute */;
            value += seconds;
            value *= 1000 /* Second */;
            value += milliseconds;
            return value;
        };
        ClockTime.prototype.toString = function () {
            /* INSERT CUSTOM FORMATTING CODE HERE */
            var _ = this, a = [];
            if (_.days)
                a.push(pluralize(_.days, "day"));
            if (_.hour)
                a.push(pluralize(_.hour, "hour"));
            if (_.minute)
                a.push(pluralize(_.minute, "minute"));
            if (_.second)
                a.push(pluralize(_.second, "second"));
            if (a.length > 1)
                a.splice(a.length - 1, 0, "and");
            return a.join(", ").replace(", and, ", " and ");
        };
        return ClockTime;
    }(TimeQuantity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ClockTime;
    // Temporary until the full TimeSpanFormat is available.
    function pluralize(value, label) {
        if (Math.abs(value) !== 1)
            label += "s";
        return label;
    }
});
//# sourceMappingURL=ClockTime.js.map