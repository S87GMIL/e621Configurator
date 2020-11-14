// ==UserScript==
// @name         e621 configurator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Configure e621 to your liking
// @author       S87GMIL
// @match        https://e621.net/*
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/icons/test.png
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/HtmlFunctions.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/ViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/ViewConfigParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/PostsViewParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/PostViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/Profile.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/SetsViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/SetsViewParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/classes/ViewConfigurator.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/utils/ProfileStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/restructuring/e621Configurator.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';
    initializeE621Configurator();
})();