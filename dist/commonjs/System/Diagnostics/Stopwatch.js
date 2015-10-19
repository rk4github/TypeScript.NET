/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TimeTimeSpan = require('../Time/TimeSpan');

var _TimeTimeSpan2 = _interopRequireDefault(_TimeTimeSpan);

var Stopwatch = (function () {
    function Stopwatch() {
        _classCallCheck(this, Stopwatch);

        this.reset();
    }

    _createClass(Stopwatch, [{
        key: 'record',
        value: function record(closure) {
            var e = Stopwatch.measure(closure);
            this._elapsed += e.milliseconds;
            return e;
        }
    }, {
        key: 'start',
        value: function start() {
            var _ = this;
            if (!_._isRunning) {
                _._startTimeStamp = Stopwatch.getTimestampMilliseconds();
                _._isRunning = true;
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            var _ = this;
            if (_._isRunning) {
                _._elapsed += _.currentLapMilliseconds;
                _._isRunning = false;
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            var _ = this;
            _._elapsed = 0;
            _._isRunning = false;
            _._startTimeStamp = NaN;
        }
    }, {
        key: 'lap',
        value: function lap() {
            var _ = this;
            if (_._isRunning) {
                var t = Stopwatch.getTimestampMilliseconds();
                var s = _._startTimeStamp;
                var e = t - s;
                _._startTimeStamp = t;
                _._elapsed += e;
                return new _TimeTimeSpan2['default'](e);
            } else return _TimeTimeSpan2['default'].zero;
        }
    }, {
        key: 'isRunning',
        get: function get() {
            return this._isRunning;
        }
    }, {
        key: 'currentLapMilliseconds',
        get: function get() {
            return this._isRunning ? Stopwatch.getTimestampMilliseconds() - this._startTimeStamp : 0;
        }
    }, {
        key: 'currentLap',
        get: function get() {
            return this._isRunning ? new _TimeTimeSpan2['default'](this.currentLapMilliseconds) : _TimeTimeSpan2['default'].zero;
        }
    }, {
        key: 'elapsedMilliseconds',
        get: function get() {
            var _ = this;
            var timeElapsed = _._elapsed;
            if (_._isRunning) timeElapsed += _.currentLapMilliseconds;
            return timeElapsed;
        }
    }, {
        key: 'elapsed',
        get: function get() {
            return new _TimeTimeSpan2['default'](this.elapsedMilliseconds);
        }
    }], [{
        key: 'getTimestampMilliseconds',
        value: function getTimestampMilliseconds() {
            return new Date().getTime();
        }
    }, {
        key: 'startNew',
        value: function startNew() {
            var s = new Stopwatch();
            s.start();
            return s;
        }
    }, {
        key: 'measure',
        value: function measure(closure) {
            var start = Stopwatch.getTimestampMilliseconds();
            closure();
            return new _TimeTimeSpan2['default'](Stopwatch.getTimestampMilliseconds() - start);
        }
    }]);

    return Stopwatch;
})();

exports['default'] = Stopwatch;
module.exports = exports['default'];
//# sourceMappingURL=Stopwatch.js.map
