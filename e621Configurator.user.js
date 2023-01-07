// ==UserScript==
// @name         e621 configurator
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Configure e621 to your liking
// @author       S87GMIL
// @match        https://e621.net/*
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/icons/e621Configurator.png
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/utils/HTMLFunctions.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/utils/ProfileStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/utils/URLFunctions.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/ConfigurationSection.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/ElementSelection.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/ViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/ViewConfigParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/PostsViewParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/PostViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/Profile.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/SetsViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/SetsViewParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/classes/e621Configurator.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/helpers/APIHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.0/helpers/SuggestionHelper.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';
    new E621Configurator().initializeE621Configurator();
})();