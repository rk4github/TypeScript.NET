var __extends=this&&this.__extends||function(e,t){function i(){this.constructor=e}for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);e.prototype=null===t?Object.create(t):(i.prototype=t.prototype,new i)};!function(e){if("object"==typeof module&&"object"==typeof module.exports){var t=e(require,exports);void 0!==t&&(module.exports=t)}else"function"==typeof define&&define.amd&&define(["require","exports","../Utility/shallowCopy","../Disposable/DisposableBase","../Collections/Array/Utility"],e)}(function(e,t){"use strict";var i=e("../Utility/shallowCopy"),r=e("../Disposable/DisposableBase"),n=e("../Collections/Array/Utility"),s="disposing",o="disposed",p=function(e){function t(t,i,r,n){void 0===r&&(r=!1),void 0===n&&(n=0),e.call(this),this.type=t,this.listener=i,this.useCapture=r,this.priority=n;var s=this;s.type=t,s.listener=i,s.useCapture=r,s.priority=n}return __extends(t,e),t.prototype.dispose=function(){this.listener=null},Object.defineProperty(t.prototype,"wasDisposed",{get:function(){return null==this.listener},enumerable:!0,configurable:!0}),t.prototype.matches=function(e,t,i){void 0===i&&(i=!1);var r=this;return r.type==e&&r.listener==t&&r.useCapture==i},t.prototype.equals=function(e){var t=this;return t.type==e.type&&t.listener==e.listener&&t.useCapture==e.useCapture&&t.priority==e.priority},t}(r["default"]);Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=p;(function(e){function t(){e.apply(this,arguments),this._isDisposing=!1}return __extends(t,e),t.prototype.addEventListener=function(e,t,i,r){void 0===i&&(i=!1),void 0===r&&(r=0);var n=this._listeners;n||(this._listeners=n=[]),n.push(new p(e,t,i,r))},t.prototype.registerEventListener=function(e,t,i,r){void 0===i&&(i=!1),void 0===r&&(r=0),this.hasEventListener(e,t,i)||this.addEventListener(e,t,i,r)},t.prototype.hasEventListener=function(e,t,i){void 0===i&&(i=!1);var r=this._listeners;return r&&r.some(function(r){return e==r.type&&(!t||t==r.listener&&i==r.useCapture)})},t.prototype.removeEventListener=function(e,t,i){void 0===i&&(i=!1);var r=this._listeners;if(r){var s=n.findIndex(r,function(r){return r.matches(e,t,i)});if(-1!=s){var o=r[s];r.splice(s,1),o.dispose()}}},t.prototype.dispatchEvent=function(e,t){var r=this,n=this,s=n._listeners;if(!s||!s.length)return!1;var o;"string"==typeof e?(o=Object.create(Event),t||(t={}),o.cancelable=!!t.cancelable,o.target=n,o.type=e):o=e;var p=o.type,u=[];return s.forEach(function(e){e.type==p&&u.push(e)}),u.length?(u.sort(function(e,t){return t.priority-e.priority}),u.forEach(function(e){var t=Object.create(Event);i["default"](o,t),t.target=r,e.listener(t)}),!0):!1},Object.defineProperty(t,"DISPOSING",{get:function(){return s},enumerable:!0,configurable:!0}),Object.defineProperty(t,"DISPOSED",{get:function(){return o},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"isDisposing",{get:function(){return this._isDisposing},enumerable:!0,configurable:!0}),t.prototype.dispose=function(){var t=this;if(!t.wasDisposed&&!t._isDisposing){t._isDisposing=!0,t.dispatchEvent(s),e.prototype.dispose.call(this),t.dispatchEvent(o);var i=t._listeners;i&&(this._listeners=null,i.forEach(function(e){return e.dispose()}))}},t})(r["default"])});
//# sourceMappingURL=EventDispatcher.js.map
