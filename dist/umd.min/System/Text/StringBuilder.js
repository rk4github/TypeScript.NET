!function(t){if("object"==typeof module&&"object"==typeof module.exports){var e=t(require,exports);void 0!==e&&(module.exports=e)}else"function"==typeof define&&define.amd&&define(["require","exports","../Types"],t)}(function(t,e){"use strict";var r=t("../Types"),n=void 0,o=function(){function t(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];var r=this;r._latest=null,r._partArray=[],r.appendThese(t)}return t.prototype.appendSingle=function(t){if(null!==t&&t!==n){var e=this;switch(e._latest=null,typeof t){case r["default"].OBJECT:case r["default"].FUNCTION:t=t.toString()}e._partArray.push(t)}},t.prototype.appendThese=function(t){var e=this;return t.forEach(function(t){return e.appendSingle(t)}),e},t.prototype.append=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return this.appendThese(t),this},t.prototype.appendLine=function(){for(var t=[],e=0;e<arguments.length;e++)t[e-0]=arguments[e];return this.appendLines(t),this},t.prototype.appendLines=function(t){var e=this;return t.forEach(function(t){null!==t&&t!==n&&(e.appendSingle(t),e._partArray.push("\r\n"))}),e},Object.defineProperty(t.prototype,"isEmpty",{get:function(){return 0===this._partArray.length},enumerable:!0,configurable:!0}),t.prototype.toString=function(){var t=this._latest;return null===!t&&(this._latest=t=this._partArray.join()),t},t.prototype.join=function(t){return this._partArray.join(t)},t.prototype.clear=function(){this._partArray.length=0,this._latest=null},t.prototype.dispose=function(){this.clear()},t}();Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=o});
//# sourceMappingURL=StringBuilder.js.map
