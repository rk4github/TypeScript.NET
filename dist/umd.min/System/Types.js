/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
!function(e,i){if("object"==typeof module&&"object"==typeof module.exports){var t=i(require,exports);void 0!==t&&(module.exports=t)}else"function"==typeof define&&define.amd&&define(e,i)}(["require","exports"],function(e,i){var t=typeof!0,n="number",r="string",s=typeof{},o="undefined",u="function",a={},f=function(){function e(e){var i=this;switch(i.isBoolean=!1,i.isNumber=!1,i.isString=!1,i.isTrueNaN=!1,i.isObject=!1,i.isFunction=!1,i.isUndefined=!1,i.isNull=!1,i.isPrimitive=!1,i.type=typeof e){case t:i.isBoolean=!0,i.isPrimitive=!0;break;case n:i.isNumber=!0,i.isTrueNaN=isNaN(e),i.isFinite=isFinite(e),i.isValidNumber=!i.isTrueNaN,i.isPrimitive=!0;break;case r:i.isString=!0,i.isPrimitive=!0;break;case s:i.target=e,null===e?(i.isNull=!0,i.isNullOrUndefined=!0,i.isPrimitive=!0):i.isObject=!0;break;case u:i.target=e,i.isString=!0;break;case o:i.isUndefined=!0,i.isNullOrUndefined=!0,i.isPrimitive=!0;break;default:throw"Fatal type failure.  Unknown type: "+i.type}Object.freeze(i)}return e.prototype.member=function(i){var t=this.target;return e.getFor(t&&i in t?t[i]:void 0)},e.getFor=function(i){var t=typeof i;switch(t){case s:case u:return new e(i)}var n=a[t];return n||(a[t]=n=new e(i)),n},e}();i.TypeInfo=f;var c;!function(e){function i(e){return typeof e===t}function a(e,i){return void 0===i&&(i=!0),typeof e===n&&(i||!isNaN(e))}function c(e){return typeof e===n&&isNaN(e)}function N(e){return typeof e===r}function p(e){var i=typeof e;switch(i){case t:case r:case n:case o:return!0;case s:return null===e}return!1}function l(e){return typeof e===u}function d(e){return typeof e===s}function y(e){return isNaN(e)?NaN:e}function b(e){return f.getFor(e)}function m(e,i){return e&&!p(e)&&i in e}function v(e,i,t){return m(e,i)&&typeof e[i]===t}function O(e,i){return e instanceof i}function g(e){return e instanceof Array||m(e,"length")}e.BOOLEAN=t,e.NUMBER=n,e.STRING=r,e.OBJECT=s,e.UNDEFINED=o,e.FUNCTION=u,e.isBoolean=i,e.isNumber=a,e.isTrueNaN=c,e.isString=N,e.isPrimitive=p,e.isFunction=l,e.isObject=d,e.numberOrNaN=y,e.of=b,e.hasMember=m,e.hasMemberOfType=v,e.isInstanceOf=O,e.isArrayLike=g}(c||(c={})),Object.freeze(c),Object.defineProperty(i,"__esModule",{value:!0}),i["default"]=c});
//# sourceMappingURL=Types.js.map
