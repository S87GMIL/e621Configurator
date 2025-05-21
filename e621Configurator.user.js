// ==UserScript==
// @name         e621 configurator
// @namespace    http://tampermonkey.net/
// @version      2.6.2
// @description  Configure e621 to your liking
// @author       S87GMIL
// @match        https://e621.net/*
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/icons/e621Configurator.png
// @updateURL    https://raw.githubusercontent.com/S87GMIL/e621Configurator/main/e621Configurator.user.js
// @downloadURL  https://raw.githubusercontent.com/S87GMIL/e621Configurator/main/e621Configurator.user.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/utils/HTMLFunctions.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/utils/ProfileStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/utils/URLFunctions.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/utils/DataBuffer.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/helpers/UIHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/ConfigurationSection.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/ElementSelection.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/ViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/ViewConfigParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/PostsViewParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/PostViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/Profile.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/SetsViewConfiguration.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/SetsViewParser.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/helpers/APIHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/helpers/SuggestionHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621Configurator/v2.6.2/classes/e621Configurator.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';
    new E621Configurator().initializeE621Configurator();
})();
