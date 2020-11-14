
(function () {
    'use strict';

    function createRegexFromWildcardString(sSearchString) {
        if (sSearchString && sSearchString.includes("*")) {
            var sEscapedString = sSearchString.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp('^' + sEscapedString.replace(/\*/g, '.*') + '$');
        }
    }

    function doesCurrentUrlMatch(sSearchString, sSearchParameters) {
        var bMatches = false;
        var oPathRegex = createRegexFromWildcardString(sSearchString);

        if (sSearchString) {
            if (oPathRegex && oPathRegex.test(window.location.pathname)) bMatches = true;
            if (!oPathRegex && window.location.pathname === sSearchString) bMatches = true;
            if (sSearchString.endsWith("/*")) {
                if (window.location.pathname === sSearchString.substring(0, sSearchString.length - 2)) bMatches = true;
            }

            if (bMatches && sSearchParameters.length > 0) {
                bMatches = false;
                var oSearchgParameterRegex = createRegexFromWildcardString(sSearchParameters);
                if (sSearchParameters === unescape(window.location.search)) bMatches = true;
                if (oSearchgParameterRegex && oSearchgParameterRegex.test(unescape(window.location.search))) bMatches = true;
            }
        }
        return bMatches;
    }
});