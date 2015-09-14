/*
 * @author electricessence / https://github.com/electricessence/
 * Original: http://linqjs.codeplex.com/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../System/System', '../System/Types', '../System/Functions', '../System/Collections/Arrays/Utility', '../System/Collections/Enumeration/ArrayEnumerator', '../System/Collections/Enumeration/Enumerator', '../System/Collections/Enumeration/EnumeratorBase', '../System/Collections/Dictionaries/Dictionary', '../System/Collections/Queue', '../System/Disposable/Utility', '../System/Disposable/DisposableBase', './Grouping', './Lookup', './ArrayEnumerable', './WhereEnumerable', './WhereSelectEnumerable', './OrderedEnumerable'], function (require, exports, System, Types, BaseFunctions, ArrayUtility, ArrayEnumerator, Enumerator, EnumeratorBase, Dictionary, Queue, DisposeUtility, DisposableBase, Grouping, Lookup, ArrayEnumerable, WhereEnumerable, WhereSelectEnumerable, OrderedEnumerable) {
    var using = DisposeUtility.using;
    var enumeratorFrom = Enumerator.from;
    var enumeratorForEach = Enumerator.forEach;
    'use strict';
    // #region Local Constants.
    // Leave internal to avoid accidental overwriting.
    var LinqFunctions = (function (_super) {
        __extends(LinqFunctions, _super);
        function LinqFunctions() {
            _super.apply(this, arguments);
        }
        LinqFunctions.prototype.Greater = function (a, b) { return a > b ? a : b; };
        LinqFunctions.prototype.Lesser = function (a, b) { return a < b ? a : b; };
        return LinqFunctions;
    })(BaseFunctions);
    var Functions = new LinqFunctions();
    Object.freeze(Functions);
    var INT_0 = 0 | 0, INT_NEGATIVE_1 = -1 | 0, INT_POSITIVE_1 = +1 | 0;
    // #endregion
    var EnumerableAction;
    (function (EnumerableAction) {
        EnumerableAction[EnumerableAction["Break"] = 0] = "Break";
        EnumerableAction[EnumerableAction["Return"] = 1] = "Return";
        EnumerableAction[EnumerableAction["Skip"] = 2] = "Skip";
    })(EnumerableAction || (EnumerableAction = {}));
    Object.freeze(EnumerableAction);
    var Enumerable = (function (_super) {
        __extends(Enumerable, _super);
        // Enumerable<T> is an instance class that has useful statics.
        // In C# Enumerable<T> is not an instance but has extensions for IEnumerable<T>.
        // In this case, we use Enumerable<T> as the underlying class that is being chained.
        function Enumerable(enumeratorFactory, finalizer) {
            _super.call(this, finalizer);
            this.enumeratorFactory = enumeratorFactory;
        }
        Enumerable.fromArray = function (array) {
            return new ArrayEnumerable(array);
        };
        Enumerable.from = function (source) {
            if ("getEnumerator" in source)
                return source;
            if (source instanceof Array || typeof source === Types.Object && "length" in source)
                return Enumerable.fromArray(source);
            throw new Error("Unsupported enumerable.");
        };
        Enumerable.toArray = function (source) {
            if (source instanceof Array)
                return source.slice();
            if (typeof source === Types.Object && "length" in source)
                source = Enumerable.fromArray(source);
            if (source instanceof Enumerable)
                return source.toArray();
            if ("getEnumerator" in source) {
                var result = [];
                enumeratorForEach(source.getEnumerator(), function (e, i) {
                    result[i] = e;
                });
                return result;
            }
            throw new Error("Unsupported enumerable.");
        };
        // #region IEnumerable<T> Implementation...
        Enumerable.prototype.getEnumerator = function () {
            this.assertIsNotDisposed();
            return this.enumeratorFactory();
        };
        // #endregion
        // #region IDisposable override...
        Enumerable.prototype._onDispose = function () {
            _super.prototype._onDispose.call(this);
            this.enumeratorFactory = null;
        };
        // #endregion
        //////////////////////////////////////////
        // #region Static Methods...
        Enumerable.choice = function (values) {
            return new Enumerable(function () {
                return new EnumeratorBase(null, function (yielder) {
                    return yielder.yieldReturn(values[(Math.random() * values.length) | 0]);
                });
            });
        };
        Enumerable.cycle = function (values) {
            return new Enumerable(function () {
                var index = INT_0; // Let the compiler know this is an int.
                return new EnumeratorBase(function () { index = INT_0; }, function (yielder) {
                    if (index >= values.length)
                        index = INT_0;
                    return yielder.yieldReturn(values[index++]);
                });
            });
        };
        Enumerable.empty = function () {
            return new Enumerable(function () {
                return new EnumeratorBase(null, Functions.False);
            });
        };
        Enumerable.repeat = function (element, count) {
            if (count === void 0) { count = Infinity; }
            if (isNaN(count) || count <= 0)
                return Enumerable.empty();
            return isFinite(count) && assertInteger(count, "count")
                ? new Enumerable(function () {
                    var c = count | 0; // Force integer evaluation.
                    var index = INT_0;
                    return new EnumeratorBase(function () { index = INT_0; }, function (yielder) { return (index++ < c) && yielder.yieldReturn(element); });
                })
                : new Enumerable(function () {
                    return new EnumeratorBase(null, function (yielder) { return yielder.yieldReturn(element); });
                });
        };
        // Note: this enumeration does not break.
        Enumerable.repeatWithFinalize = function (initializer, finalizer) {
            return new Enumerable(function () {
                var element;
                return new EnumeratorBase(function () { element = initializer(); }, function (yielder) { return yielder.yieldReturn(element); }, function () { finalizer(element); });
            });
        };
        Enumerable.make = function (element) {
            return Enumerable.repeat(element, INT_POSITIVE_1);
        };
        // start and step can be other than integer.
        Enumerable.range = function (start, count, step) {
            if (start === void 0) { start = 0; }
            if (count === void 0) { count = Infinity; }
            if (step === void 0) { step = 1; }
            if (!isFinite(start))
                throw new Error("Must have a valid 'start' value.");
            if (isNaN(count) || count <= 0)
                return Enumerable.empty();
            if (!isFinite(step))
                throw new Error("Must have a valid 'step' value.");
            return isFinite(count) && assertInteger(count, "count")
                ? new Enumerable(function () {
                    var value;
                    var c = count | 0; // Force integer evaluation.
                    var index = INT_0;
                    return new EnumeratorBase(function () {
                        index = INT_0;
                        value = start;
                    }, function (yielder) {
                        var result = index++ < c
                            && yielder.yieldReturn(value);
                        if (result && index < count)
                            value += step;
                        return result;
                    });
                })
                : new Enumerable(function () {
                    var value;
                    return new EnumeratorBase(function () {
                        value = start;
                    }, function (yielder) {
                        var current = value;
                        value += step;
                        return yielder.yieldReturn(current);
                    });
                });
        };
        Enumerable.rangeDown = function (start, count, step) {
            if (start === void 0) { start = 0; }
            if (count === void 0) { count = Infinity; }
            if (step === void 0) { step = 1; }
            step = Math.abs(step) * -1;
            return Enumerable.range(start, count, step);
        };
        // step = -1 behaves the same as toNegativeInfinity;
        Enumerable.toInfinity = function (start, step) {
            if (start === void 0) { start = 0; }
            if (step === void 0) { step = 1; }
            return Enumerable.range(start, Infinity, step);
        };
        Enumerable.toNegativeInfinity = function (start, step) {
            if (start === void 0) { start = 0; }
            if (step === void 0) { step = 1; }
            return Enumerable.rangeDown(start, Infinity, step);
        };
        Enumerable.rangeTo = function (start, to, step) {
            if (start === void 0) { start = 0; }
            if (to === void 0) { to = Infinity; }
            if (step === void 0) { step = 1; }
            if (!isFinite(start))
                throw new Error("Must have a valid 'start' value.");
            if (isNaN(to))
                throw new Error("Must have a valid 'to' value.");
            if (!isFinite(step))
                throw new Error("Must have a valid 'step' value.");
            // This way we adjust for the delta from start and to so the user can say +/- step and it will work as expected.
            step = Math.abs(step);
            // Range to infinity has a more efficient mechanism.
            if (!isFinite(to))
                return Enumerable.range(start, Infinity, (start < to) ? (+step) : (-step));
            return new Enumerable(function () {
                var value;
                return start < to
                    ? new EnumeratorBase(function () { value = start; }, function (yielder) {
                        var result = value <= to && yielder.yieldReturn(value);
                        if (result)
                            value += step;
                        return result;
                    })
                    : new EnumeratorBase(function () { value = start; }, function (yielder) {
                        var result = value >= to && yielder.yieldReturn(value);
                        if (result)
                            value -= step;
                        return result;
                    });
            });
        };
        Enumerable.matches = function (input, pattern, flags) {
            if (flags === void 0) { flags = ""; }
            var type = typeof input;
            if (type != Types.String)
                throw new Error("Cannot exec RegExp matches of type '" + type + "'.");
            if (pattern instanceof RegExp) {
                flags += (pattern.ignoreCase) ? "i" : "";
                flags += (pattern.multiline) ? "m" : "";
                pattern = pattern.source;
            }
            if (flags.indexOf("g") === -1)
                flags += "g";
            return new Enumerable(function () {
                var regex;
                return new EnumeratorBase(function () { regex = new RegExp(pattern, flags); }, function (yielder) {
                    // Calling regex.exec consecutively on the same input uses the lastIndex to start the next match.
                    var match = regex.exec(input);
                    return (match !== null) ? yielder.yieldReturn(match) : false;
                });
            });
        };
        Enumerable.generate = function (factory, count) {
            if (count === void 0) { count = Infinity; }
            if (isNaN(count) || count <= 0)
                return Enumerable.empty();
            return isFinite(count) && assertInteger(count, "count")
                ? new Enumerable(function () {
                    var c = count | 0; // Force integer evaluation.
                    var index = INT_0;
                    return new EnumeratorBase(function () { index = INT_0; }, function (yielder) {
                        var current = index++;
                        return current < c && yielder.yieldReturn(factory(current));
                    });
                })
                : new Enumerable(function () {
                    var index = INT_0;
                    return new EnumeratorBase(function () { index = INT_0; }, function (yielder) { return yielder.yieldReturn(factory(index++)); });
                });
        };
        Enumerable.unfold = function (seed, valueFactory, skipSeed) {
            if (skipSeed === void 0) { skipSeed = false; }
            return new Enumerable(function () {
                var index = INT_0;
                var value;
                var isFirst;
                return new EnumeratorBase(function () {
                    index = INT_0;
                    value = seed;
                    isFirst = !skipSeed;
                }, function (yielder) {
                    var i = index++;
                    if (isFirst)
                        isFirst = false;
                    else
                        value = valueFactory(value, i);
                    return yielder.yieldReturn(value);
                });
            });
        };
        Enumerable.defer = function (enumerableFactory) {
            return new Enumerable(function () {
                var enumerator;
                return new EnumeratorBase(function () { enumerator = enumerableFactory().getEnumerator(); }, function (yielder) { return enumerator.moveNext() && yielder.yieldReturn(enumerator.current); }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        Enumerable.forEach = function (enumerable, action) {
            Enumerable.forEach(enumerable, action);
        };
        // Slightly optimized versions for numbers.
        Enumerable.max = function (values) {
            return values
                .takeUntil(function (v) { return v == +Infinity; }, true)
                .aggregate(Functions.Greater);
        };
        Enumerable.min = function (values) {
            return values
                .takeUntil(function (v) { return v == -Infinity; }, true)
                .aggregate(Functions.Lesser);
        };
        // #endregion
        //////////////////////////////////////////
        // #region Instance methods...
        Enumerable.prototype.assertIsNotDisposed = function (errorMessage) {
            if (errorMessage === void 0) { errorMessage = "Enumerable was disposed."; }
            return _super.prototype.assertIsNotDisposed.call(this, errorMessage);
        };
        Enumerable.prototype.forEach = function (action) {
            var _ = this;
            _.assertIsNotDisposed();
            var index = INT_0;
            // Return value of action can be anything, but if it is (===) false then the forEach will discontinue.
            using(_.getEnumerator(), function (e) {
                // It is possible that subsequently 'action' could cause the enumeration to dispose, so we have to check each time.
                while (_.assertIsNotDisposed() && e.moveNext()) {
                    if (action(e.current, index++) === false)
                        break;
                }
            });
        };
        // #region Conversion Methods
        Enumerable.prototype.toArray = function (predicate) {
            var result = [];
            if (predicate)
                return this.where(predicate).toArray();
            this.forEach(function (x, i) { result[i] = x; });
            return result;
        };
        // Return a default (unfiltered) enumerable.
        Enumerable.prototype.asEnumerable = function () {
            var _ = this;
            return new Enumerable(function () { return _.getEnumerator(); });
        };
        Enumerable.prototype.toLookup = function (keySelector, elementSelector, compareSelector) {
            if (elementSelector === void 0) { elementSelector = Functions.Identity; }
            if (compareSelector === void 0) { compareSelector = Functions.Identity; }
            var dict = new Dictionary(compareSelector);
            this.forEach(function (x) {
                var key = keySelector(x);
                var element = elementSelector(x);
                var array = dict.get(key);
                if (array !== undefined)
                    array.push(element);
                else
                    dict.addByKeyValue(key, [element]);
            });
            return new Lookup(dict);
        };
        Enumerable.prototype.toMap = function (keySelector, elementSelector) {
            var obj = {};
            this.forEach(function (x) { obj[keySelector(x)] = elementSelector(x); });
            return obj;
        };
        Enumerable.prototype.toDictionary = function (keySelector, elementSelector, compareSelector) {
            if (compareSelector === void 0) { compareSelector = Functions.Identity; }
            var dict = new Dictionary(compareSelector);
            this.forEach(function (x) { return dict.addByKeyValue(keySelector(x), elementSelector(x)); });
            return dict;
        };
        Enumerable.prototype.toJoinedString = function (separator, selector) {
            if (separator === void 0) { separator = ""; }
            if (selector === void 0) { selector = Functions.Identity; }
            return this.select(selector).toArray().join(separator);
        };
        Enumerable.prototype.doAction = function (action) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    index = INT_0;
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    while (enumerator.moveNext()) {
                        var actionResult = action(enumerator.current, index++);
                        if (actionResult === false || actionResult === EnumerableAction)
                            return yielder.yieldBreak();
                        if (actionResult !== 2)
                            return yielder.yieldReturn(enumerator.current);
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator); });
            }, 
            // Using a finalizer value reduces the chance of a circular reference
            // since we could simply reference the enumeration and check e.wasDisposed.
            // Using a finalizer value reduces the chance of a circular reference
            // since we could simply reference the enumeration and check e.wasDisposed.
            function () { disposed = true; });
        };
        Enumerable.prototype.force = function (defaultAction) {
            if (defaultAction === void 0) { defaultAction = EnumerableAction.Break; }
            this.assertIsNotDisposed();
            this.doAction(function (element) { return defaultAction; });
        };
        // #region Indexing/Paging methods.
        Enumerable.prototype.skip = function (count) {
            var _ = this;
            _.assertIsNotDisposed();
            if (!count || isNaN(count) || count < 0)
                return _;
            if (!isFinite(count))
                return Enumerable.empty();
            assertInteger(count, "count");
            var c = count | 0;
            return this.doAction(function (element, index) {
                return index < c
                    ? EnumerableAction.Skip
                    : EnumerableAction.Return;
            });
        };
        Enumerable.prototype.skipWhile = function (predicate) {
            this.assertIsNotDisposed();
            var skipping = true;
            return this.doAction(function (element, index) {
                if (skipping)
                    skipping = predicate(element, index);
                return skipping ? EnumerableAction.Skip : EnumerableAction.Return;
            });
        };
        Enumerable.prototype.take = function (count) {
            if (!count || isNaN(count) || count < 0)
                return Enumerable.empty();
            var _ = this;
            _.assertIsNotDisposed();
            if (!isFinite(count))
                return _;
            assertInteger(count, "count");
            var c = count | 0;
            // Once action returns false, the enumeration will stop.
            return _.doAction(function (element, index) { return index < c; });
        };
        Enumerable.prototype.takeWhile = function (predicate) {
            this.assertIsNotDisposed();
            return this.doAction(function (element, index) {
                return predicate(element, index)
                    ? EnumerableAction.Return
                    : EnumerableAction.Break;
            });
        };
        // Is like the inverse of take While with the ability to return the value identified by the predicate.
        Enumerable.prototype.takeUntil = function (predicate, includeUntilValue) {
            this.assertIsNotDisposed();
            if (!includeUntilValue)
                return this.doAction(function (element, index) {
                    return predicate(element, index)
                        ? EnumerableAction.Break
                        : EnumerableAction.Return;
                });
            var found = false;
            return this.doAction(function (element, index) {
                if (found)
                    return EnumerableAction.Break;
                found = predicate(element, index);
                return EnumerableAction.Return;
            });
        };
        Enumerable.prototype.takeExceptLast = function (count) {
            if (count === void 0) { count = 1; }
            var _ = this;
            if (!count || isNaN(count) || count <= 0)
                return _;
            if (!isFinite(count))
                return Enumerable.empty();
            assertInteger(count, "count");
            var c = count | 0;
            return new Enumerable(function () {
                var enumerator;
                var q;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    q = new Queue();
                }, function (yielder) {
                    while (enumerator.moveNext()) {
                        // Add the next one to the queue.
                        q.enqueue(enumerator.current);
                        // Did we reach our quota?
                        if (q.count > c)
                            // Okay then, start returning results.
                            return yielder.yieldReturn(q.dequeue());
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator, q); });
            });
        };
        Enumerable.prototype.takeFromLast = function (count) {
            if (!count || isNaN(count) || count <= 0)
                return Enumerable.empty();
            var _ = this;
            if (!isFinite(count))
                return _.reverse();
            assertInteger(count, "count");
            return _.reverse().take(count | 0);
        };
        // #endregion
        // #region Projection and Filtering Methods
        Enumerable.prototype.traverseBreadthFirst = function (func, resultSelector) {
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                var nestLevel = INT_0;
                var buffer, len;
                return new EnumeratorBase(function () {
                    nestLevel = INT_0;
                    buffer = [];
                    len = 0;
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    while (true) {
                        if (enumerator.moveNext()) {
                            buffer[len++] = enumerator.current;
                            return yielder.yieldReturn(resultSelector(enumerator.current, nestLevel));
                        }
                        if (!len)
                            return yielder.yieldBreak();
                        var next = Enumerable
                            .fromArray(buffer)
                            .selectMany(func);
                        if (!next.any()) {
                            return yielder.yieldBreak();
                        }
                        else {
                            nestLevel++;
                            buffer = [];
                            len = 0;
                            enumerator.dispose();
                            enumerator = next.getEnumerator();
                        }
                    }
                }, function () {
                    DisposeUtility.dispose(enumerator);
                    buffer.length = 0;
                });
            });
        };
        Enumerable.prototype.traverseDepthFirst = function (func, resultSelector) {
            var _ = this;
            return new Enumerable(function () {
                // Dev Note: May want to consider using an actual stack and not an array.
                var enumeratorStack = [];
                var enumerator;
                var len; // Avoid using push/pop since they query .length every time and can be slower.
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    len = 0;
                }, function (yielder) {
                    while (true) {
                        if (enumerator.moveNext()) {
                            var value = resultSelector(enumerator.current, len);
                            enumeratorStack[len++] = enumerator;
                            enumerator = func(enumerator.current).getEnumerator();
                            return yielder.yieldReturn(value);
                        }
                        if (len == 0)
                            return false;
                        enumerator.dispose();
                        enumerator = enumeratorStack[--len];
                        enumeratorStack.length = len;
                    }
                }, function () {
                    try {
                        DisposeUtility.dispose(enumerator);
                    }
                    finally {
                        DisposeUtility.disposeThese(enumeratorStack);
                    }
                });
            });
        };
        Enumerable.prototype.flatten = function () {
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                var middleEnumerator = null;
                return new EnumeratorBase(function () { enumerator = _.getEnumerator(); }, function (yielder) {
                    while (true) {
                        if (middleEnumerator != null) {
                            if (middleEnumerator.moveNext()) {
                                return yielder.yieldReturn(middleEnumerator.current);
                            }
                            else {
                                middleEnumerator = null;
                            }
                        }
                        if (enumerator.moveNext()) {
                            var c = enumerator.current;
                            if (c instanceof Array) {
                                middleEnumerator.dispose();
                                middleEnumerator = Enumerable.fromArray(c)
                                    .selectMany(Functions.Identity)
                                    .flatten()
                                    .getEnumerator();
                                continue;
                            }
                            else {
                                return yielder.yieldReturn(enumerator.current);
                            }
                        }
                        return false;
                    }
                }, function () {
                    DisposeUtility.dispose(enumerator, middleEnumerator);
                });
            });
        };
        Enumerable.prototype.pairwise = function (selector) {
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    enumerator.moveNext();
                }, function (yielder) {
                    var prev = enumerator.current;
                    return enumerator.moveNext()
                        && yielder.yieldReturn(selector(prev, enumerator.current));
                }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        Enumerable.prototype.scan = function (func, seed) {
            var isUseSeed = seed !== undefined; // For now...
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                var value;
                var isFirst;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    isFirst = true;
                }, function (yielder) {
                    if (isFirst) {
                        isFirst = false;
                        //noinspection JSUnusedAssignment
                        return isUseSeed
                            ? yielder.yieldReturn(value = seed)
                            : enumerator.moveNext() && yielder.yieldReturn(value = enumerator.current);
                    }
                    return (enumerator.moveNext())
                        ? yielder.yieldReturn(value = func(value, enumerator.current))
                        : false;
                }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        // #endregion
        Enumerable.prototype.select = function (selector) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            if (selector.length < 2)
                return new WhereSelectEnumerable(_, null, selector);
            return new Enumerable(function () {
                var enumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    index = INT_0;
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    return enumerator.moveNext()
                        ? yielder.yieldReturn(selector(enumerator.current, index++))
                        : false;
                }, function () { DisposeUtility.dispose(enumerator); });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.selectMany = function (collectionSelector, resultSelector) {
            var _ = this;
            if (!resultSelector)
                resultSelector = function (a, b) { return b; };
            return new Enumerable(function () {
                var enumerator;
                var middleEnumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    middleEnumerator = undefined;
                    index = INT_0;
                }, function (yielder) {
                    // Just started, and nothing to enumerate? End.
                    if (middleEnumerator === undefined && !enumerator.moveNext())
                        return false;
                    // moveNext has been called at least once...
                    do {
                        // Initialize middle if there isn't one.
                        if (!middleEnumerator) {
                            var middleSeq = collectionSelector(enumerator.current, index++);
                            // Collection is null?  Skip it...
                            if (!middleSeq)
                                continue;
                            middleEnumerator = Enumerator.from(middleSeq);
                        }
                        if (middleEnumerator.moveNext())
                            return yielder.yieldReturn(resultSelector(enumerator.current, middleEnumerator.current));
                        // else no more in this middle?  Then clear and reset for next...
                        middleEnumerator.dispose();
                        middleEnumerator = null;
                    } while (enumerator.moveNext());
                    return false;
                }, function () {
                    DisposeUtility.dispose(enumerator, middleEnumerator);
                    enumerator = null;
                    middleEnumerator = null;
                });
            });
        };
        Enumerable.prototype.choose = function (selector) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    index = INT_0;
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    while (enumerator.moveNext()) {
                        var result = selector(enumerator.current, index++);
                        if (result !== null && result !== undefined)
                            return yielder.yieldReturn(result);
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator); });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.where = function (predicate) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            if (predicate.length < 2)
                return new WhereEnumerable(_, predicate);
            return new Enumerable(function () {
                var enumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    index = INT_0;
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    while (enumerator.moveNext()) {
                        if (predicate(enumerator.current, index++))
                            return yielder.yieldReturn(enumerator.current);
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator); });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.ofType = function (type) {
            var typeName;
            switch (type) {
                case Number:
                    typeName = Types.Number;
                    break;
                case String:
                    typeName = Types.String;
                    break;
                case Boolean:
                    typeName = Types.Boolean;
                    break;
                case Function:
                    typeName = Types.Function;
                    break;
                default:
                    typeName = null;
                    break;
            }
            return ((typeName === null)
                ? this.where(function (x) { return x instanceof type; })
                : this.where(function (x) { return typeof x === typeName; }));
        };
        Enumerable.prototype.except = function (second, compareSelector) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                var keys;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    enumerator = _.getEnumerator();
                    keys = new Dictionary(compareSelector);
                    if (second)
                        Enumerable.forEach(second, function (key) { return keys.addByKeyValue(key, true); });
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    while (enumerator.moveNext()) {
                        var current = enumerator.current;
                        if (!keys.containsKey(current)) {
                            keys.addByKeyValue(current, true);
                            return yielder.yieldReturn(current);
                        }
                    }
                    return false;
                }, function () {
                    DisposeUtility.dispose(enumerator);
                    keys.clear();
                });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.distinct = function (compareSelector) {
            return this.except(null, compareSelector);
        };
        // [0,0,0,1,1,1,2,2,2,0,0,0] results in [0,1,2,0];
        Enumerable.prototype.distinctUntilChanged = function (compareSelector) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                var compareKey;
                var initial = true;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    while (enumerator.moveNext()) {
                        var key = compareSelector(enumerator.current);
                        if (initial) {
                            initial = false;
                        }
                        else if (compareKey === key) {
                            continue;
                        }
                        compareKey = key;
                        return yielder.yieldReturn(enumerator.current);
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator); });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.reverse = function () {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var buffer;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    buffer = _.toArray();
                    index = buffer.length | 0;
                }, function (yielder) {
                    return index > INT_0
                        && yielder.yieldReturn(buffer[--index]);
                }, function () { buffer.length = 0; });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.shuffle = function () {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var buffer;
                var capacity;
                var len;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    buffer = _.toArray();
                    capacity = len = buffer.length;
                }, function (yielder) {
                    // Avoid using major array operations like .slice();
                    if (!len)
                        return yielder.yieldBreak();
                    var selectedIndex = (Math.random() * len) | 0;
                    var selectedValue = buffer[selectedIndex];
                    buffer[selectedIndex] = buffer[--len]; // Take the last one and put it here.
                    buffer[len] = null; // clear possible reference.
                    if (len % 32 == 0)
                        buffer.length = len;
                    return yielder.yieldReturn(selectedValue);
                }, function () { buffer.length = 0; });
            }, function () { disposed = true; });
        };
        Enumerable.prototype.count = function (predicate) {
            var _ = this;
            _.assertIsNotDisposed();
            var count = INT_0;
            if (predicate) {
                _.forEach(function (x, i) {
                    if (predicate(x, i))
                        ++count;
                });
            }
            else {
                _.forEach(function () {
                    ++count;
                });
            }
            return count;
        };
        // Akin to '.every' on an array.
        Enumerable.prototype.all = function (predicate) {
            var result = true;
            this.forEach(function (x) {
                if (!predicate(x)) {
                    result = false;
                    return false; // break
                }
            });
            return result;
        };
        // 'every' has been added here for parity/compatibility with an array.
        Enumerable.prototype.every = function (predicate) {
            return this.all(predicate);
        };
        // Akin to '.some' on an array.
        Enumerable.prototype.any = function (predicate) {
            var result = false;
            // Splitting the forEach up this way reduces iterative processing.
            // forEach handles the generation and disposal of the enumerator.
            if (predicate) {
                this.forEach(function (x) {
                    result = predicate(x); // false = not found and therefore it should continue.  true = found and break;
                    return !result;
                });
            }
            else {
                this.forEach(function () {
                    result = true;
                    return false;
                });
            }
            return result;
        };
        // 'some' has been added here for parity/compatibility with an array.
        Enumerable.prototype.some = function (predicate) {
            return this.any(predicate);
        };
        Enumerable.prototype.isEmpty = function () {
            return !this.any();
        };
        Enumerable.prototype.contains = function (value, compareSelector) {
            return compareSelector
                ? this.any(function (v) { return compareSelector(v) === compareSelector(value); })
                : this.any(function (v) { return v === value; });
        };
        // Originally has an overload for a predicate,
        // but that's a bad idea since this could be an enumeration of functions and therefore fail the intent.
        // Better to chain a where statement first to be more explicit.
        Enumerable.prototype.indexOf = function (value, compareSelector) {
            var found = INT_NEGATIVE_1;
            if (compareSelector)
                this.forEach(function (element, i) {
                    if (System.areEqual(compareSelector(element), compareSelector(value), true)) {
                        found = i;
                        return false;
                    }
                });
            else
                this.forEach(function (element, i) {
                    // Why?  Because NaN doesn't equal NaN. :P
                    if (System.areEqual(element, value, true)) {
                        found = i;
                        return false;
                    }
                });
            return found;
        };
        Enumerable.prototype.lastIndexOf = function (value, compareSelector) {
            var result = INT_NEGATIVE_1;
            if (compareSelector)
                this.forEach(function (element, i) {
                    if (System.areEqual(compareSelector(element), compareSelector(value), true))
                        result = i;
                });
            else
                this.forEach(function (element, i) {
                    if (System.areEqual(element, value, true))
                        result = i;
                });
            return result;
        };
        Enumerable.prototype.defaultIfEmpty = function (defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                var isFirst;
                return new EnumeratorBase(function () {
                    isFirst = true;
                    assertIsNotDisposed(disposed);
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    if (enumerator.moveNext()) {
                        isFirst = false;
                        return yielder.yieldReturn(enumerator.current);
                    }
                    else if (isFirst) {
                        isFirst = false;
                        return yielder.yieldReturn(defaultValue);
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        Enumerable.prototype.zip = function (second, resultSelector) {
            var _ = this;
            return new Enumerable(function () {
                var firstEnumerator;
                var secondEnumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    index = INT_0;
                    firstEnumerator = _.getEnumerator();
                    secondEnumerator = enumeratorFrom(second);
                }, function (yielder) {
                    return firstEnumerator.moveNext() && secondEnumerator.moveNext()
                        && yielder.yieldReturn(resultSelector(firstEnumerator.current, secondEnumerator.current, index++));
                }, function () {
                    DisposeUtility.dispose(firstEnumerator, secondEnumerator);
                });
            });
        };
        Enumerable.prototype.zipMultiple = function (second, resultSelector) {
            var _ = this;
            if (!second.length)
                return Enumerable.empty();
            return new Enumerable(function () {
                var secondTemp;
                var firstEnumerator;
                var secondEnumerator;
                var index = INT_0;
                return new EnumeratorBase(function () {
                    secondTemp = new Queue(second);
                    index = INT_0;
                    firstEnumerator = _.getEnumerator();
                    secondEnumerator = null;
                }, function (yielder) {
                    if (firstEnumerator.moveNext()) {
                        while (true) {
                            while (!secondEnumerator) {
                                if (secondTemp.count) {
                                    var next = secondTemp.dequeue();
                                    if (next)
                                        secondEnumerator = enumeratorFrom(next);
                                }
                                else
                                    return yielder.yieldBreak();
                            }
                            if (secondEnumerator.moveNext())
                                return yielder.yieldReturn(resultSelector(firstEnumerator.current, secondEnumerator.current, index++));
                            secondEnumerator.dispose();
                            secondEnumerator = null;
                        }
                    }
                    return yielder.yieldBreak();
                }, function () {
                    DisposeUtility.dispose(firstEnumerator, secondTemp);
                });
            });
        };
        // #region Join Methods
        Enumerable.prototype.join = function (inner, outerKeySelector, innerKeySelector, resultSelector, compareSelector) {
            if (compareSelector === void 0) { compareSelector = Functions.Identity; }
            var _ = this;
            return new Enumerable(function () {
                var outerEnumerator;
                var lookup;
                var innerElements = null;
                var innerCount = INT_0;
                return new EnumeratorBase(function () {
                    outerEnumerator = _.getEnumerator();
                    lookup = Enumerable.from(inner)
                        .toLookup(innerKeySelector, Functions.Identity, compareSelector);
                }, function (yielder) {
                    while (true) {
                        if (innerElements != null) {
                            var innerElement = innerElements[innerCount++];
                            if (innerElement !== undefined)
                                return yielder.yieldReturn(resultSelector(outerEnumerator.current, innerElement));
                            innerElement = null;
                            innerCount = INT_0;
                        }
                        if (outerEnumerator.moveNext()) {
                            var key = outerKeySelector(outerEnumerator.current);
                            innerElements = lookup.get(key);
                        }
                        else {
                            return yielder.yieldBreak();
                        }
                    }
                }, function () { DisposeUtility.dispose(outerEnumerator); });
            });
        };
        Enumerable.prototype.groupJoin = function (inner, outerKeySelector, innerKeySelector, resultSelector, compareSelector) {
            if (compareSelector === void 0) { compareSelector = Functions.Identity; }
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                var lookup = null;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    lookup = Enumerable.from(inner)
                        .toLookup(innerKeySelector, Functions.Identity, compareSelector);
                }, function (yielder) {
                    return enumerator.moveNext()
                        && yielder.yieldReturn(resultSelector(enumerator.current, lookup.get(outerKeySelector(enumerator.current))));
                }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        Enumerable.prototype.concatWith = function (other) {
            var _ = this;
            return new Enumerable(function () {
                var firstEnumerator;
                var secondEnumerator;
                return new EnumeratorBase(function () {
                    firstEnumerator = _.getEnumerator();
                }, function (yielder) {
                    if (firstEnumerator != null) {
                        if (firstEnumerator.moveNext())
                            return yielder.yieldReturn(firstEnumerator.current);
                        secondEnumerator = enumeratorFrom(other);
                        firstEnumerator.dispose();
                        firstEnumerator = null;
                    }
                    if (secondEnumerator.moveNext())
                        return yielder.yieldReturn(secondEnumerator.current);
                    return false;
                }, function () {
                    DisposeUtility.dispose(firstEnumerator, secondEnumerator);
                });
            });
        };
        Enumerable.prototype.merge = function (enumerables) {
            var _ = this;
            if (!enumerables.length)
                return _;
            if (enumerables.length == 1)
                return _.concatWith(enumerables[0]);
            return new Enumerable(function () {
                var enumerator;
                var queue;
                return new EnumeratorBase(function () {
                    // 1) First get our values...
                    enumerator = _.getEnumerator();
                    queue = new Queue(enumerables);
                }, function (yielder) {
                    while (true) {
                        while (!enumerator && queue.count) {
                            enumerator = enumeratorFrom(queue.dequeue()); // 4) Keep going and on to step 2.  Else fall through to yieldBreak().
                        }
                        if (enumerator && enumerator.moveNext())
                            return yielder.yieldReturn(enumerator.current);
                        if (enumerator) {
                            enumerator.dispose();
                            enumerator = null;
                            continue;
                        }
                        return yielder.yieldBreak();
                    }
                }, function () {
                    DisposeUtility.dispose(enumerator, queue); // Just in case this gets disposed early.
                });
            });
        };
        Enumerable.prototype.concat = function () {
            var enumerables = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                enumerables[_i - 0] = arguments[_i];
            }
            var _ = this;
            if (enumerables.length == 0)
                return _;
            if (enumerables.length == 1)
                return _.concatWith(enumerables[0]);
            return _.merge(enumerables);
        };
        Enumerable.prototype.insertAt = function (index, other) {
            if (isNaN(index) || index < 0 || !isFinite(index))
                throw new Error("'index' is invalid or out of bounds.");
            assertInteger(index, "index");
            var n = index | 0;
            var _ = this;
            _.assertIsNotDisposed();
            return new Enumerable(function () {
                var firstEnumerator;
                var secondEnumerator;
                var count = INT_0;
                var isEnumerated = false;
                return new EnumeratorBase(function () {
                    count = INT_0;
                    firstEnumerator = _.getEnumerator();
                    secondEnumerator = enumeratorFrom(other);
                    isEnumerated = false;
                }, function (yielder) {
                    if (count == n) {
                        isEnumerated = true;
                        if (secondEnumerator.moveNext())
                            return yielder.yieldReturn(secondEnumerator.current);
                    }
                    if (firstEnumerator.moveNext()) {
                        count++;
                        return yielder.yieldReturn(firstEnumerator.current);
                    }
                    return !isEnumerated
                        && secondEnumerator.moveNext()
                        && yielder.yieldReturn(secondEnumerator.current);
                }, function () {
                    DisposeUtility.dispose(firstEnumerator, secondEnumerator);
                });
            });
        };
        Enumerable.prototype.alternateMultiple = function (sequence) {
            var _ = this;
            return new Enumerable(function () {
                var buffer, mode, enumerator, alternateEnumerator;
                return new EnumeratorBase(function () {
                    // Instead of recalling getEnumerator every time, just reset the existing one.
                    alternateEnumerator = new ArrayEnumerator(Enumerable.toArray(sequence)); // Freeze
                    enumerator = _.getEnumerator();
                    var hasAtLeastOne = enumerator.moveNext();
                    mode = hasAtLeastOne
                        ? EnumerableAction.Return
                        : EnumerableAction.Break;
                    if (hasAtLeastOne)
                        buffer = enumerator.current;
                }, function (yielder) {
                    switch (mode) {
                        case EnumerableAction.Break:
                            return yielder.yieldBreak();
                        case EnumerableAction.Skip:
                            if (alternateEnumerator.moveNext())
                                return yielder.yieldReturn(alternateEnumerator.current);
                            alternateEnumerator.reset();
                            mode = EnumerableAction.Return;
                            break;
                    }
                    var latest = buffer;
                    // Set up the next round...
                    // Is there another one?  Set the buffer and setup instruct for the next one to be the alternate.
                    var another = enumerator.moveNext();
                    mode = another
                        ? EnumerableAction.Skip
                        : EnumerableAction.Break;
                    if (another)
                        buffer = enumerator.current;
                    return yielder.yieldReturn(latest);
                }, function () {
                    DisposeUtility.dispose(enumerator, alternateEnumerator);
                });
            });
        };
        Enumerable.prototype.alternateSingle = function (value) {
            return this.alternateMultiple(Enumerable.make(value));
        };
        Enumerable.prototype.alternate = function () {
            var sequence = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                sequence[_i - 0] = arguments[_i];
            }
            return this.alternateMultiple(sequence);
        };
        Enumerable.prototype.intersect = function (second, compareSelector) {
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                var keys;
                var outs;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    keys = new Dictionary(compareSelector);
                    outs = new Dictionary(compareSelector);
                    Enumerable.from(second)
                        .forEach(function (key) { keys.addByKeyValue(key, true); });
                }, function (yielder) {
                    while (enumerator.moveNext()) {
                        var current = enumerator.current;
                        if (!outs.containsKey(current) && keys.containsKey(current)) {
                            outs.addByKeyValue(current, true);
                            return yielder.yieldReturn(current);
                        }
                    }
                    return yielder.yieldBreak();
                }, function () { DisposeUtility.dispose(enumerator); }); // Should Dictionary be IDisposable?
            });
        };
        Enumerable.prototype.sequenceEqual = function (second, equalityComparer) {
            if (equalityComparer === void 0) { equalityComparer = System.areEqual; }
            return using(this.getEnumerator(), function (e1) { return using(Enumerable.from(second).getEnumerator(), function (e2) {
                while (e1.moveNext()) {
                    if (!e2.moveNext() || !equalityComparer(e1.current, e2.current))
                        return false;
                }
                return !e2.moveNext();
            }); });
        };
        Enumerable.prototype.union = function (second, compareSelector) {
            if (compareSelector === void 0) { compareSelector = Functions.Identity; }
            var source = this;
            return new Enumerable(function () {
                var firstEnumerator;
                var secondEnumerator;
                var keys;
                return new EnumeratorBase(function () {
                    firstEnumerator = source.getEnumerator();
                    keys = new Dictionary(compareSelector);
                }, function (yielder) {
                    var current;
                    if (secondEnumerator === undefined) {
                        while (firstEnumerator.moveNext()) {
                            current = firstEnumerator.current;
                            if (!keys.containsKey(current)) {
                                keys.addByKeyValue(current, null);
                                return yielder.yieldReturn(current);
                            }
                        }
                        secondEnumerator = Enumerable.from(second).getEnumerator();
                    }
                    while (secondEnumerator.moveNext()) {
                        current = secondEnumerator.current;
                        if (!keys.containsKey(current)) {
                            keys.addByKeyValue(current, null);
                            return yielder.yieldReturn(current);
                        }
                    }
                    return false;
                }, function () {
                    DisposeUtility.dispose(firstEnumerator, secondEnumerator);
                });
            });
        };
        // #endregion
        // #region Ordering Methods
        Enumerable.prototype.orderBy = function (keySelector) {
            if (keySelector === void 0) { keySelector = Functions.Identity; }
            return new OrderedEnumerable(this, keySelector, false);
        };
        Enumerable.prototype.orderByDescending = function (keySelector) {
            if (keySelector === void 0) { keySelector = Functions.Identity; }
            return new OrderedEnumerable(this, keySelector, true);
        };
        /*
         weightedSample(weightSelector) {
         weightSelector = Utils.createLambda(weightSelector);
         var source = this;
    
         return new Enumerable<T>(() => {
         var sortedByBound;
         var totalWeight = 0;
    
         return new EnumeratorBase<T>(
         () => {
         sortedByBound = source
         .choose(function (x) {
         var weight = weightSelector(x);
         if (weight <= 0) return null; // ignore 0
    
         totalWeight += weight;
         return { value: x, bound: totalWeight }
         })
         .toArray();
         },
         () => {
         if (sortedByBound.length > 0) {
         var draw = (Math.random() * totalWeight)|0 + 1;
    
         var lower = -1 | 0;
         var upper = sortedByBound.length;
         while (upper - lower > 1) {
         var index = ((lower + upper) / 2) | 0;
         if (sortedByBound[index].bound >= draw) {
         upper = index;
         }
         else {
         lower = index;
         }
         }
    
         return (<any>this).yieldReturn(sortedByBound[upper].value);
         }
    
         return (<any>this).yieldBreak();
         },
         Functions.Blank);
         });
         }
         */
        // #endregion
        // #region Grouping Methods
        // Originally contained a result selector (not common use), but this could be done simply by a select statement after.
        Enumerable.prototype.groupBy = function (keySelector, elementSelector, compareSelector) {
            if (elementSelector === void 0) { elementSelector = Functions.Identity; }
            var _ = this;
            return new Enumerable(function () { return _.toLookup(keySelector, elementSelector, compareSelector)
                .getEnumerator(); });
        };
        Enumerable.prototype.partitionBy = function (keySelector, elementSelector, resultSelector, compareSelector) {
            if (elementSelector === void 0) { elementSelector = Functions.Identity; }
            if (resultSelector === void 0) { resultSelector = function (key, elements) { return new Grouping(key, elements); }; }
            if (compareSelector === void 0) { compareSelector = Functions.Identity; }
            var _ = this;
            return new Enumerable(function () {
                var enumerator;
                var key;
                var compareKey;
                var group;
                var len;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                    if (enumerator.moveNext()) {
                        key = keySelector(enumerator.current);
                        compareKey = compareSelector(key);
                        group = [elementSelector(enumerator.current)];
                        len = 1;
                    }
                    else
                        group = null;
                }, function (yielder) {
                    if (!group)
                        return yielder.yieldBreak();
                    var hasNext, c;
                    while ((hasNext = enumerator.moveNext())) {
                        c = enumerator.current;
                        if (compareKey === compareSelector(keySelector(c)))
                            group[len++] = elementSelector(c);
                        else
                            break;
                    }
                    var result = resultSelector(key, group);
                    if (hasNext) {
                        c = enumerator.current;
                        key = keySelector(c);
                        compareKey = compareSelector(key);
                        group = [elementSelector(c)];
                        len = 1;
                    }
                    else {
                        group = null;
                    }
                    return yielder.yieldReturn(result);
                }, function () {
                    DisposeUtility.dispose(enumerator);
                    group = null;
                });
            });
        };
        // #endregion
        Enumerable.prototype.buffer = function (size) {
            if (size < 1 || !isFinite(size))
                throw new Error("Invalid buffer size.");
            assertInteger(size, "size");
            var _ = this, len;
            return new Enumerable(function () {
                var enumerator;
                return new EnumeratorBase(function () {
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    var array = ArrayUtility.initialize(size);
                    len = 0;
                    while (len < size && enumerator.moveNext) {
                        array[len++] = enumerator.current;
                    }
                    array.length = len;
                    return len && yielder.yieldReturn(array);
                }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        // #region Aggregate Methods
        Enumerable.prototype.aggregate = function (func, seed) {
            return this.scan(func, seed).lastOrDefault();
        };
        Enumerable.prototype.average = function (selector) {
            if (selector === void 0) { selector = numberOrNaN; }
            var sum = 0;
            // This allows for infinity math that doesn't destroy the other values.
            var sumInfinite = 0; // Needs more investigation since we are really trying to retain signs.
            var count = 0; // No need to make integer if the result could be a float.
            this.forEach(function (x) {
                var value = selector(x);
                if (isNaN(value)) {
                    sum = NaN;
                    return false;
                }
                if (isFinite(value))
                    sum += value;
                else
                    sumInfinite += value > 0 ? (+1) : (-1);
                ++count;
            });
            if (sumInfinite)
                return sumInfinite * Infinity;
            return (isNaN(sum) || !count)
                ? NaN
                : (sum / count);
        };
        // If using numbers, it may be useful to call .takeUntil(v=>v==Infinity,true) before calling max. See static versions for numbers.
        Enumerable.prototype.max = function () {
            return this.aggregate(Functions.Greater);
        };
        Enumerable.prototype.min = function () {
            return this.aggregate(Functions.Lesser);
        };
        Enumerable.prototype.maxBy = function (keySelector) {
            if (keySelector === void 0) { keySelector = Functions.Identity; }
            return this.aggregate(function (a, b) { return (keySelector(a) > keySelector(b)) ? a : b; });
        };
        Enumerable.prototype.minBy = function (keySelector) {
            if (keySelector === void 0) { keySelector = Functions.Identity; }
            return this.aggregate(function (a, b) { return (keySelector(a) < keySelector(b)) ? a : b; });
        };
        // Addition...  Only works with numerical enumerations.
        Enumerable.prototype.sum = function (selector) {
            if (selector === void 0) { selector = numberOrNaN; }
            var sum = 0;
            // This allows for infinity math that doesn't destroy the other values.
            var sumInfinite = 0; // Needs more investigation since we are really trying to retain signs.
            this.forEach(function (x) {
                var value = selector(x);
                if (isNaN(value)) {
                    sum = NaN;
                    return false;
                }
                if (isFinite(value))
                    sum += value;
                else
                    sumInfinite += value > 0 ? (+1) : (-1);
            });
            return isNaN(sum) ? NaN : (sumInfinite ? (sumInfinite * Infinity) : sum);
        };
        // Multiplication...
        Enumerable.prototype.product = function (selector) {
            if (selector === void 0) { selector = numberOrNaN; }
            var result = 1, exists = false;
            this.forEach(function (x) {
                exists = true;
                var value = selector(x);
                if (isNaN(value)) {
                    result = NaN;
                    return false;
                }
                if (value == 0) {
                    result = 0; // Multiplying by zero will always end in zero.
                    return false;
                }
                // Multiplication can never recover from infinity and simply must retain signs.
                // You could cancel out infinity with 1/infinity but no available representation exists.
                result *= value;
            });
            return (exists && isNaN(result)) ? NaN : result;
        };
        // #endregion
        // #region Single Value Return...
        Enumerable.prototype.elementAt = function (index) {
            if (isNaN(index) || index < 0 || !isFinite(index))
                throw new Error("'index' is invalid or out of bounds.");
            assertInteger(index, "index");
            var n = index | 0;
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x, i) {
                if (i == n) {
                    value = x;
                    found = true;
                    return false;
                }
            });
            if (!found)
                throw new Error("index is less than 0 or greater than or equal to the number of elements in source.");
            return value;
        };
        Enumerable.prototype.elementAtOrDefault = function (index, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            if (isNaN(index) || index < 0 || !isFinite(index))
                throw new Error("'index' is invalid or out of bounds.");
            assertInteger(index, "index");
            var n = index | 0;
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x, i) {
                if (i == n) {
                    value = x;
                    found = true;
                    return false;
                }
            });
            return (!found) ? defaultValue : value;
        };
        /* Note: Unlike previous implementations, you could pass a predicate into these methods.
         * But since under the hood it ends up calling .where(predicate) anyway,
         * it may be better to remove this to allow for a cleaner signature/override.
         * JavaScript/TypeScript does not easily allow for a strict method interface like C#.
         * Having to write extra override logic is error prone and confusing to the consumer.
         * Removing the predicate here may also cause the consumer of this method to think more about how they structure their query.
         * The end all difference is that the user must declare .where(predicate) before .first().
         * */
        Enumerable.prototype.first = function () {
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x) {
                value = x;
                found = true;
                return false;
            });
            if (!found)
                throw new Error("first:No element satisfies the condition.");
            return value;
        };
        Enumerable.prototype.firstOrDefault = function (defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x) {
                value = x;
                found = true;
                return false;
            });
            return (!found) ? defaultValue : value;
        };
        Enumerable.prototype.last = function () {
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x) {
                found = true;
                value = x;
            });
            if (!found)
                throw new Error("last:No element satisfies the condition.");
            return value;
        };
        Enumerable.prototype.lastOrDefault = function (defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x) {
                found = true;
                value = x;
            });
            return (!found) ? defaultValue : value;
        };
        Enumerable.prototype.single = function () {
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x) {
                if (!found) {
                    found = true;
                    value = x;
                }
                else
                    throw new Error("single:sequence contains more than one element.");
            });
            if (!found)
                throw new Error("single:No element satisfies the condition.");
            return value;
        };
        Enumerable.prototype.singleOrDefault = function (defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var _ = this;
            _.assertIsNotDisposed();
            var value = undefined;
            var found = false;
            _.forEach(function (x) {
                if (!found) {
                    found = true;
                    value = x;
                }
                else
                    throw new Error("single:sequence contains more than one element.");
            });
            return (!found) ? defaultValue : value;
        };
        // #endregion
        Enumerable.prototype.share = function () {
            var _ = this;
            _.assertIsNotDisposed();
            var sharedEnumerator;
            return new Enumerable(function () {
                return new EnumeratorBase(function () {
                    // assertIsNotDisposed(disposed);  This doesn't need an assertion since disposing the underlying enumerable disposes the enumerator.
                    if (!sharedEnumerator)
                        sharedEnumerator = _.getEnumerator();
                }, function (yielder) {
                    return sharedEnumerator.moveNext()
                        && yielder.yieldReturn(sharedEnumerator.current);
                });
            }, function () {
                DisposeUtility.dispose(sharedEnumerator);
            });
        };
        Enumerable.prototype.memoize = function () {
            var _ = this, disposed = !_.assertIsNotDisposed();
            var cache;
            var enumerator;
            return new Enumerable(function () {
                var index = INT_0;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    if (!enumerator)
                        enumerator = _.getEnumerator();
                    if (!cache)
                        cache = [];
                    index = INT_0;
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    var i = index++;
                    if (i >= cache.length) {
                        return (enumerator.moveNext())
                            ? yielder.yieldReturn(cache[i] = enumerator.current)
                            : false;
                    }
                    return yielder.yieldReturn(cache[i]);
                });
            }, function () {
                disposed = true;
                if (cache)
                    cache.length = 0;
                cache = null;
                DisposeUtility.dispose(enumerator);
                enumerator = null;
            });
        };
        // #region Error Handling
        Enumerable.prototype.catchError = function (handler) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                return new EnumeratorBase(function () {
                    try {
                        assertIsNotDisposed(disposed);
                        enumerator = _.getEnumerator();
                    }
                    catch (e) {
                    }
                }, function (yielder) {
                    try {
                        assertIsNotDisposed(disposed);
                        if (enumerator.moveNext())
                            return yielder.yieldReturn(enumerator.current);
                    }
                    catch (e) {
                        handler(e);
                    }
                    return false;
                }, function () { DisposeUtility.dispose(enumerator); });
            });
        };
        Enumerable.prototype.finallyAction = function (action) {
            var _ = this, disposed = !_.assertIsNotDisposed();
            return new Enumerable(function () {
                var enumerator;
                return new EnumeratorBase(function () {
                    assertIsNotDisposed(disposed);
                    enumerator = _.getEnumerator();
                }, function (yielder) {
                    assertIsNotDisposed(disposed);
                    return (enumerator.moveNext())
                        ? yielder.yieldReturn(enumerator.current)
                        : false;
                }, function () {
                    try {
                        DisposeUtility.dispose(enumerator);
                    }
                    finally {
                        action();
                    }
                });
            });
        };
        return Enumerable;
    })(DisposableBase);
    // #region Supporting Classes
    // The following classes have to be inside the same module definition since they reference each other.
    // #endregion
    // #region Helper Functions...
    // This allows for the use of a boolean instead of calling this.assertIsNotDisposed()
    // since there is a strong chance of introducing a circular reference.
    function assertIsNotDisposed(disposed) {
        return DisposableBase.assertIsNotDisposed(disposed, "Enumerable was disposed.");
    }
    function numberOrNaN(value) {
        return isNaN(value) ? NaN : value;
    }
    function assertInteger(value, variable) {
        if (typeof value === Types.Number && !isNaN(value) && value != (value | 0))
            throw new Error("'" + variable + "'" + " must be an integer.");
        return true;
    }
    return Enumerable;
});
//# sourceMappingURL=Enumerable.js.map