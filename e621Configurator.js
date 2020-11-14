// ==UserScript==
// @name         e621 configurator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Configure e621 to your liking
// @author       S87GMIL
// @match        https://e621.net/*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// ==/UserScript==

const postViewId = "posts";
const setViewId = "sets";
const rootViewId = "root";

class ViewConfiguration {
    constructor(sId, sPath, bIncludeSubPaths, sSearchParameters, viewId) {
        this.view = viewId;
        this.id = sId;
        this.path = sPath;
        this.includeSubPaths = bIncludeSubPaths || false;
        this.searchParameters = sSearchParameters || "";

        this.hiddenElements = new Set();
        this.changedLinkDestinations = {};
        this.createdButtons = {};
        this.createdLinks = {};
        this.movedElements = {};
        this.elementStyleModifications = {};
        this.elementClassModifications = {};
        this.tagStyleModifications = {};

        this.executionOrder = ["hideElements", "changeLinkDestination", "createButtons", "createLinks", "moveElements", "modifyElementStyles", "modifyElementClasses"];

        this.MODIFY_STYLE_OPERATION = "modifyStyle";
        this.MODIFY_CLASS_OPERATION = "modifyClass";
        this.HIDE_ELEMENT_OPERATION = "hideElement";

        this.BUTTON_ELEMENT = "button";
        this.LINK_ELEMENT = "link";
    }

    parseViewConfig(oViewConfig) {
        this.executionOrder = oViewConfig.executionOrder;
        if (Array.isArray(oViewConfig.hideElements)) this.hiddenElements = new Set(oViewConfig.hideElements);
        this.changedLinkDestinations = oViewConfig.changeLinkDestination || {};
        this.createdButtons = oViewConfig.createButtons || {};
        this.createdLinks = oViewConfig.createLinks || {};
        this.movedElements = oViewConfig.moveElements || {};
        this.elementStyleModifications = oViewConfig.modifyElementStyles || {};
        this.elementClassModifications = oViewConfig.modifyElementClasses || {};
        this.tagStyleModifications = oViewConfig.modifyTagStyles || {};

        return this;
    }

    getConfiguration() {
        var oConfig = {
            id: this.id,
            includeSubPaths: this.areSubpathsIncluded(),
            path: this.getPath(),
            searchParameters: this.searchParameters,
            view: this.view
        };

        return { ...oConfig, ...this._getIncludedSettings() };
    }

    _getIncludedSettings() {
        return {
            executionOrder: this.executionOrder,
            hideElements: Array.from(this.hiddenElements),
            changeLinkDestination: this.changedLinkDestinations,
            createButtons: this.createdButtons,
            createLinks: this.createdLinks,
            moveElements: this.movedElements,
            modifyElementStyles: this.elementStyleModifications,
            modifyElementClasses: this.elementClassModifications,
            modifyTagStyles: this.stagStyleModifications,
        };
    }

    areSubpathsIncluded() {
        return this.includeSubPaths;
    }

    setSubpathsIncluded(bInlcluded) {
        this.includeSubPaths = bInlcluded;
    }

    setParameters(sParameters) {
        this.searchParameters = sParameters;
    }

    getViewId() {
        return this.view;
    }

    getPath() {
        var sPath = this.path;
        if (this.includeSubPaths) {
            if (!sPath.endsWith("/*")) sPath = sPath.endsWith("/") ? sPath + "*" : sPath + "/*";
        } else {
            sPath = sPath.endsWith("/*") ? sPath.substring(0, sPath.length - 2) : sPath;
        }
        return sPath;
    }

    setPath(sPath) {
        this.path = sPath;
        if (sPath.endsWith("/*")) this.setSubpathsIncluded(true);
    }

    getSearchParameters() {
        return this.searchParameters;
    }

    getId() {
        return this.id;
    }

    _addValueToObject(sObjectId, sValueId, oValue) {
        this[sObjectId][sObjectId] = oValue;
    }

    hideElement(sElementId) {
        if (this.hiddenElements.has(sElementId)) return false;
        this.hiddenElements.add(sElementId);
        return sElementId;
    }

    getHiddenElements() {
        return Array.from(this.hiddenElements);
    }

    getStyleModifiedElements() {
        return this.elementStyleModifications;
    }

    getClassModifiedElements() {
        return this.elementClassModifications;
    }


    removeHiddenElement(sElementId) {
        this.hiddenElements.delete(sElementId);
    }

    changeLinkDestination(sElementId, sNewDestination, bUpdate) {
        var oChangedLink = this.changedLinkDestinations[sElementId];

        if (!bUpdate && oChangedLink) return false;
        oChangedLink = {
            id: sElementId,
            destination: sNewDestination
        };

        this.changedLinkDestinations[sElementId] = oChangedLink;
        return oChangedLink;
    }

    removeChangeLinkDestination(sElementId) {
        delete this.changedLinkDestinations[sElementId];
    }

    getChangedLinks() {
        return this.changedLinkDestinations;
    }

    createButton(sContainerId, sButtonId, sText, sDestination, aClasses, sBackgroundColor, bOpneNewTab) {
        this.createdButtons[sButtonId] = {
            id: sButtonId,
            targetContainer: sContainerId,
            text: sText,
            destination: sDestination,
            classes: aClasses,
            backgroundColor: sBackgroundColor,
            openInNewTab: bOpneNewTab
        }
    }

    removeCreatedButton(sButtonId) {
        delete this.createdButtons[sButtonId];
    }

    createLink(sContainerId, sLinkId, sText, sDestination, sType, sBackgroundColor, bOpneNewTab, bUpdate) {
        var oCreatedLink = this.createdLinks[sLinkId];
        if (!bUpdate && oCreatedLink) return false;
        if (sBackgroundColor === "#000000") sBackgroundColor = "transparent";
        oCreatedLink = {
            id: sLinkId,
            targetContainer: sContainerId,
            text: sText,
            destination: sDestination,
            type: sType,
            backgroundColor: sBackgroundColor,
            openInNewTab: bOpneNewTab
        };
        this.createdLinks[sLinkId] = oCreatedLink;
        return oCreatedLink;
    }

    getCreatedLinks() {
        return this.createdLinks;
    }

    removeCreatedLink(sLinkId) {
        delete this.createdLinks[sLinkId];
    }

    moveElement(sElementId, sTargetContainer, iPosition, bUpdate) {
        if (!bUpdate && this.movedElements[sElementId]) return false;

        var oMovedElement = {
            id: sElementId,
            targetContainer: sTargetContainer,
            position: iPosition
        };
        this.movedElements[sElementId] = oMovedElement;
        return oMovedElement;
    }

    getMovedElements() {
        return this.movedElements;
    }

    removeElementMove(sElementId) {
        delete this.movedElements[sElementId];
    }

    modifyElementStyle(sElementId, sElementClass, oStyles, bUpdate) {
        var sModificationId = this.MODIFY_STYLE_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);

        if (!bUpdate && this.elementStyleModifications[sModificationId]) return false;
        var oModifiedElement = {
            id: sElementId,
            class: sElementClass,
            styles: oStyles,
            operation: this.MODIFY_STYLE_OPERATION
        };
        this.elementStyleModifications[sModificationId] = oModifiedElement;
        return oModifiedElement;
    }

    removeElementStyleModification(sElementId, sElementClass) {
        var sModificationId = this.MODIFY_STYLE_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);
        delete this.elementStyleModifications[sModificationId];
    }

    modifyElementClass(sElementId, sElementClass, aClasses, bUpdate) {
        var sModificationId = this.MODIFY_CLASS_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);
        if (!bUpdate && this.elementClassModifications[sModificationId]) return false;
        var oModifiedElement = {
            id: sElementId,
            class: sElementClass,
            classes: aClasses,
            operation: this.MODIFY_CLASS_OPERATION
        };

        this.elementClassModifications[sModificationId] = oModifiedElement;
        return oModifiedElement;
    }

    modifyTagStyle(sTag, oStyles) {
        this.tagStyleModifications[sTag] = {
            id: this.MODIFY_STYLE_OPERATION + "-" + sTag,
            tag: sTag,
            styles: oStyles
        };;
    }

    removeElementClassModification(sElementId, sElementClass) {
        var sModificationId = this.MODIFY_CLASS_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);
        delete this.elementClassModifications[sModificationId];
    }
}

class PostViewConfiguration extends ViewConfiguration {
    constructor(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        super(sId, sPath, bIncludeSubPaths, sSearchParameters, postViewId);

        this.customSetGroups = {};
        this.setSelectionDialogElements = new Set();
    }

    parseViewConfig(oViewConfig) {
        super.parseViewConfig(oViewConfig);

        this.customSetGroups = oViewConfig.createCustomSetGroup || {};
        this.setSelectionDialogElements = oViewConfig.setSelectionDialogElements || {};

        return this;
    }

    _getIncludedSettings() {
        var oDefaultConfigSettings = super._getIncludedSettings();
        var aExecutionOrder = oDefaultConfigSettings.executionOrder;

        if (!aExecutionOrder.includes("createCustomSetGroup")) aExecutionOrder.push("createCustomSetGroup");
        if (!aExecutionOrder.includes("moveElementToSetSelectionDialog")) aExecutionOrder.push("moveElementToSetSelectionDialog");

        var oPostViewSettings = {
            createCustomSetGroup: this.customSetGroups,
            moveElementToSetSelectionDialog: this.setSelectionDialogElements
        };
        return { ...oDefaultConfigSettings, ...oPostViewSettings }
    }

    addElementToSetSelectionDialog(sElementId, iPosition) {
        this.setSelectionDialogElements[sElementId] = {
            id: sElementId,
            position: iPosition
        };
    }

    removeAddedSetSelectionDialogElements(sElementId) {
        this.setSelectionDialogElements.delete(sElementId);
    }

    getSetSelectionGroupAtPosition(iPosition) {
        for (var sKey in this.customSetGroups) {
            var oCustomGroup = this.customSetGroups[sKey];
            if (oCustomGroup.position === iPosition) return oCustomGroup;
        }
        return false;
    }

    getSetSelectionGroups() {
        return this.customSetGroups;
    }

    createSetSelectionGroup(sTitle, sSetSelector, aSets, iPosition, bUpdateGroup) {
        var sId = sTitle.replace(/ /g, "");

        var oCustomGroup = this.customSetGroups[sId];
        if (!bUpdateGroup && oCustomGroup) {
            return false;
        }

        oCustomGroup = {
            id: sId,
            title: sTitle,
            setSelector: sSetSelector,
            sets: aSets,
            position: iPosition
        };

        this.customSetGroups[sId] = oCustomGroup;
        return oCustomGroup;
    }

    removeSetSelectionGroup(sGroupId) {
        delete this.customSetGroups[sGroupId];
    }
}

class SetsViewConfiguration extends ViewConfiguration {
    constructor(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        super(sId, sPath, bIncludeSubPaths, sSearchParameters, setViewId);
        this.customSetTables = {};
    }

    parseViewConfig(oViewConfig) {
        super.parseViewConfig(oViewConfig);

        this.customSetTables = oViewConfig.createCustomSetTables || {};
        return this;
    }

    _getIncludedSettings() {
        var oDefaultConfigSettings = super._getIncludedSettings();
        var aExecutionOrder = oDefaultConfigSettings.executionOrder;

        if (!aExecutionOrder.includes("createCustomSetTables")) aExecutionOrder.push("createCustomSetTables");

        var oSetViewSettings = {
            createCustomSetTables: this.customSetTables
        };
        return { ...oDefaultConfigSettings, ...oSetViewSettings }
    }

    createCustomSetTable(sTableId, sTitle, sSetSelector, aSetNames, iPosition, bUpdate) {
        if (!sTableId) sTableId = sTitle.toLowerCase().replace(/ /g, "");

        var oCustomTable = this.customSetTables[sTableId];
        if (!bUpdate && oCustomTable) return false;

        oCustomTable = {
            id: sTableId,
            title: sTitle,
            setNames: aSetNames,
            setSelector: sSetSelector,
            position: iPosition
        }

        this.customSetTables[sTableId] = oCustomTable;
        return oCustomTable;
    }

    getCustomSetTables() {
        return this.customSetTables;
    }

    remvoeCustomSetTable(sTableId) {
        delete this.customSetTables[sTableId];
    }
}

class HtmlFunctions {
    getElement(vElement) {
        if (typeof vElement === "object") {
            return vElement;
        } else {
            var oElement = document.getElementById(vElement);
            if (!oElement) {
                oElement = this.getElementByXpath(vElement);
            }
            return oElement;
        }
    }

    getElementsByClass(sClass) {
        var sClasses = "." + sClass.split(" ").join(".");
        return this.convertHtmlCollectionToArray($(`${sClasses}`));
    }

    getElementsByTag(sTag) {
        return this.convertHtmlCollectionToArray($(`${sTag}`));
    }

    createElementFromHTML(sHtml) {
        var div = document.createElement('div');
        div.innerHTML = sHtml.trim();

        return div.firstChild;
    }

    hideElement(vElement) {
        this.addStyleToElement(this.getElement(vElement), "display", "none");
    }

    recenterElement(vElement) {
        var oElement = this.getElement(vElement);
        if (!oElement) return;

        var iElementHeight = oElement.offsetHeight;
        var iElementWidth = oElement.offsetWidth;

        var iTop = window.innerHeight / 2 - iElementHeight / 2;
        var iLeft = window.innerWidth / 2 - iElementWidth / 2;

        iTop = iTop > 0 ? iTop : 20;
        iLeft = iLeft > 0 ? iLeft : 0;

        this.addElementStyles(oElement, {
            top: iTop + "px",
            left: iLeft + "px"
        });
    }

    setInputErrorState(vInput, bErrorState, sErrorMessage) {
        var oInput = this.getElement(vInput);
        if (oInput) {
            if (bErrorState) {
                this.addStyleToElement(oInput, "border", "1px solid red");
                oInput.setCustomValidity(sErrorMessage);
                oInput.reportValidity();
            } else {
                this.addStyleToElement(oInput, "border", "none");
                oInput.setCustomValidity("");
            }
        }
    }

    createStyleClass(sClassName, oStyles) {
        var oStyleClass = document.createElement('style');
        oStyleClass.type = 'text/css';
        var sStyles = "";

        for (var sKey in oStyles) {
            sStyles += sKey + ": " + oStyles[sKey] + ";";
        }

        sStyles = sStyles.substring(0, sStyles.length - 1);
        oStyleClass.innerHTML = "." + sClassName + " {" + sStyles + "}";
        document.getElementsByTagName('head')[0].appendChild(oStyleClass);
    }

    createTable(sId, aClasses) {
        var sClasses;
        var sIdTag = sId ? `id="${sId}"` : "";
        if (aClasses) {
            sClasses = aClasses.join(" ");
        } else {
            sClasses = "table striped";
        }



        var sTable = `<table ${sIdTag} class="${sClasses}"><tbody></tbody></table>`;
        return this.createElementFromHTML(sTable);
    }

    createTableColumns(vTable, aColumns) {
        var oTable = this.getElement(vTable);
        var aHeaders = oTable.headers ? this.convertHtmlCollectionToArray(oTable.headers) : [];
        if (aHeaders.length === 0) {
            var oHeaderRow = oTable.createTHead().insertRow();

            aColumns.forEach((sColumn, iIndex) => {
                var oCell = oHeaderRow.insertCell();
                oCell.innerHTML = sColumn;
                if (iIndex > 0) this.addStyleToElement(oCell, "padding-left", "20px");
            });
        }
    }

    createTableRows(vTable, oTableRows) {
        var oTable = this.getElement(vTable);

        for (var sKey in oTableRows) {
            var oRowConfig = oTableRows[sKey];

            var oNewRow = oTable.tBodies[0].insertRow();

            for (var sColumn in oRowConfig) {
                var oCellConfig = oRowConfig[sColumn];
                var oCell = oNewRow.insertCell(oCellConfig.index);

                if (typeof oCellConfig.content === "object") {
                    oCell.appendChild(oCellConfig.content);
                } else {
                    oCell.innerHTML = oCellConfig.content;
                }

                if (oCellConfig.styles) this.addElementStyles(oCell, oCellConfig.styles);
            }
        }
    }

    removeTableRow(vTable, oRowInfo) {
        var oTable = this.getElement(vTable);
        var aHeaders = this.convertHtmlCollectionToArray(oTable.tHead.rows[0].cells);
        var iColumnIndex;

        if (oRowInfo.column) oRowInfo.columns = [oRowInfo];

        var oFoundRows = {};
        for (var sKey in oRowInfo.columns) {
            var oColumn = oRowInfo.columns[sKey];

            aHeaders.forEach((oHeader, iIndex) => {
                if (oHeader.innerText.trim() === oColumn.column) iColumnIndex = iIndex;
            });

            var aTableRows = this.convertHtmlCollectionToArray(oTable.tBodies[0].rows);
            if (!Number.isNaN(iColumnIndex) && iColumnIndex !== undefined) aTableRows.forEach((oRow, iIndex) => {
                if (oRow.cells[iColumnIndex].innerText.trim() === oColumn.value) {
                    if (oFoundRows[iIndex]) {
                        oFoundRows[iIndex] += 1;
                    } else {
                        oFoundRows[iIndex] = 1;
                    }
                }
            });
        }

        var iCoulmnCount = oRowInfo.columns.length;
        var iDesiredTableRow;

        for (var sRow in oFoundRows) {
            var iRowFoundCount = oFoundRows[sRow];
            if (iRowFoundCount === iCoulmnCount) {
                iDesiredTableRow = sRow;
                break;
            }
        }

        if (!Number.isNaN(iDesiredTableRow) && iDesiredTableRow !== undefined) {
            oTable.tBodies[0].removeChild(oTable.tBodies[0].rows[iDesiredTableRow])
        }
    }

    createContainerWithTitle(sId, sTitle, sTitleLevel, oStyles, aClasses) {
        var sClasses = aClasses ? aClasses.join(" ") : "";
        var sTitleLevel = sTitleLevel || "h2";
        var sTable = `<div id="${sId}" class="${sClasses}"><${sTitleLevel} style="margin-bottom: 5px">${sTitle}</${sTitleLevel}></div>`;
        var oContainer = this.createElementFromHTML(sTable);

        this.addElementStyles(oContainer, oStyles);

        return oContainer;
    }

    convertHtmlCollectionToArray(oHtmlCollection) {
        return Array.prototype.slice.call(oHtmlCollection);
    }

    addStyleToElement(vElement, sPropertyKey, sPropertyValue) {
        var oElement = this.getElement(vElement);
        if (oElement) {
            if (!oElement.style) oElement.style = {};
            oElement.style[sPropertyKey] = sPropertyValue;
        }
    }

    addStyleClassToElement(oElement, aStyleClasses) {
        if (oElement) oElement.classList.add(aStyleClasses);
    }

    addElementStyles(oElement, oStyleProperties) {
        for (var sProperty in oStyleProperties) {
            this.addStyleToElement(oElement, sProperty, oStyleProperties[sProperty]);
        }
    }

    setLinkHref(oLink, sHref) {
        if (oLink && oLink.href) oLink.href = sHref;
    }

    addElementToContainer(oElement, vContainer, iposition) {
        var oContainer = this.getElement(vContainer);
        if (oElement && oContainer) if (iposition) {
            oContainer.insertBefore(oElement, oContainer.childNodes[iposition]);
        } else {
            oContainer.appendChild(oElement);
        }
    }

    createButton(sId, sText, fClickHandler, oButtonData) {
        var sButtonData = "";

        for (var sKey in oButtonData) {
            sButtonData += `data-${sKey}="${oButtonData[sKey]}"`;
        }

        var sButton = `<a id="${sId || ""}" class="button" style="cursor: pointer" ${sButtonData}>${sText}</a>`;
        var oButton = this.createElementFromHTML(sButton);
        oButton.addEventListener("click", fClickHandler);

        return oButton;
    }

    addButtonToContainer(oContainer, sButtonText, sButtonDestination, aClasses, sBackgroundColor, bOpneNewTab) {
        if (oContainer) {
            var sClasses = aClasses ? aClasses.join(" ") : "button";
            sBackgroundColor = sBackgroundColor || "";
            var sTarget = bOpneNewTab ? "_blank" : "_self";
            var sButton = `<a class="${sClasses}" style="background: ${sBackgroundColor}" href="${sButtonDestination}" target="${sTarget}">${sButtonText}</a>`;
            var oButton = this.createElementFromHTML(sButton);

            oContainer.appendChild(oButton);

            return oButton;
        }
    }

    doesGroupExist(sGroupId) {
        return !!this.getElement(sGroupId);
    }

    createOptionGroup(sGroupId, sGroupTitle) {
        if (!sGroupId) {
            sGroupId = sGroupTitle.replace(/ /g, "");
        }

        if (sGroupTitle) {
            var sGroup = `<optgroup id="${sGroupId}" label="${sGroupTitle}"></optgroup>`;
            return this.createElementFromHTML(sGroup);
        }
    }

    addGroupToSelect(vSelect, oGroup, iPosition) {
        var oSelect = this.getElement(vSelect);
        this.addElementToContainer(oGroup, oSelect, iPosition);
    }

    hideGroupByName(sGroupName) {
        $("optgroup").each(function (iIndex, oOptGroup) {
            if (oOptGroup.label === sGroupName) this.hideElement(oOptGroup);
        });
    }

    moveOptionToGroup(oOption, oSourceGroup, oTargetGroup) {
        if (oSourceGroup) oSourceGroup.removeChild(oOption)
        oTargetGroup.appendChild(oOption);
    }

    getOptionsByName(vSelect, sSetSelector, aNames) {
        var oSelect = this.getElement(vSelect)

        if (!oSelect) return [];

        return this.convertHtmlCollectionToArray(oSelect.options).filter(oOption => {
            return this.#doesSetMatchSetSelectors(oOption.innerText, sSetSelector, aNames);
        });
    }

    #doesSetMatchSetSelectors(sSetName, sSetSelector, aSetNames) {
        var bMacthed = false;
        var aLowerCaseNames = aSetNames.map ? aSetNames.map(sName => { return sName.toLowerCase() }) : [];
        if (aSetNames && aSetNames.length > 0) {
            if (aSetNames.includes(sSetName.trim())) bMacthed = true;
            if (aLowerCaseNames.includes(sSetName.trim().toLowerCase())) bMacthed = true;
        }
        if (sSetSelector && sSetSelector.includes("*")) {
            var oSetNameRegex = this.createRegexFromWildcardString(sSetSelector);
            var oSetLowerCaseNameRegex = this.createRegexFromWildcardString(sSetSelector.toLowerCase());
            if (oSetNameRegex.test(sSetName) || oSetLowerCaseNameRegex.test(sSetName.toLowerCase())) bMacthed = true;
        }
        return bMacthed;
    }

    moveOptionsByName(vSelect, oTargetGroup, sSetSelector, aNames) {
        var oSelect = this.getElement(vSelect);
        var oSourceGroup;
        this.getOptionsByName(oSelect, sSetSelector, aNames).forEach(oOption => {
            if (!oSourceGroup) oSourceGroup = oOption.parentElement;
            this.moveOptionToGroup(oOption, oSourceGroup, oTargetGroup);
        });
    }

    createRegexFromWildcardString(sSearchString) {
        if (sSearchString && sSearchString.includes("*")) {
            if (sSearchString.startsWith("?")) sSearchString = sSearchString.substring(1);
            return new RegExp('^' + sSearchString.replace(/\*/g, '.*') + '$');
        }
    }

    createTableWithTitle(sId, sTitle, aClasses) {
        var oTable = this.createTable(sId, aClasses);
        var oTableContainer = this.createElementFromHTML(`<div><h2 style="padding-top: 20px">${sTitle}</h2></div>`);
        this.addElementToContainer(oTable, oTableContainer);
        return { table: oTable, container: oTableContainer };
    }

    moveSetsToTable(vSourceTable, vTarget, sSetSelector, aSetNames) {
        var oSourceTable = this.getElement(vSourceTable);
        var oTarget = this.getElement(vTarget);
        if (oSourceTable) {

            var oSourceTableBody = oSourceTable.getElementsByTagName('tbody')[0];
            var aDesiredTableRows = this.convertHtmlCollectionToArray(oSourceTableBody.getElementsByTagName("tr")).filter(oTableRow => {
                return this.#doesSetMatchSetSelectors(oTableRow.getElementsByTagName("td")[0].innerText, sSetSelector, aSetNames);
            });

            aDesiredTableRows.forEach(oDesiredTableRow => {
                if (oDesiredTableRow) {
                    oTarget.getElementsByTagName('tbody')[0].appendChild(oDesiredTableRow);

                    if (oTarget.getElementsByTagName('thead').length === 0) {
                        var oHeaderClone = oSourceTable.getElementsByTagName('thead')[0].cloneNode(true);
                        this.convertHtmlCollectionToArray(oHeaderClone.getElementsByTagName("th")).forEach(oHeaderText => {
                            oHeaderText.innerText = "";
                        });
                        oTarget.appendChild(oHeaderClone);
                    }
                }
            });
        }
    }

    createDialog(sId, sTitle, bHasFooter) {
        if (bHasFooter === undefined) bHasFooter = true;
        var sStyles = `position: absolute; height: auto; width: auto`;
        var sClasses = `ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-draggable ui-resizable`;

        if (!sId) sId = sTitle.toLowerCase().replace(/ /g, "");

        var oDialog = this.getElement(`${sId}-dialog`);
        if (oDialog) oDialog.parentNode.removeChild(oDialog);

        var oDialogContent = this.createElementFromHTML(`<div id="${sId}-content" class="ui-dialog-content ui-widget-content"></div>`);

        oDialog = this.createElementFromHTML(`
        <div id="${sId}" tabindex="-1" role="dialog" class="${sClasses}" style="${sStyles}">
            <div class="ui-dialog-titlebar ui-corner-all ui-widget-header ui-helper-clearfix ui-draggable-handle">
                <span class="ui-dialog-title">
                    ${sTitle}
                </span>
            </div>
        </div>`);

        this.addElementToContainer(oDialogContent, oDialog);
        this.addElementToContainer(oDialog, document.body);

        var oFooter;
        if (bHasFooter) {
            oFooter = this.createElementFromHTML(`<div></div>`);
            this.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
            this.addElementToContainer(oFooter, oDialog);
        }

        this.recenterElement(oDialog);

        return {
            id: sId,
            dialog: oDialog,
            content: oDialogContent,
            footer: oFooter
        };
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getElementTreeXPath = function (element) {
        var paths = [];
        for (; element && element.nodeType == Node.ELEMENT_NODE;
            element = element.parentNode) {
            var index = 0;
            var hasFollowingSiblings = false;
            for (var sibling = element.previousSibling; sibling;
                sibling = sibling.previousSibling) {
                if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                    continue;

                if (sibling.nodeName == element.nodeName)
                    ++index;
            }

            for (var sibling = element.nextSibling;
                sibling && !hasFollowingSiblings;
                sibling = sibling.nextSibling) {
                if (sibling.nodeName == element.nodeName)
                    hasFollowingSiblings = true;
            }

            var tagName = (element.prefix ? element.prefix + ":" : "")
                + element.localName;
            var pathIndex = (index || hasFollowingSiblings ? "["
                + (index + 1) + "]" : "");
            paths.splice(0, 0, tagName + pathIndex);
        }

        return paths.length ? "/" + paths.join("/") : null;
    };

    getElementXPath = function (element) {
        if (element && element.id)
            return '//*[@id="' + element.id + '"]';
        else
            return this.getElementTreeXPath(element);
    };

    getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    deactivateElementSelectionMode() {
        this.elementSelectioNModeActive = false;
        this.oBodyClone.parentNode.replaceChild(this.oOriginalBody, this.oBodyClone);
        this.addElementStyles("viewConfig-dialog", { "display": "block" });
    }

    activateElementSelectionMode(fElementSelectedCallback, oInput, bReturnElementClass) {
        if (!this.oOriginalBody) this.oOriginalBody = document.getElementsByTagName("body")[0];

        this.oBodyClone = this.oOriginalBody.cloneNode(true);
        this.oOriginalBody.parentNode.replaceChild(this.oBodyClone, this.oOriginalBody); //Replace body with a clone to disconnect all event listeners

        this.hideElement("viewConfig-dialog");

        $("a").each(function (iIndex, oAnchor) {
            oAnchor.onclick = function () { return false; };
        });

        this.elementSelectioNModeActive = true;
        var oDocument = $(document);

        oDocument.mouseover(function (oEvent) {
            if (!this.elementSelectioNModeActive) return;
            oEvent.target.style.border = "dotted 1px #ff0000e0";

            oEvent.target.addEventListener("mouseout", function (oEvent) {
                oEvent.target.style.border = "";
            });
        }.bind(this));

        var fClickEventListener = function (oEvent) {
            if (!this.elementSelectioNModeActive) return;

            if (oEvent.target && oEvent.target.id !== "viewConfigButton" && !oEvent.target.dataset.is_element_select_button) {
                if (oEvent.target && fElementSelectedCallback) {
                    var sElementIdentifier;
                    if (bReturnElementClass) {
                        sElementIdentifier = oEvent.target.className;
                    } else {
                        if (oEvent.target.id) {
                            sElementIdentifier = oEvent.target.id;
                        } else {
                            sElementIdentifier = this.getElementXPath(oEvent.target);
                        }
                    }

                    document.removeEventListener("click", fClickEventListener);
                    fElementSelectedCallback(sElementIdentifier, oInput);
                }
            }
        }.bind(this);

        document.addEventListener("click", fClickEventListener);
    }

    crateHtmlElementSelectionInput(sPlaceholder, sLabelText, bRequired, bReturnElementClass) {
        if (!sLabelText) sLabelText = "Element ID / XPath:";

        var sRequiredLabel = bRequired ? `<label style="color: red">*</label>` : "";
        var oLabel = this.createElementFromHTML(`<div style="display: block">${sLabelText}${sRequiredLabel}</div>`)
        var oInput = this.createElementFromHTML(`<Input placeholder="${sPlaceholder}" type="text" style="width: 200px">`);
        var fSelectElementCallback = function (sElementSelector, oParentInput) {
            this.deactivateElementSelectionMode();
            oParentInput.value = sElementSelector;
        }.bind(this);

        var oSelectButton = this.createButton(undefined, "Select", function () {
            this.activateElementSelectionMode(fSelectElementCallback, oInput, bReturnElementClass);
        }.bind(this), { is_element_select_button: true });

        var oInputContainer = this.createElementFromHTML(`<div></div>`);

        this.addElementToContainer(oLabel, oInputContainer);
        this.addElementToContainer(oInput, oInputContainer);
        this.addElementToContainer(oSelectButton, oInputContainer);

        return {
            input: oInput,
            selectButton: oSelectButton,
            container: oInputContainer
        }
    }
}

class ViewConfigParser extends HtmlFunctions {
    constructor(sPath, sSearchParameters) {
        super();
        this.path = sPath;
        this.searchParameters = sSearchParameters;
    }

    performUiChanges(oViewConfig) {
        oViewConfig.executionOrder.forEach(sFunctionName => {
            var oConfig = oViewConfig[sFunctionName];

            if (oConfig) this[sFunctionName](oConfig);
        })
    }

    hideElements(aElementIds) {
        aElementIds.forEach(sElementId => {
            this.hideElement(sElementId);
        });
    }

    changeLinkDestination(oNewLinkConfigs) {
        for (var sLinkId in oNewLinkConfigs) {
            var oLinkConfig = oNewLinkConfigs[sLinkId];
            this.setLinkHref(this.getElement(oLinkConfig.id), oLinkConfig.destination);
        }
    }

    createButtons(oButtonConfigs) {
        for (var sButtonId in oButtonConfigs) {
            var oButtonConfig = oButtonConfigs[sButtonId];

            this.addButtonToContainer(
                this.getElement(oButtonConfig.targetContainer),
                oButtonConfig.text,
                oButtonConfig.destination,
                oButtonConfig.classes,
                oButtonConfig.backgroundColor,
                oButtonConfig.openInNewTab
            );
        }
    }

    createLinks(oLinkConfigs) {
        for (var sLinkId in oLinkConfigs) {
            var oLinkConfig = oLinkConfigs[sLinkId];

            var sType = oLinkConfig.type === "button" ? "button" : "";
            var sTarget = oLinkConfig.openInNewTab ? "_blank" : "_self";
            var sBackground = oLinkConfig.backgroundColor ? "background: " + oLinkConfig.backgroundColor : "";

            var oTargetContainer = this.getElement(oLinkConfig.targetContainer);

            if (oTargetContainer) {
                var sLink = `<a id="${oLinkConfig.id}" class="${sType}" style="${sBackground}" href="${oLinkConfig.destination}" target="${sTarget}">${oLinkConfig.text}</a>`;
                this.addElementToContainer(this.createElementFromHTML(sLink), oTargetContainer);
            }
        }
    }

    moveElements(oMoveConfigs) {
        for (var sElementId in oMoveConfigs) {
            var oMoveConfig = oMoveConfigs[sElementId];

            this.addElementToContainer(
                this.getElement(oMoveConfig.id),
                this.getElement(oMoveConfig.targetContainer),
                oMoveConfig.position
            );
        }
    }

    modifyElementStyles(oModifyStyleConfigs) {
        for (var sElementId in oModifyStyleConfigs) {
            var oStyleConfig = oModifyStyleConfigs[sElementId];

            if (oStyleConfig.class) {
                this.getElementsByClass(oStyleConfig.class).forEach(oElement => {
                    this.addElementStyles(
                        oElement,
                        oStyleConfig.styles
                    );
                });
            } else {
                this.addElementStyles(
                    this.getElement(oStyleConfig.id),
                    oStyleConfig.styles
                );
            }
        }
    }

    modifyTagStyles(oModifyStyleConfigs) {
        for (var sTag in oModifyStyleConfigs) {
            var oStyleConfig = oModifyStyleConfigs[sTag];
            this.getElementsByTag(oStyleConfig.tag).forEach(oElement => {
                this.addElementStyles(
                    oElement,
                    oStyleConfig.styles
                );
            });
        }
    }

    modifyElementClasses(oModifyElementClassConfigs) {
        for (var sElementId in oModifyElementClassConfigs) {
            var oClassConfig = oModifyElementClassConfigs[sElementId];

            if (oClassConfig.class) {
                this.getElementsByClass(oClassConfig.class).forEach(oElement => {
                    this.addElementStyles(
                        oElement,
                        oClassConfig.styles
                    );
                });
            } else {
                this.addStyleClassToElement(
                    this.getElement(oClassConfig.id),
                    oClassConfig.classes
                );
            }
        }
    }
}

class PostsViewParser extends ViewConfigParser {
    createCustomSetGroup(oConfigs) {
        if (Object.keys(oConfigs).length > 0) {
            var fSetsLoadedCallback = function () {
                for (var sKey in oConfigs) {
                    var oGroupConfig = oConfigs[sKey];

                    if (!this.doesGroupExist(oGroupConfig.id)) {
                        var oSetSelect = this.getElement("add-to-set-id");

                        var oCustomGroup = this.createOptionGroup(oGroupConfig.id, oGroupConfig.title);
                        this.moveOptionsByName(
                            oSetSelect,
                            oCustomGroup,
                            oGroupConfig.setSelector,
                            oGroupConfig.sets
                        );

                        this.addGroupToSelect(oSetSelect, oCustomGroup, oGroupConfig.position);
                    }
                }
            }.bind(this)

            var oAddToSetButton = this.getElement("set");
            if (oAddToSetButton) oAddToSetButton.onclick = function () {
                this.waitUntilSetsAreLoaded("add-to-set-id", fSetsLoadedCallback);
            }.bind(this)
        }
    }

    moveElementToSetSelectionDialog(oConfig) {
        var oSelectionDialog = this.getElement("add-to-set-dialog");
        if (!oSelectionDialog) return;
        var oSetSelectionForm = oSelectionDialog.children[0];
        if (oSetSelectionForm)
            for (var sKey in oConfig) {
                var oMoveConfig = oConfig[sKey];

                this.addElementToContainer(this.getElement(oMoveConfig.id), oSetSelectionForm, oMoveConfig.position);
            }
    }

    waitUntilSetsAreLoaded(sSelectId, fCallback) {
        var oTarget = this.getElement(sSelectId);
        var fObserverCallback = function (mutationsList, observer) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    if (mutation.target.options[0].innerText !== "Loading...") {
                        oObserver.disconnect();
                        fCallback()
                    }
                }
            });
        };
        var oObserver = new MutationObserver(fObserverCallback);
        oObserver.observe(oTarget, { attributes: true, childList: true, subtree: true });
    }
}

class SetsViewParser extends ViewConfigParser {
    constructor(sPath, sSearchParameters) {
        super(sPath, sSearchParameters);

        this.bTablesAdded = false;
    }

    createCustomSetTables(oConfig) {
        if (!this.bTablesAdded) {
            for (var sKey in oConfig) {
                var oTableConfig = oConfig[sKey];

                var oNewTableSection = this.createTableWithTitle(oTableConfig.id, oTableConfig.title);
                this.moveSetsToTable("set-index", oNewTableSection.table, oTableConfig.setSelector, oTableConfig.setNames);
                this.addElementToContainer(oNewTableSection.container, "set-index", oTableConfig.position);
            }
            this.bTablesAdded = true;
        }
    }
}

class Profile {
    constructor(sId, sName, sDescription, bIsActive, oViewConfigrations, bDeletable, bEditable) {
        this.deletable = bDeletable === undefined ? true : bDeletable;
        this.editable = bEditable === undefined ? true : bEditable;

        this.id = sId;
        this.name = sName;
        this.description = sDescription;
        this.active = bIsActive || false;

        this.viewConfigurations = {};
        if (oViewConfigrations) {
            this.#parseViewConfigs(oViewConfigrations);
        }
    }

    parseProfile(oProfile) {
        this.setName(oProfile.name);
        this.setDescription(oProfile.description);
        this.setActive(oProfile.active);
        this.editable = oProfile.editable;
        this.deletable = oProfile.deletable;

        this.#parseViewConfigs(oProfile.viewConfigurations);
        return this;
    }

    #parseViewConfigs(oViewConfigs) {
        for (var sConfigId in oViewConfigs) {
            var oViewConfig = oViewConfigs[sConfigId];

            var oParsedProfile = this.#createViewConfigurator(
                oViewConfig.id,
                oViewConfig.path,
                oViewConfig.includeSubPaths,
                oViewConfig.searchParameters
            ).parseViewConfig(oViewConfig);

            this.viewConfigurations[sConfigId] = oParsedProfile;
        }
    }

    setActive(bIsActive) {
        if (bIsActive === undefined) bIsActive = false;
        this.active = bIsActive;
    }

    isActive() {
        return this.active;
    }

    getIsActive() {
        return this.active;
    }

    setId(sId) {
        this.id = sId;
    }

    getId() {
        return this.id;
    }

    setName(sName) {
        this.name = sName;
    }

    getName() {
        return this.name;
    }

    setDescription(sDescription) {
        this.description = sDescription;
    }

    getDescription() {
        return this.description;
    }

    getActive() {
        return this.active;
    }

    createPathId(sPath) {
        var sId = sPath;
        if (this.viewConfigurations[sId]) {
            this.createPathId(sPath + this.viewConfigurations.length);
        } else {
            return sId;
        }
    }

    isEditable() {
        return this.editable;
    }

    isDeletable() {
        return this.deletable;
    }

    generateJsonConfiguration() {
        var oConfigJson = {
            deletable: this.deletable,
            editable: this.editable,
            id: this.id,
            name: this.name,
            description: this.description,
            active: this.active,
            viewConfigurations: {}
        }

        for (var sKey in this.viewConfigurations) {
            var oViewConfig = this.viewConfigurations[sKey];
            oConfigJson.viewConfigurations[sKey] = oViewConfig.getConfiguration();
        }

        return oConfigJson;
    }

    #createViewConfigurator(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        bIncludeSubPaths = bIncludeSubPaths === undefined ? true : bIncludeSubPaths;
        if (sPath.includes("/posts")) {
            return new PostViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters);
        } else if (sPath.includes("/post_sets")) {
            return new SetsViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters);
        } else if (sPath.includes("/uploads")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "uploads");
        } else if (sPath.includes("/favorites")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "favorites");
        } else if (sPath.includes("/post_versions")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "postVersions");
        } else if (sPath.includes("/comments")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "comments");
        } else if (sPath.includes("/artists")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "artists");
        } else if (sPath.includes("/tag")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "tags");
        } else if (sPath.includes("/blips")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "blips");
        } else if (sPath.includes("/pools")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "pools");
        } else if (sPath.includes("/wiki_pages")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "wiki");
        } else if (sPath.includes("/forum_topics")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "forum");
        } else if (sPath === "/" || sPath === "/*") {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, rootViewId);
        } else {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "unknown");
        }
    }

    createViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        var oConfigurator = this.#createViewConfigurator(sId, sPath, bIncludeSubPaths, sSearchParameters);
        this.viewConfigurations[sId] = oConfigurator;
        return oConfigurator;
    }

    getViewConfiguration(sId) {
        return this.viewConfigurations[sId];
    }

    deleteViewConfiguration(sId) {
        delete this.viewConfigurations[sId];
    }
}

const createdProfilesStorageKey = "createdProfiles";
class ProfileStorage {
    static deleteStoredProfiles(sKey) {
        GM_deleteValue(sKey);
        console.log("Deleted stored data: " + sKey);
    }

    static loadCreatedProfiles() {
        var oCreatedProfileConfigs = this.#getCreatedProfielConfigs();
        var oParsedProfiles = {};
        for (var sProfileId in oCreatedProfileConfigs) {
            oParsedProfiles[sProfileId] = new Profile(sProfileId).parseProfile(oCreatedProfileConfigs[sProfileId]);
        }
        return oParsedProfiles;
    }

    static loadProfile(sProfileId) {
        var oProfiles = GM_getValue(createdProfilesStorageKey);
        var oProfile;
        for (var sKey in oProfiles) {
            if (sKey === sProfileId) {
                oProfile = oProfiles[sKey];
                break;
            }
        };

        if (oProfile) {
            return new Profile(oProfile.id).parseProfile(oProfile);
        }

    }

    static setProfileActive(oProfile, bIsActive) {
        oProfile.setActive(bIsActive);
        this.saveProfile(oProfile, bIsActive);
    }

    static deleteProfile(oProfileId) {
        var oConfigs = this.#getCreatedProfielConfigs();
        delete oConfigs[oProfileId];
        this.#saveToStorage(createdProfilesStorageKey, oConfigs);
        console.log("Deleted config: " + oProfileId);
    }

    static #getCreatedProfielConfigs() {
        return GM_getValue(createdProfilesStorageKey);
    }

    static #saveToStorage(sKey, vValue) {
        GM_setValue(sKey, vValue);
    }

    static saveProfile(oProfile, bIsActive) {
        var oCreatedProfiles = this.#getCreatedProfielConfigs();
        var sProfileId = oProfile.getId();

        if (!oCreatedProfiles) oCreatedProfiles = {};
        oProfile.active = bIsActive;
        oCreatedProfiles[sProfileId] = oProfile.generateJsonConfiguration();

        if (bIsActive) {
            for (var sExisitingProfileId in oCreatedProfiles) {
                if (sExisitingProfileId !== sProfileId) oCreatedProfiles[sExisitingProfileId].active = false;
            }
        }

        this.#saveToStorage(createdProfilesStorageKey, oCreatedProfiles);
        console.log("Saved config: " + sProfileId);
    }
}

const S87TweeksId = "s87Tweeks";
const e621ProfileId = "e621Profile";

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

    function createNewProfile(sId, sName, sDescription, oIsActive, oViewConfigs, bDeletable, bEditable) {
        return new Profile(sId, sName, sDescription, oIsActive, oViewConfigs, bDeletable, bEditable);
    }

    var oProfileDraft;
    function clearProfileDraft() {
        oProfileDraft = null;
    }

    function saveProfileDraft(oProfile) {
        if (oProfile) oProfileDraft = oProfile;
    }

    function getProfileDraft() {
        return oProfileDraft;
    }

    function reloadProfiles() {
        oHtmlFunctions.getElement("viewConfig-content").innerHTML = "";
    }

    function displayConfirmationDialog(sTitle, sText, fConfirmHandler, fCancelHandler) {
        var oDialog = oHtmlFunctions.createDialog("confirmationDialog", sTitle, true);

        var oTextSection = oHtmlFunctions.createElementFromHTML(`<div style="padding-top: 15px; padding-left: 10px; padding-right: 10px;">${sText}</div>`);
        oHtmlFunctions.addElementToContainer(oTextSection, oDialog.content)

        var oCancelButton = oHtmlFunctions.createButton(undefined, "Cancel", function () {
            oHtmlFunctions.hideElement("confirmationDialog");
            if (fCancelHandler) fCancelHandler();
        });

        var oConfirmButton = oHtmlFunctions.createButton("profileCreation-creationButton", "Confirm", function () {
            oHtmlFunctions.hideElement("confirmationDialog");
            if (fConfirmHandler) fConfirmHandler()
        });

        oHtmlFunctions.addElementStyles(oCancelButton, { float: "left" });
        oHtmlFunctions.addElementStyles(oConfirmButton, { float: "right" });
        oHtmlFunctions.addElementToContainer(oCancelButton, oDialog.footer);
        oHtmlFunctions.addElementToContainer(oConfirmButton, oDialog.footer);

        return oDialog.dialog;
    }

    function createBasicInfoForm(bCreationMode, oProfile) {
        var oBasicInfoContainer = oHtmlFunctions.createElementFromHTML('<div class="box-section" style="display: flex"></div>');
        var oBasicInfoForm = oHtmlFunctions.createElementFromHTML('<form class="border-bottom"></form>');

        var aBasicInfoElents = [];
        var sLabelStyle = `float: left; width:60%; margin-bottom: 10px`;
        var sInputStyle = `float: left; width:39%; margin-bottom: 10px`;

        if (bCreationMode) {
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">ID:<label style="color: red">*</label></label>`));
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<input id="profileIdInput" style="${sInputStyle}" type="text" required><br><br>`));

            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Name:<label style="color: red">*</label></label><br>`));
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<input id="profileNameInput" style="${sInputStyle}" type="text" required><br><br>`));

            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Description:</label><br>`));
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<input id="profileDescriptionInput" style="${sInputStyle}" type="text"><br><br>`));
        } else {
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">ID:</label>`));
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<div style="${sInputStyle}">${oProfile.id}</div><br><br>`));

            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Name:<label style="color: red">*</label></label><br>`));
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<input id="profileNameInput" style="${sInputStyle}" value="${oProfile.name}" type="text" required><br><br>`));

            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Description:</label><br>`));
            aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<input id="profileDescriptionInput" style="${sInputStyle}" value="${oProfile.description}" type="text"><br><br>`));

            if (oProfile.isDeletable()) {
                var oDeleteButton = oHtmlFunctions.createButton(
                    undefined, "Delete", function (oEvent) {

                        var sText = `Confirm the deletion of the profile '${oEvent.srcElement.dataset.profile_name}'`;
                        var sProfielId = oEvent.srcElement.dataset.profile_id;
                        displayConfirmationDialog("Confirm Profile Deletion", sText, function () {
                            ProfileStorage.deleteProfile(sProfielId);
                            displayProfileSelection();
                        });

                    }, { profile_id: oProfile.getId(), profile_name: oProfile.getName() }
                );

                oHtmlFunctions.addElementStyles(oDeleteButton, { "padding-top": "10px", "padding-left": "0px" });
                aBasicInfoElents.push(oDeleteButton);
            }

            if (oProfile.isEditable()) {
                var oExportButton = oHtmlFunctions.createButton(undefined, "Export", function () {
                    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(oProfile.generateJsonConfiguration()));
                    var oDownloadAnchor = oHtmlFunctions.createElementFromHTML('<a></a>');
                    var sFileName = oProfile.getName();

                    oDownloadAnchor.setAttribute("href", dataStr);
                    oDownloadAnchor.setAttribute("download", `${sFileName}.json`);
                    oDownloadAnchor.click();
                });
                oHtmlFunctions.addElementStyles(oExportButton, { "padding-top": "10px", "padding-left": "0px", "display": "block" });

                aBasicInfoElents.push(oExportButton);
            }
        }

        aBasicInfoElents.forEach(oElement => {
            oHtmlFunctions.addElementToContainer(oElement, oBasicInfoForm);
        });

        oHtmlFunctions.addElementToContainer(oBasicInfoForm, oBasicInfoContainer);

        return oBasicInfoContainer;
    }

    function createViewConfigurationTable(bCreationMode, oProfile) {
        var oTableContainer = oHtmlFunctions.createContainerWithTitle("viewConfig-container", "View Configurations", "h3", { "margin-top": "5px", "margin-bottom": "20px" });

        var oCreateSection = oHtmlFunctions.createElementFromHTML(`<div></div>`);
        var oPathInput = oHtmlFunctions.createElementFromHTML(`<lable>Path:</label><input id="configCreationPathInput" type="text" style="margin-left: 5px; width: 100px" placeholder="e.g. /posts">`);

        oPathInput.addEventListener("input", function (oEvent) {
            oHtmlFunctions.setInputErrorState(oEvent.srcElement, false);
        });

        var oCreateConfigButton = oHtmlFunctions.createButton("viewConfig-creationButton", "Create", function () {
            var oPathInput = oHtmlFunctions.getElement("configCreationPathInput");
            var sPath = oPathInput.value;
            if (sPath) {
                oHtmlFunctions.setInputErrorState(oPathInput, false);
                onCreateViewConfig(bCreationMode, oProfile, sPath)
            } else {
                oHtmlFunctions.setInputErrorState(oPathInput, true, "Enter a path");
            }
        });

        oHtmlFunctions.addElementStyles(oCreateSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oPathInput, oCreateSection);
        oHtmlFunctions.addElementToContainer(oCreateConfigButton, oCreateSection);
        oHtmlFunctions.addElementToContainer(oCreateSection, oTableContainer);

        var oViewConfigTable = oHtmlFunctions.createTable("viewConfigTable", ["table", "striped"]);

        oHtmlFunctions.addElementToContainer(oViewConfigTable, oTableContainer);
        oHtmlFunctions.createTableColumns(oViewConfigTable, ["View", "Path", "Parameters", "", ""]);

        var oTableRows = {};
        var oViewConfigs = oProfile.viewConfigurations;

        var aSortedConfigs = [];
        for (var sConfig in oViewConfigs) {
            aSortedConfigs.push(oViewConfigs[sConfig]);
        };

        aSortedConfigs.sort((a, b) => {
            return (a.path.length + a.searchParameters.length) - (b.path.length + b.searchParameters.length);
        });

        var oCellStyles = {
            "padding-left": "20px"
        }

        aSortedConfigs.forEach(oViewConfig => {
            oTableRows[oViewConfig.getId()] = {
                view: {
                    index: 0,
                    content: oViewConfig.getViewId()
                },
                path: {
                    index: 1,
                    content: oViewConfig.getPath(),
                    styles: oCellStyles
                },
                parameters: {
                    index: 2,
                    content: oViewConfig.getSearchParameters() || "",
                    styles: oCellStyles
                },
                editButton: {
                    index: 3,
                    content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        onEditViewConfig(bCreationMode, oProfile, oEvent.srcElement.dataset.config_id)
                    }, { config_id: oViewConfig.getId() })
                },
                deleteButton: {
                    index: 4,
                    content: oHtmlFunctions.createButton(undefined, "Delete", function (oEvent) {
                        var sViewConfigId = oEvent.srcElement.dataset.config_id;
                        var sPath = oEvent.srcElement.dataset.path;

                        oProfile.deleteViewConfiguration(sViewConfigId);
                        oHtmlFunctions.removeTableRow(oViewConfigTable, { column: "Path", value: sPath })
                    }, { config_id: oViewConfig.getId(), path: oViewConfig.getPath() })
                }
            }
        });

        oHtmlFunctions.createTableRows(oViewConfigTable, oTableRows);

        return oTableContainer;
    }

    function onEditViewConfig(bCreationMode, oProfile, sViewConfigId) {
        var oViewConfig = oProfile.getViewConfiguration(sViewConfigId);
        switch (oViewConfig.getViewId()) {
            case postViewId:
                displayPostViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            case setViewId:
                displaySetViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            default:
                displayBasicViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
        }
    }

    function createHiddenElementSection(oViewConfiguration) {
        var oHiddenElementsSection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-top: 20px; margin-bottom: 10px"></div>`);

        var aHiddenElements = oViewConfiguration.getHiddenElements();
        var iHiddenElementCount = aHiddenElements.length;

        var sHiddenElementsTitle = `Hidden Elements(${iHiddenElementCount})`;
        var oShowHiddenElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showHiddenElementsTitle">${sHiddenElementsTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="hiddenElements-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowHiddenElementsContainer);

        var oHideHiddenElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideHiddenElementsTitle">${sHiddenElementsTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="hiddenElements-hideSectionButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideHiddenElementsContainer);

        var oHideElementButtonSection = oHtmlFunctions.createElementFromHTML(`
            <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
            <div>
        `);

        var oElementInput = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. image-resize-selector", undefined, true);
        oHtmlFunctions.addElementToContainer(oElementInput.container, oHideElementButtonSection);


        var oHideElementButton = oHtmlFunctions.createButton("hiddenElements-hideButton", "Hide Element", function () {
            var oInput = oElementInput.input;

            var fSelectorInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;

                if (oSrcElement.value.includes(" ")) {
                    oHtmlFunctions.setInputErrorState(oSrcElement, true, "The element ID can't contain spaces")
                } else {
                    oHtmlFunctions.setInputErrorState(oSrcElement, false);
                }
            }

            oInput.addEventListener("input", fSelectorInputHandler);

            var sId = oInput.value;
            if (sId) {
                oHtmlFunctions.setInputErrorState(oElementInput.input, false,);
                var oHiddenElement = oViewConfiguration.hideElement(sId);

                if (!oHiddenElement) {
                    oHtmlFunctions.setInputErrorState(oInput, true, "Element has already been hidden");
                    return;
                }


                var sHiddenElementsTitle = `Hidden Elements(${oViewConfiguration.getHiddenElements().length})`;
                oHtmlFunctions.getElement("showHiddenElementsTitle").innerText = sHiddenElementsTitle;
                oHtmlFunctions.getElement("hideHiddenElementsTitle").innerText = sHiddenElementsTitle;

                oInput.value = "";
                oHtmlFunctions.createTableRows(oHiddenElementsTable, {
                    sId: {
                        elementId: { index: 0, content: sId },
                        removeButton: {
                            index: 1,
                            content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                                oViewConfiguration.removeHiddenElement(oEvent.srcElement.dataset.element_id);
                                oHtmlFunctions.removeTableRow(oHiddenElementsTable, { column: "Element ID", value: sId });

                                var sHiddenElementsTitle = `Hidden Elements(${oViewConfiguration.getHiddenElements().length})`;
                                oHtmlFunctions.getElement("showHiddenElementsTitle").innerText = sHiddenElementsTitle;
                                oHtmlFunctions.getElement("hideHiddenElementsTitle").innerText = sHiddenElementsTitle;
                            }, { element_id: sId })
                        }
                    }
                });
            } else {
                oHtmlFunctions.setInputErrorState(oElementInput.input, true, "Element ID can't be empty");
            }
        });
        oHtmlFunctions.addElementStyles(oHideElementButton, { padding: "0.25rem 0rem" });

        oHtmlFunctions.addElementStyles(oHideElementButton, { "margin-top": "20px" });
        oHtmlFunctions.addElementStyles(oHideElementButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oHideElementButton, oHideElementButtonSection, 6);
        oHtmlFunctions.addElementToContainer(oHideElementButtonSection, oHideHiddenElementsContainer);

        var oHiddenElementsTable = oHtmlFunctions.createTable("hiddenElementsTable", ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oHiddenElementsTable, ["Element ID", ""]);

        var oHiddenElementRows = {};
        aHiddenElements.forEach(sHiddenElementId => {
            oHiddenElementRows[sHiddenElementId] = {
                elementId: {
                    index: 0,
                    content: sHiddenElementId
                },
                removeButton: {
                    index: 1,
                    content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sElementId = oEvent.srcElement.dataset.element_id;
                        oViewConfiguration.removeHiddenElement(sElementId);

                        oHtmlFunctions.removeTableRow(oHiddenElementsTable, { column: "Element ID", value: sElementId });

                        var sHiddenElementsTitle = `Hidden Elements(${oViewConfiguration.getHiddenElements().length})`;
                        oHtmlFunctions.getElement("showHiddenElementsTitle").innerText = sHiddenElementsTitle;
                        oHtmlFunctions.getElement("hideHiddenElementsTitle").innerText = sHiddenElementsTitle;
                    }, { element_id: sHiddenElementId })
                }
            }
        });

        oHtmlFunctions.createTableRows(oHiddenElementsTable, oHiddenElementRows);
        oHtmlFunctions.addElementToContainer(oHiddenElementsTable, oHiddenElementsSection);
        oHtmlFunctions.addElementToContainer(oHiddenElementsTable, oHideHiddenElementsContainer);

        oHtmlFunctions.addElementToContainer(oShowHiddenElementsContainer, oHiddenElementsSection);
        oHtmlFunctions.addElementToContainer(oHideHiddenElementsContainer, oHiddenElementsSection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideHiddenElementsContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowHiddenElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideHiddenElementsContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowHiddenElementsContainer, "display", "block");
        });

        return oHiddenElementsSection;
    }

    function createModifiedElementSection(oViewConfiguration) {
        var oModifiedElementSelection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oModifiedElements = {
            ...oViewConfiguration.getStyleModifiedElements(), ...oViewConfiguration.getClassModifiedElements()
        };
        var iModifiedElementCount = Object.keys(oModifiedElements).length;

        var sModifiedElementsTitle = `Modified Elements(${iModifiedElementCount})`;
        var oShowModifiedElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showModifiedElementsTitle">${sModifiedElementsTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="modifyElements-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowModifiedElementsContainer);

        var oHideModifiedElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideModifiedElementsTitle">${sModifiedElementsTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="modifyElements-hideButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideModifiedElementsContainer);

        var oModifyElementInputSection = oHtmlFunctions.createElementFromHTML(`
        <div style="margin-top: 15px; margin-left: 10px">
            <div>Select by class</div> 

            <br>
            <div style="display: block">Operation:</div>
            <br>
            <br>

            <div id="modifyElements-styleSection">
                <div id="modifyElements-stylesLabel" style="display: block">Styles:</div>
                <input id="modifyElements-stylesInput" type="text" style="width: 600px; margin-top: 5px" placeholder='e.g. "font-size":"20px", "color":"red", ...'>
            </div>

            <div id="modifyElements-classSection" style="display: none">
                <div id="modifyElements-classesLabel" style="display: block">Classes:</div>
                <input id="modifyElements-classesInput" type="text" style="width: 400px; margin-top: 5px" placeholder="e.g. search-tag, wiki-link, ...">
            </div>
        <div>`
        );

        var oClassSelectorCheckbox = oHtmlFunctions.createElementFromHTML('<input id="modifyElements-classSlectorCheckbox" type="checkbox">');
        oHtmlFunctions.addElementToContainer(oClassSelectorCheckbox, oModifyElementInputSection, 2);

        var oIdSelectorSection = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. add-to-set-id", undefined, true);
        oHtmlFunctions.addElementToContainer(oIdSelectorSection.container, oModifyElementInputSection, 3);

        var oClassInput = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. search-tag", "Element Class:", true, true);
        oHtmlFunctions.addElementStyles(oClassInput.container, { "display": "none" })
        oHtmlFunctions.addElementToContainer(oClassInput.container, oModifyElementInputSection, 3);

        var oOperationSelection = oHtmlFunctions.createElementFromHTML(`
            <select id="modifyElements-operationSelection" style="margin-top: 5px">
                <option value="${oViewConfiguration.MODIFY_STYLE_OPERATION}">Add Style</option>
                <option value="${oViewConfiguration.MODIFY_CLASS_OPERATION}">Add Class</option>
            </select><br><br>`
        );
        oHtmlFunctions.addElementToContainer(oOperationSelection, oModifyElementInputSection, 10);

        var fSelectorInputHandler = function (oEvent) {
            var oSrcElement = oEvent.srcElement;

            if (oSrcElement.value.includes(" ")) {
                oHtmlFunctions.setInputErrorState(oSrcElement, true, "Selector can't contain spaces")
            } else {
                oHtmlFunctions.setInputErrorState(oSrcElement, false);
            }
        }

        oIdSelectorSection.input.addEventListener("input", fSelectorInputHandler);
        oClassInput.input.addEventListener("input", fSelectorInputHandler);

        oHtmlFunctions.addElementToContainer(oHtmlFunctions.createElementFromHTML("<br>"), oModifyElementInputSection, 3);
        oHtmlFunctions.addElementToContainer(oHtmlFunctions.createElementFromHTML("<br>"), oModifyElementInputSection, 3);

        var fClassSelectorCheckedHandler = function () {
            if (oClassSelectorCheckbox.checked) {
                oHtmlFunctions.hideElement(oIdSelectorSection.container);
                oHtmlFunctions.addStyleToElement(oClassInput.container, "display", "block");
            } else {
                oHtmlFunctions.hideElement(oClassInput.container);
                oHtmlFunctions.addStyleToElement(oIdSelectorSection.container, "display", "block");
            }
        }

        oClassSelectorCheckbox.addEventListener("change", fClassSelectorCheckedHandler);

        var fOperationChangedHandler = function () {
            if (oOperationSelection.value === oViewConfiguration.MODIFY_STYLE_OPERATION) {
                oHtmlFunctions.hideElement("modifyElements-classSection");
                oHtmlFunctions.addStyleToElement("modifyElements-styleSection", "display", "block");
            } else {
                oHtmlFunctions.hideElement("modifyElements-styleSection");
                oHtmlFunctions.addStyleToElement("modifyElements-classSection", "display", "block");
            }
        }

        oOperationSelection.addEventListener("change", fOperationChangedHandler);

        oHtmlFunctions.addElementToContainer(oModifyElementInputSection, oHideModifiedElementsContainer);

        var oModifiedElementsTable = oHtmlFunctions.createTable("modifiedElementsTable", ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oModifiedElementsTable, ["Element ID", "Element Class", "Operation", "Values", "", ""]);

        var fClearInputFields = function () {
            oIdSelectorSection.input.value = "";
            oClassInput.input.value = "";
            oHtmlFunctions.getElement("modifyElements-stylesInput").value = "";
            oHtmlFunctions.getElement("modifyElements-classesInput").value = "";

            oIdSelectorSection.input.disabled = false;
            oClassInput.input.disabled = false;
            oOperationSelection.disabled = false;
            oHtmlFunctions.getElement("modifyElements-classSlectorCheckbox").disabled = false;
        }

        var fEditElementModification = function (sElementId, sOperation) {
            var oModifiedElements = { ...oViewConfiguration.getStyleModifiedElements(), ...oViewConfiguration.getClassModifiedElements() };
            var oElement;

            for (var sKey in oModifiedElements) {
                if (oModifiedElements[sKey].id === sElementId || oModifiedElements[sKey].class === sElementId) {
                    if (oModifiedElements[sKey].operation === sOperation) {
                        oElement = oModifiedElements[sKey];
                        break;
                    }
                }
            }

            var oClassSelectorCheckbox = oHtmlFunctions.getElement("modifyElements-classSlectorCheckbox");
            oClassSelectorCheckbox.checked = oElement.class || false;
            oClassSelectorCheckbox.disabled = true;
            fClassSelectorCheckedHandler();

            oIdSelectorSection.input.value = oElement.id;
            oIdSelectorSection.input.disabled = true;

            oClassInput.input.value = oElement.class;
            oClassInput.input.disabled = true;

            oOperationSelection.value = oElement.operation;
            oOperationSelection.disabled = true;
            fOperationChangedHandler();

            oHtmlFunctions.getElement("modifyElements-stylesInput").value = oElement.styles ? JSON.stringify(oElement.styles).replace(/[{}]/g, "") : "";
            oHtmlFunctions.getElement("modifyElements-classesInput").value = oElement.classes ? oElement.classes.join(", ") : "";

            var oModifyButton = oHtmlFunctions.getElement("modifyElements-modifyButton");
            oModifyButton.innerText = "Save";
            oModifyButton.dataset.update = true;
        };

        var fCreateModifyTableEntry = function (oTable, oModifiedElement) {
            var sContent = "";
            if (oModifiedElement.operation === oViewConfiguration.MODIFY_STYLE_OPERATION && oModifiedElement.styles) {
                sContent = JSON.stringify(oModifiedElement.styles).replace(/[{}]/g, "");
            } else if (oModifiedElement.operation === oViewConfiguration.MODIFY_CLASS_OPERATION && oModifiedElement.classes) {
                sContent = oModifiedElement.classes.join(", ");
            }

            oHtmlFunctions.createTableRows(oTable, {
                sId: {
                    elementId: { index: 0, content: oModifiedElement.id || "" },
                    elementClass: { index: 1, content: oModifiedElement.class || "" },
                    operation: { index: 2, content: oModifiedElement.operation },
                    values: { index: 3, content: sContent },
                    removeButton: {
                        index: 4, content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                            var sElementId = oEvent.srcElement.dataset.element_id;
                            var sElementClass = oEvent.srcElement.dataset.element_class;
                            var sOperation = oEvent.srcElement.dataset.operation;
                            var bUseClassSelector = sElementClass ? true : false;

                            if (sOperation === "modifyStyle") {
                                oViewConfiguration.removeElementStyleModification(sElementId, sElementClass);
                            } else {
                                oViewConfiguration.removeElementClassModification(sElementId, sElementClass);
                            }

                            oHtmlFunctions.removeTableRow(oTable, { columns: [{ column: bUseClassSelector ? "Element Class" : "Element ID", value: bUseClassSelector ? sElementClass : sElementId }] });

                            var iModifiedElements = Object.keys(oViewConfiguration.getStyleModifiedElements()).length + Object.keys(oViewConfiguration.getClassModifiedElements()).length;
                            var sHiddenElementsTitle = `Modified Elements(${iModifiedElements})`;
                            oHtmlFunctions.getElement("showModifiedElementsTitle").innerText = sHiddenElementsTitle;
                            oHtmlFunctions.getElement("hideModifiedElementsTitle").innerText = sHiddenElementsTitle;
                        }, { element_id: oModifiedElement.id || "", element_class: oModifiedElement.class || "", operation: oModifiedElement.operation || "" })
                    },
                    editButton: {
                        index: 5,
                        content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                            fEditElementModification(oEvent.srcElement.dataset.element_id, oEvent.srcElement.dataset.operation);
                        }, { element_id: oModifiedElement.id || oModifiedElement.class, operation: oModifiedElement.operation })
                    }
                }
            });
        }

        var fModifyElement = function () {
            var oModifyButton = oHtmlFunctions.getElement("modifyElements-modifyButton");
            var bUpdate = oModifyButton.dataset.update === "true";
            var bUseClassSelector = oHtmlFunctions.getElement("modifyElements-classSlectorCheckbox").checked;

            var sIdSelector = oIdSelectorSection.input.value;
            var sClassSelector = oClassInput.input.value;

            var oOperationSelection = oHtmlFunctions.getElement("modifyElements-operationSelection");

            var sOperation = oOperationSelection.value;

            var sRawStyles = oHtmlFunctions.getElement("modifyElements-stylesInput").value;
            var sRawClassInput = oHtmlFunctions.getElement("modifyElements-classesInput").value;

            if (bUseClassSelector) {
                sIdSelector = undefined;

                if (!sClassSelector) {
                    oHtmlFunctions.setInputErrorState(oClassInput.input, true, "The Class selector can't be empty");
                    return;
                }
            } else {
                sClassSelector = undefined;

                if (!sIdSelector) {
                    oHtmlFunctions.setInputErrorState(oIdSelectorSection.input, true, "Element ID can't be empty");
                    return;
                }
            }

            var oModifyEntry;
            if (sOperation === oViewConfiguration.MODIFY_STYLE_OPERATION) {
                try {
                    if (!sRawStyles) {
                        oHtmlFunctions.setInputErrorState("modifyElements-stylesInput", true, "No styles defined");
                        return;
                    }

                    oModifyEntry = oViewConfiguration.modifyElementStyle(sIdSelector, sClassSelector, JSON.parse(`{ ${sRawStyles} }`), bUpdate);
                    if (bUpdate) oHtmlFunctions.removeTableRow(oModifiedElementsTable, { columns: [{ column: oModifyEntry.class ? "Element Class" : "Element ID", value: oModifyEntry.class ? oModifyEntry.class : oModifyEntry.id }, { column: "Operation", value: sOperation }] });
                    oModifyButton.innerText = "Modify Element";
                    oModifyButton.dataset.update = false;

                } catch (oError) {
                    oHtmlFunctions.setInputErrorState("modifyElements-stylesInput", true, "Invalid style entry");
                    return;
                }
            } else {
                if (!sRawClassInput) {
                    oHtmlFunctions.setInputErrorState("modifyElements-classesInput", true, "No classes defined");
                    return;
                }

                oModifyEntry = oViewConfiguration.modifyElementClass(sIdSelector, sClassSelector, sRawClassInput.replace(/ /g, "").split(","), bUpdate);
                if (bUpdate) oHtmlFunctions.removeTableRow(oTable, { column: oModifyEntry.class ? "Element Class" : "Element ID", value: oModifyEntry.class ? oModifyEntry.class : oModifyEntry.id });
                oModifyButton.innerText = "Modify Element";
                oModifyButton.dataset.update = false;

            }

            if (!oModifyEntry) {
                var sMessage = "Element has already been modified";
                var oInput = bUseClassSelector ? oClassInput.input : oIdSelectorSection.input;
                oHtmlFunctions.setInputErrorState(oInput, true, sMessage);
                return;
            }

            var iModifiedElements = Object.keys(oViewConfiguration.getStyleModifiedElements()).length + Object.keys(oViewConfiguration.getClassModifiedElements()).length;
            var sHiddenElementsTitle = `Modified Elements(${iModifiedElements})`;
            oHtmlFunctions.getElement("showModifiedElementsTitle").innerText = sHiddenElementsTitle;
            oHtmlFunctions.getElement("hideModifiedElementsTitle").innerText = sHiddenElementsTitle;

            fCreateModifyTableEntry(oModifiedElementsTable, oModifyEntry);
            fClearInputFields();
        };

        var oModifyElementButton = oHtmlFunctions.createButton("modifyElements-modifyButton", "Modify Element", fModifyElement);
        oHtmlFunctions.addElementStyles(oModifyElementButton, { padding: "0.25rem 0rem" });

        oHtmlFunctions.addElementStyles(oModifyElementButton, { "margin-top": "20px" })

        oHtmlFunctions.addElementStyles(oModifyElementInputSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oModifyElementButton, oModifyElementInputSection);
        oHtmlFunctions.addElementToContainer(oModifyElementInputSection, oHideModifiedElementsContainer);

        var oModifiedElementRows = {};
        for (var sKey in oModifiedElements) {
            var oModifiedElement = oModifiedElements[sKey];

            fCreateModifyTableEntry(oModifiedElementsTable, oModifiedElement);
        }

        oHtmlFunctions.createTableRows(oModifiedElementsTable, oModifiedElementRows);
        oHtmlFunctions.addElementToContainer(oModifiedElementsTable, oModifiedElementSelection);
        oHtmlFunctions.addElementToContainer(oModifiedElementsTable, oHideModifiedElementsContainer);

        oHtmlFunctions.addElementToContainer(oShowModifiedElementsContainer, oModifiedElementSelection);
        oHtmlFunctions.addElementToContainer(oHideModifiedElementsContainer, oModifiedElementSelection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideModifiedElementsContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowModifiedElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideModifiedElementsContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowModifiedElementsContainer, "display", "block");
        });

        return oModifiedElementSelection;
    }

    function createMovedElementSection(oViewConfiguration) {
        var oMovedElementsSection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oMovedElements = oViewConfiguration.getMovedElements();
        var iMovedElementCount = Object.keys(oMovedElements).length;

        var sMovedElementsTitle = `Moved Elements(${iMovedElementCount})`;
        var oShowMovedElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showMovedElementsTitle">${sMovedElementsTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="moveElements-showButton" style="margin-left: 5px; cursor: pointer">show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowMovedElementsContainer);

        var oHideMovedElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideMovedElementsTitle">${sMovedElementsTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="moveElements-hideSectionButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideMovedElementsContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oMoveElementButtonSection = oHtmlFunctions.createElementFromHTML(`
            <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                <div style="${sLabelStyles}">Position:</div>
                <input id="moveElements-positionInput" type="number" min="0" style="width: 60px; margin-top: 5px; display: block" placeholder="e.g. 0">
            <div>
        `);

        var elementInputSection = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. add-to-set", undefined, true);
        oHtmlFunctions.addElementToContainer(elementInputSection.container, oMoveElementButtonSection, 1);
        oHtmlFunctions.addElementStyles(elementInputSection.container, { "margin-top": "10px" });

        var oTargetElementSection = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. image-extra-controls", "Target Container ID / XPath:", true);
        oHtmlFunctions.addElementToContainer(oTargetElementSection.container, oMoveElementButtonSection, 2);
        oHtmlFunctions.addElementStyles(oTargetElementSection.container, { "margin-top": "10px" });

        var fEditMovedElements = function (sElementId) {
            var oMovedElement = oViewConfiguration.getMovedElements()[sElementId];

            elementInputSection.input.value = oMovedElement.id;
            elementInputSection.input.disabled = true;
            oTargetElementSection.input.value = oMovedElement.targetContainer

            oHtmlFunctions.getElement("moveElements-positionInput").value = oMovedElement.position;

            oMoveElementButton.innerText = "Save";
            oMoveElementButton.dataset.update = true;
        };

        var fCreatedMovedElementTableRow = function (sElementId, sTargetId, iPosition) {
            return {
                elementId: { index: 0, content: sElementId },
                targetId: { index: 1, content: sTargetId },
                position: { index: 2, content: iPosition },
                removeButton: {
                    index: 3,
                    content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.element_id;
                        oViewConfiguration.removeElementMove(sId);
                        oHtmlFunctions.removeTableRow(oMovedElementsTable, { column: "Element ID", value: sId });

                        var sMovedElementsTitle = `Moved Elements(${Object.keys(oViewConfiguration.getMovedElements()).length})`;
                        oHtmlFunctions.getElement("showMovedElementsTitle").innerText = sMovedElementsTitle;
                        oHtmlFunctions.getElement("hideMovedElementsTitle").innerText = sMovedElementsTitle;
                    }, { element_id: sElementId })
                },
                editButton: {
                    index: 4,
                    content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditMovedElements(oEvent.srcElement.dataset.element_id);
                    }, { element_id: sElementId })
                }
            };
        };

        var fMoveElement = function (oEvent) {
            var bUpdate = oEvent.srcElement.dataset.update === "true";

            var oElementIdInput = elementInputSection.input;
            var oTargetIdInput = oTargetElementSection.input;
            var oPositionInput = oHtmlFunctions.getElement("moveElements-positionInput");

            var fSelectorInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    oHtmlFunctions.setInputErrorState(oSrcElement, true, "The ID can't contain spaces")
                } else {
                    oHtmlFunctions.setInputErrorState(oSrcElement, false);
                }
            }

            oElementIdInput.addEventListener("input", fSelectorInputHandler);
            oTargetIdInput.addEventListener("input", fSelectorInputHandler);

            var sElementId = oElementIdInput.value;
            var sTargetId = oTargetIdInput.value;
            var iPosition = Number(oPositionInput.value);

            if (sElementId && sTargetId) {
                var oMovedElement = oViewConfiguration.moveElement(sElementId, sTargetId, iPosition, bUpdate);
                if (bUpdate) oHtmlFunctions.removeTableRow(oMovedElementsTable, { column: "Element ID", value: sElementId });
                oEvent.srcElement.dataset.update = false;

                if (!oMovedElement) {
                    oHtmlFunctions.setInputErrorState(oElementIdInput, true, "Element has already been moved");
                    return;
                }

                var sMovedElementsTitle = `Moved Elements(${Object.keys(oViewConfiguration.getMovedElements()).length})`;
                oHtmlFunctions.getElement("showMovedElementsTitle").innerText = sMovedElementsTitle;
                oHtmlFunctions.getElement("hideMovedElementsTitle").innerText = sMovedElementsTitle;

                oElementIdInput.value = "";
                oTargetIdInput.value = "";
                oHtmlFunctions.getElement("moveElements-positionInput").value = "";
                elementInputSection.input.disabled = false;

                oHtmlFunctions.createTableRows(oMovedElementsTable, { sElementId: fCreatedMovedElementTableRow(sElementId, sTargetId, iPosition) });

            } else {
                if (!sElementId) oHtmlFunctions.setInputErrorState(elementInputSection.input, true, "Element ID can't be empty");
                if (!sTargetId) oHtmlFunctions.setInputErrorState(oTargetElementSection.input, true, "Target ID can't be empty");
            }
        };

        var oMoveElementButton = oHtmlFunctions.createButton(undefined, "Move Element", fMoveElement);
        oHtmlFunctions.addElementStyles(oMoveElementButton, { padding: "0.25rem 0rem" });

        oHtmlFunctions.addElementStyles(oMoveElementButton, { "margin-top": "20px" });
        oHtmlFunctions.addElementStyles(oMoveElementButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oMoveElementButton, oMoveElementButtonSection, 6);
        oHtmlFunctions.addElementToContainer(oMoveElementButtonSection, oHideMovedElementsContainer);

        var oMovedElementsTable = oHtmlFunctions.createTable(undefined, ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oMovedElementsTable, ["Element ID", "Target ID", "Position", "", ""]);

        var oMovedElementRows = {};

        for (var sKey in oMovedElements) {
            var oMovedElement = oMovedElements[sKey];
            oMovedElementRows[sKey] = fCreatedMovedElementTableRow(oMovedElement.id, oMovedElement.targetContainer, oMovedElement.position);
        }

        oHtmlFunctions.createTableRows(oMovedElementsTable, oMovedElementRows);
        oHtmlFunctions.addElementToContainer(oMovedElementsTable, oMovedElementsSection);
        oHtmlFunctions.addElementToContainer(oMovedElementsTable, oHideMovedElementsContainer);

        oHtmlFunctions.addElementToContainer(oShowMovedElementsContainer, oMovedElementsSection);
        oHtmlFunctions.addElementToContainer(oHideMovedElementsContainer, oMovedElementsSection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideMovedElementsContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowMovedElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideMovedElementsContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowMovedElementsContainer, "display", "block");
        });

        return oMovedElementsSection;
    }

    function createBasicViewConfigSection(oViewConfiguration) {
        var oViewPathContainer = oHtmlFunctions.createElementFromHTML('<div class="box-section" style="display: flex"></div>');
        var viewConfigPathForm = oHtmlFunctions.createElementFromHTML('<form class="border-bottom"></form>');

        var aBasicInfoElents = [];
        var sLabelStyle = `float: left; width:60%; margin-bottom: 10px`;
        var sInputStyle = `float: left; width:39%; margin-bottom: 10px`;

        aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Path:<label style="color: red">*</label></label>`));
        var oViewPathInput = oHtmlFunctions.createElementFromHTML(`<input id="pathInput" style="${sInputStyle}" type="text" value="${oViewConfiguration.getPath()}" placeholder="e.g /posts" required><br><br>`);
        aBasicInfoElents.push(oViewPathInput);

        oViewPathInput.addEventListener("input", function () {
            oHtmlFunctions.setInputErrorState(oViewPathInput, false);
        });

        aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Include subpaths:</label>`));
        var sCheckboxChecked = oViewConfiguration.areSubpathsIncluded() ? "checked" : "";
        var oIncludeSubpathsCheckbox = oHtmlFunctions.createElementFromHTML(`<input style="margin-bottom: 10px" type="checkbox" ${sCheckboxChecked}><br><br>`);

        oIncludeSubpathsCheckbox.addEventListener("click", function (oEvent) {
            oViewConfiguration.setSubpathsIncluded(oEvent.srcElement.checked);
            oViewPathInput.value = oViewConfiguration.getPath();
        });
        aBasicInfoElents.push(oIncludeSubpathsCheckbox);

        aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}">URL Parameters:</label>`));
        var oViewPathParameterInput = oHtmlFunctions.createElementFromHTML(`<input id="searchParamInput" style="${sInputStyle}" type="text" value="${oViewConfiguration.getSearchParameters()}" placeholder="e.g ?tags=order:score"><br><br>`);
        aBasicInfoElents.push(oViewPathParameterInput);

        aBasicInfoElents.push(oHtmlFunctions.createElementFromHTML(`<label style="${sLabelStyle}"></label>`));
        var oUseCurrentParamsButton = oHtmlFunctions.createButton(undefined, "Use Current Parameters", function () { oViewPathParameterInput.value = unescape(window.location.search) });
        oHtmlFunctions.addElementStyles(oUseCurrentParamsButton, { float: "left", width: "39%", "margin-botom": "10px", padding: "0px" });
        aBasicInfoElents.push(oUseCurrentParamsButton);

        aBasicInfoElents.forEach(oElement => {
            oHtmlFunctions.addElementToContainer(oElement, viewConfigPathForm);
        });

        oHtmlFunctions.addElementToContainer(viewConfigPathForm, oViewPathContainer);

        return oViewPathContainer;
    }

    function createModifyLinkDestination(oViewConfiguration) {
        var oModifiedLinkSection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oChangedLinks = oViewConfiguration.getChangedLinks();
        var iChangedLinkCount = Object.keys(oChangedLinks).length;

        var sChangedLinkTitle = `Changed Links(${iChangedLinkCount})`;
        var oShowChangedLinksContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showChangedLinksTitle">${sChangedLinkTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="changeLink-showButton" style="margin-left: 5px; cursor: pointer">show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowChangedLinksContainer);

        var oHideChangedLinksContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideChangedLinksTitle">${sChangedLinkTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="changeLink-hideSectionButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideChangedLinksContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oChangeLinkButtonSection = oHtmlFunctions.createElementFromHTML(`
            <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                <div style="${sLabelStyles}">New Destination:<label style="color: red">*</label></div>
                <input id="changeLink-destinationInput" type="text" style="width: 620px; margin-top: 5px; display: block" placeholder="e.g. /post_sets?commit=Search&search[creator_name]=S87gmil&search[order]=name">
            <div>
        `);

        var oElementInput = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. subnav-mine-link", undefined, true);
        oHtmlFunctions.addElementToContainer(oElementInput.container, oChangeLinkButtonSection, 1);
        oHtmlFunctions.addElementStyles(oElementInput.container, { "margin-top": "10px" });

        var fChangeLink = function () {
            var bUpdate = oChangeDestinationButton.dataset.update === "true";

            var oElementIdInput = oElementInput.input;
            var oDestinationInput = oHtmlFunctions.getElement("changeLink-destinationInput");

            var fSelectorInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    oHtmlFunctions.setInputErrorState(oSrcElement, true, "The ID can't contain spaces")
                } else {
                    oHtmlFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            var fDestinationInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    oHtmlFunctions.setInputErrorState(oSrcElement, true, "The destination can't contain spaces")
                } else {
                    oHtmlFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            oElementIdInput.addEventListener("input", fSelectorInputHandler);
            oDestinationInput.addEventListener("input", fDestinationInputHandler);

            var sElementId = oElementIdInput.value;
            var sDestination = unescape(oDestinationInput.value);

            if (sElementId && sDestination) {
                if (!sDestination.startsWith("/")) {
                    oHtmlFunctions.setInputErrorState("changeLink-destinationInput", true, "The destination has to start with '/'");
                    return;
                }

                var oChangedLink = oViewConfiguration.changeLinkDestination(sElementId, sDestination, bUpdate);
                if (bUpdate) oHtmlFunctions.removeTableRow(oChangedLinksTable, { column: "Element ID", value: sElementId });
                oChangeDestinationButton.innerText = "Change Destination";
                oChangeDestinationButton.dataset.update = false;

                if (!oChangedLink) {
                    oHtmlFunctions.setInputErrorState(oElementIdInput, true, "Link has already been changed");
                    return;
                }

                var sChangedLinkTitle = `Changed Links(${Object.keys(oViewConfiguration.getChangedLinks()).length})`;
                oHtmlFunctions.getElement("showChangedLinksTitle").innerText = sChangedLinkTitle;
                oHtmlFunctions.getElement("hideChangedLinksTitle").innerText = sChangedLinkTitle;

                oElementIdInput.value = "";
                oDestinationInput.value = "";

                oHtmlFunctions.createTableRows(oChangedLinksTable, { sElementId: fCreateChangedLinkTableRow(sElementId, sDestination) });

            } else {
                if (!sElementId) oHtmlFunctions.setInputErrorState(oElementInput.input, true, "Element ID can't be empty");
                if (!sDestination) oHtmlFunctions.setInputErrorState("changeLink-destinationInput", true, "The destination can't be empty");
            }
        };

        var oChangeDestinationButton = oHtmlFunctions.createButton(undefined, "Change Destination", fChangeLink);
        oHtmlFunctions.addElementStyles(oChangeDestinationButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        oHtmlFunctions.addElementStyles(oChangeLinkButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oChangeDestinationButton, oChangeLinkButtonSection, 5);
        oHtmlFunctions.addElementToContainer(oChangeLinkButtonSection, oHideChangedLinksContainer);

        var fEditChangedLink = function (sElementId) {
            var oChangedLink = oViewConfiguration.getChangedLinks()[sElementId];

            oElementInput.input.value = oChangedLink.id;
            oElementInput.input.disabled = true;
            oHtmlFunctions.getElement("changeLink-destinationInput").value = oChangedLink.destination;

            oChangeDestinationButton.innerText = "Save";
            oChangeDestinationButton.dataset.update = true;
        };

        var fCreateChangedLinkTableRow = function (sElementId, sNewDestination) {
            return {
                elementId: { index: 0, content: sElementId },
                newDestination: { index: 1, content: sNewDestination },
                removeButton: {
                    index: 2,
                    content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.element_id;
                        oViewConfiguration.removeChangeLinkDestination(sId);
                        oHtmlFunctions.removeTableRow(oChangedLinksTable, { column: "Element ID", value: sId });

                        var sChangedLinkTitle = `Changed Links(${Object.keys(oViewConfiguration.getChangedLinks()).length})`;
                        oHtmlFunctions.getElement("showChangedLinksTitle").innerText = sChangedLinkTitle;
                        oHtmlFunctions.getElement("hideChangedLinksTitle").innerText = sChangedLinkTitle;
                    }, { element_id: sElementId })
                },
                editButton: {
                    index: 3,
                    content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditChangedLink(oEvent.srcElement.dataset.element_id);
                    }, { element_id: sElementId })
                }
            };
        };

        var oChangedLinksTable = oHtmlFunctions.createTable(undefined, ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oChangedLinksTable, ["Element ID", "Destination", "", ""]);

        var oChangedLinkRows = {};

        for (var sKey in oChangedLinks) {
            var oChangedLink = oChangedLinks[sKey];
            oChangedLinkRows[sKey] = fCreateChangedLinkTableRow(oChangedLink.id, oChangedLink.destination);
        }

        oHtmlFunctions.createTableRows(oChangedLinksTable, oChangedLinkRows);
        oHtmlFunctions.addElementToContainer(oChangedLinksTable, oModifiedLinkSection);
        oHtmlFunctions.addElementToContainer(oChangedLinksTable, oHideChangedLinksContainer);

        oHtmlFunctions.addElementToContainer(oShowChangedLinksContainer, oModifiedLinkSection);
        oHtmlFunctions.addElementToContainer(oHideChangedLinksContainer, oModifiedLinkSection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowChangedLinksContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowChangedLinksContainer, "display", "block");
        });

        return oModifiedLinkSection;
    }

    function createCreatedLinkSection(oViewConfiguration) {
        var oCreatedElementSection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oCreatedElements = oViewConfiguration.getCreatedLinks();
        var iCreatedElementCount = Object.keys(oCreatedElements).length;

        var sCreatedElementsTitle = `Created Links(${iCreatedElementCount})`;
        var oShowCreatedElementsContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showCreatedElementsTitle">${sCreatedElementsTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="createElement-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowCreatedElementsContainer);

        var oHideChangedLinksContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideCreatedElementsTitle">${sCreatedElementsTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="createElement-hideSectionButton" style="margin-left: 5px; cursor: pointer" >« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideChangedLinksContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var ocreateElementButtonSection = oHtmlFunctions.createElementFromHTML(`
            <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                <div>ID:<label style="color: red">*</label></div>
                <input id="createElement-elementIdInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. my-button">

                <div style="${sLabelStyles}">Text:<label style="color: red">*</label></div>
                <input id="createElement-linkTextInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. Create Set">

                <div style="${sLabelStyles}">Destination:<label style="color: red">*</label></div>
                <input id="createElement-destination" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. /post_sets/new">

                <div id="openInNewTabSection" style="margin-top: 10px; display: block">
                    <div>Open in new tab:</div>
                    <input id="createElement-openInNewTabCheckbox" type="checkbox">
                </div>

                <div style="${sLabelStyles}">Type:</div>

                <div id="createElement-colorSelectionSection" style="display: none">
                    <div style="${sLabelStyles}">Background Color:</div>
                    <input id="createElement-colorPicker" type="color" value="#1f3c67" style="margin-top: 5px; bcakground-color: #284a81; width: 135px; display: block">
                </div>
            <div>
        `);

        var oTargetInput = oHtmlFunctions.crateHtmlElementSelectionInput("e.g. image-extra-controls", "Target Container ID / XPath:", true);
        oHtmlFunctions.addElementToContainer(oTargetInput.container, ocreateElementButtonSection, 4);
        oHtmlFunctions.addElementStyles(oTargetInput.container, { "margin-top": "10px" });

        var oElementTypeSelection = oHtmlFunctions.createElementFromHTML(`
        <select id="createElement-typeSelection" style="margin-top: 5px;">
            <option value="${oViewConfiguration.LINK_ELEMENT}">Link</option>
            <option value="${oViewConfiguration.BUTTON_ELEMENT}">Button</option>
        </select><br><br>`
        );
        oHtmlFunctions.addElementToContainer(oElementTypeSelection, ocreateElementButtonSection, 17);

        var fTypeSelectionHandler = function () {
            if (oHtmlFunctions.getElement("createElement-typeSelection").value === oViewConfiguration.BUTTON_ELEMENT) {
                oHtmlFunctions.addElementStyles("createElement-colorSelectionSection", { display: "block" });
            } else {
                oHtmlFunctions.hideElement("createElement-colorSelectionSection");
            }
        };
        oElementTypeSelection.addEventListener("change", fTypeSelectionHandler);

        var fCreateLink = function (oEvent) {
            var bUpdate = oEvent.srcElement.dataset.update === "true";

            var oElementIdInput = oHtmlFunctions.getElement("createElement-elementIdInput");
            var oDestinationInput = oHtmlFunctions.getElement("createElement-destination");
            var oColorPicker = oHtmlFunctions.getElement("createElement-colorPicker");
            var oTypeSelector = oElementTypeSelection;
            var oOpenNewTabCheckbox = oHtmlFunctions.getElement("createElement-openInNewTabCheckbox");
            var oTextInput = oHtmlFunctions.getElement("createElement-linkTextInput");

            var fIdInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    oHtmlFunctions.setInputErrorState(oSrcElement, true, "The ID can't contain spaces")
                } else {
                    oHtmlFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            var fDestinationInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    oHtmlFunctions.setInputErrorState(oSrcElement, true, "The destination can't contain spaces")
                } else {
                    oHtmlFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            oElementIdInput.addEventListener("input", fIdInputHandler);
            oTargetInput.input.addEventListener("input", fIdInputHandler);
            oDestinationInput.addEventListener("input", fDestinationInputHandler);

            var sElementId = oElementIdInput.value;
            var sBackgroundColor = oColorPicker.value;
            var sDestination = oDestinationInput.value;
            var sTargetId = oTargetInput.input.value;
            var sElemntType = oTypeSelector.value;
            var bOpenNewTab = oOpenNewTabCheckbox.checked;
            var sLinkText = oTextInput.value;

            if (sElementId && sTargetId && sDestination) {
                if (!sDestination.startsWith("/")) {
                    oHtmlFunctions.setInputErrorState("createElement-destination", true, "The destination has to start with '/'");
                    return;
                }

                var oCreatedElement = oViewConfiguration.createLink(sTargetId, sElementId, sLinkText, sDestination, sElemntType, sElemntType === oViewConfiguration.BUTTON_ELEMENT ? sBackgroundColor : undefined, bOpenNewTab, bUpdate);
                if (bUpdate) oHtmlFunctions.removeTableRow(oCreatedElementsTable, { column: "Element ID", value: sElementId });
                oEvent.srcElement.innerText = "Create Link";
                oEvent.srcElement.dataset.update = false;

                if (!oCreatedElement) {
                    oHtmlFunctions.setInputErrorState("createElement-elementIdInput", true, "Element has already been created");
                    return;
                }

                var sCreatedElementsTitle = `Created Links(${Object.keys(oViewConfiguration.getCreatedLinks()).length})`;
                oHtmlFunctions.getElement("showCreatedElementsTitle").innerText = sCreatedElementsTitle;
                oHtmlFunctions.getElement("hideCreatedElementsTitle").innerText = sCreatedElementsTitle;

                oElementIdInput.value = "";
                oElementIdInput.disabled = false;
                oTargetInput.input.value = "";
                oColorPicker.value = "#1f3c67";
                oDestinationInput.value = "";
                oTextInput.value = "";

                oHtmlFunctions.createTableRows(oCreatedElementsTable, { sElementId: fCreateElementCrationTableRow(sElementId, sTargetId, sDestination, sElemntType) });

            } else {
                if (!sLinkText) oHtmlFunctions.setInputErrorState("createElement-linkTextInput", true, "Text can't be empty")
                if (!sDestination) oHtmlFunctions.setInputErrorState("createElement-destination", true, "Destination can't be empty");
                if (!sTargetId) oHtmlFunctions.setInputErrorState(oTargetInput.input.input, true, "Target element ID can't be empty");
                if (!sElementId) oHtmlFunctions.setInputErrorState("createElement-elementIdInput", true, "Element ID can't be empty");
            }
        };

        var oCreateElementButton = oHtmlFunctions.createButton(undefined, "Create Link", fCreateLink);
        oHtmlFunctions.addElementStyles(oCreateElementButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        oHtmlFunctions.addElementStyles(ocreateElementButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oCreateElementButton, ocreateElementButtonSection);
        oHtmlFunctions.addElementToContainer(ocreateElementButtonSection, oHideChangedLinksContainer);

        var fEditCreatedLink = function (sElementId) {
            var oCreatedLink = oViewConfiguration.getCreatedLinks()[sElementId];

            var oElementIdInput = oHtmlFunctions.getElement("createElement-elementIdInput");
            var oDestinationInput = oHtmlFunctions.getElement("createElement-destination");
            var oColorPicker = oHtmlFunctions.getElement("createElement-colorPicker");
            var oTypeSelector = oElementTypeSelection;
            var oOpenNewTabCheckbox = oHtmlFunctions.getElement("createElement-openInNewTabCheckbox");
            var oTextInput = oHtmlFunctions.getElement("createElement-linkTextInput");

            oElementIdInput.value = oCreatedLink.id
            oElementIdInput.disabled = true;

            oTargetInput.input.value = oCreatedLink.targetContainer;

            oTextInput.value = oCreatedLink.text;

            oTypeSelector.value = oCreatedLink.type;

            if (oCreatedLink.backgroundColor) oColorPicker.value = oCreatedLink.backgroundColor;
            oDestinationInput.value = oCreatedLink.destination;

            oOpenNewTabCheckbox.checked = oCreatedLink.openInNewTab;

            oCreateElementButton.innerText = "Save";
            oCreateElementButton.dataset.update = true;

            fTypeSelectionHandler();
        };

        var fCreateElementCrationTableRow = function (sElementId, sTargetId, sNewDestination, sElementType) {
            return {
                elementId: { index: 0, content: sElementId },
                targetId: { index: 1, content: sTargetId },
                elementType: { index: 2, content: sElementType },
                newDestination: { index: 3, content: sNewDestination },
                removeButton: {
                    index: 4,
                    content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.element_id;

                        oViewConfiguration.removeCreatedLink(sId);

                        oHtmlFunctions.removeTableRow(oCreatedElementsTable, { column: "Element ID", value: sId });

                        var sCreatedElementsTitle = `Created Links(${Object.keys(oViewConfiguration.getCreatedLinks()).length})`;
                        oHtmlFunctions.getElement("showCreatedElementsTitle").innerText = sCreatedElementsTitle;
                        oHtmlFunctions.getElement("hideCreatedElementsTitle").innerText = sCreatedElementsTitle;
                    }, { element_id: sElementId })
                },
                editButton: {
                    index: 5,
                    content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditCreatedLink(oEvent.srcElement.dataset.element_id);
                    }, { element_id: sElementId })
                }
            };
        };

        var oCreatedElementsTable = oHtmlFunctions.createTable(undefined, ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oCreatedElementsTable, ["Element ID", "Target ID", "Destination", "Type", "", ""]);

        var oCreatedElementRows = {};

        for (var sKey in oCreatedElements) {
            var oCreatedElement = oCreatedElements[sKey];
            oCreatedElementRows[sKey] = fCreateElementCrationTableRow(oCreatedElement.id, oCreatedElement.targetContainer, oCreatedElement.type, oCreatedElement.destination);
        }

        oHtmlFunctions.createTableRows(oCreatedElementsTable, oCreatedElementRows);
        oHtmlFunctions.addElementToContainer(oCreatedElementsTable, oCreatedElementSection);
        oHtmlFunctions.addElementToContainer(oCreatedElementsTable, oHideChangedLinksContainer);

        oHtmlFunctions.addElementToContainer(oShowCreatedElementsContainer, oCreatedElementSection);
        oHtmlFunctions.addElementToContainer(oHideChangedLinksContainer, oCreatedElementSection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowCreatedElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowCreatedElementsContainer, "display", "block");
        });

        return oCreatedElementSection;
    }

    function createCustomAddToSetGroupSection(oViewConfiguration) {
        var oCustomAddToSetGroupSection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oCustomGroups = oViewConfiguration.getSetSelectionGroups();
        var iCustomGroupCount = Object.keys(oCustomGroups).length;

        var sCustomGroupsTitle = `Custom Set Selection Groups(${iCustomGroupCount})`;
        var oShowCustomGroupContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showSetSelectionGroupsTitle">${sCustomGroupsTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="customSetGroups-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowCustomGroupContainer);

        var oHideCustomGroupContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideSetSelectionGroupsTitle">${sCustomGroupsTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="customSetGroups-hideSectionButton" style="margin-left: 5px; cursor: pointer" >« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideCustomGroupContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oCustomGroupInputSection = oHtmlFunctions.createElementFromHTML(`
            <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                <div>Group Title:<label style="color: red">*</label></div>
                <input id="customSetGroups-titleInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. Avians">

                <div style="${sLabelStyles}">Included Set Selector:</div>
                <input id="customSetGroups-setSelectorInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. *Avian*">

                <div style="${sLabelStyles}">Specific included Sets:</div>
                <input id="customSetGroups-setsInput" type="text" style="width: 600px; margin-top: 5px; display: block" placeholder="e.g. Equine, Birb, Panther, ...">

                <div style="${sLabelStyles}">Position:</div>
                <input id="customSetGroups-groupPositionInput" type="number" value="" min="0" style="width: 50px; margin-top: 5px; display: block" >
            <div>
        `);

        var fEditCustomSetGroups = function (oGroupId) {
            var oSelectedGroup = oViewConfiguration.getSetSelectionGroups()[oGroupId];

            var oTitleInput = oHtmlFunctions.getElement("customSetGroups-titleInput");
            oTitleInput.value = oSelectedGroup.title;
            oTitleInput.disabled = true;

            oHtmlFunctions.getElement("customSetGroups-setSelectorInput").value = oSelectedGroup.setSelector;
            oHtmlFunctions.getElement("customSetGroups-setsInput").value = oSelectedGroup.sets.join(", ");
            oHtmlFunctions.getElement("customSetGroups-groupPositionInput").value = oSelectedGroup.position;

            var oCreateButton = oHtmlFunctions.getElement("customSetGroups-createButton");
            oCreateButton.innerText = "Save";
            oCreateButton.dataset.update_group = true;
        };

        var fCreateGroupTableRow = function (sTitle, sSetSelector, sSets, iPosition) {
            return {
                groupTitle: { index: 0, content: sTitle },
                setSelector: { index: 1, content: sSetSelector },
                includedSets: { index: 2, content: sSets },
                newDestination: { index: 3, content: iPosition },
                removeButton: {
                    index: 4,
                    content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.group_id;

                        oViewConfiguration.removeSetSelectionGroup(sId);

                        oHtmlFunctions.removeTableRow(oCustomGroupsTable, { column: "Title", value: sId });

                        var sCustomGroupsTitle = `Custom Set Selection Groups(${Object.keys(oViewConfiguration.getSetSelectionGroups()).length})`;
                        oHtmlFunctions.getElement("showSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;
                        oHtmlFunctions.getElement("hideSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;
                    }, { group_id: sTitle.replace(/ /g, "") })
                },
                editButton: {
                    index: 5,
                    content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.group_id;
                        fEditCustomSetGroups(sId);
                    }, { group_id: sTitle.replace(/ /g, "") })
                }
            };
        };

        var fCreateCustomSetGroup = function (oEvent) {
            var oTitleInput = oHtmlFunctions.getElement("customSetGroups-titleInput");
            var oSetSelectorInput = oHtmlFunctions.getElement("customSetGroups-setSelectorInput");
            var oSetsInput = oHtmlFunctions.getElement("customSetGroups-setsInput");
            var oGroupPositionInput = oHtmlFunctions.getElement("customSetGroups-groupPositionInput");

            var fIdInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                oHtmlFunctions.setInputErrorState(oSrcElement, false);
            };

            oTitleInput.addEventListener("input", fIdInputHandler);
            oSetSelectorInput.addEventListener("input", fIdInputHandler);
            oSetsInput.addEventListener("input", fIdInputHandler);

            var sTitle = oTitleInput.value;
            var sSetSelector = oSetSelectorInput.value;
            var sSets = oSetsInput.value;
            var aSets = sSets ? sSets.split(",") : [];
            var iGroupPosition = oGroupPositionInput.value;

            if (aSets.length > 0) aSets = aSets.map(sSetName => {
                return sSetName.trim();
            });

            if (sTitle && (sSetSelector || aSets.length > 0)) {
                var bUpdateGroup = oEvent.srcElement.dataset.update_group === "true";

                if (!bUpdateGroup && iGroupPosition && oViewConfiguration.getSetSelectionGroupAtPosition(iGroupPosition)) {
                    oHtmlFunctions.setInputErrorState(oGroupPositionInput, true, "A group at this position already exists");
                    return;
                }

                var oCreatedGroup = oViewConfiguration.createSetSelectionGroup(sTitle, sSetSelector, aSets, iGroupPosition, bUpdateGroup);
                if (bUpdateGroup) oHtmlFunctions.removeTableRow(oCustomGroupsTable, { column: "Title", value: oCreatedGroup.id });
                oEvent.srcElement.dataset.update_group = false;
                oEvent.srcElement.innerText = "Create Group";

                if (!oCreatedGroup) {
                    oHtmlFunctions.setInputErrorState(oTitleInput, true, "Group has already been created");
                    return;
                }

                var sCustomGroupsTitle = `Custom Set Selection Groups(${Object.keys(oViewConfiguration.getSetSelectionGroups()).length})`;
                oHtmlFunctions.getElement("showSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;
                oHtmlFunctions.getElement("hideSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;

                oTitleInput.value = "";
                oTitleInput.disabled = false;
                oSetSelectorInput.value = "";
                oSetsInput.value = "";
                oGroupPositionInput.value = "";

                oHtmlFunctions.setInputErrorState(oTitleInput, false);
                oHtmlFunctions.setInputErrorState(oSetSelectorInput, false);
                oHtmlFunctions.setInputErrorState(oSetsInput, false);

                var oNewRow = {};
                oNewRow[sTitle.replace(/ /g, "")] = fCreateGroupTableRow(sTitle, sSetSelector, aSets.join(", "), iGroupPosition);

                oHtmlFunctions.createTableRows(oCustomGroupsTable, oNewRow);

            } else {
                if (!sSetSelector && aSets.length === 0) {
                    if (!sSetSelector) oHtmlFunctions.setInputErrorState(oSetSelectorInput, true, "At least one selection method has to be filed");
                    if (aSets.length === 0) oHtmlFunctions.setInputErrorState(oSetsInput, true, "At least one selection method has to be filed");
                }

                if (!sTitle) oHtmlFunctions.setInputErrorState(oTitleInput, true, "The title can't be empty");
            }
        };

        var oCreateGroupButton = oHtmlFunctions.createButton("customSetGroups-createButton", "Create Group", fCreateCustomSetGroup);
        oHtmlFunctions.addElementStyles(oCreateGroupButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        oHtmlFunctions.addElementStyles(oCustomGroupInputSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oCreateGroupButton, oCustomGroupInputSection);
        oHtmlFunctions.addElementToContainer(oCustomGroupInputSection, oHideCustomGroupContainer);

        var oCustomGroupsTable = oHtmlFunctions.createTable(undefined, ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oCustomGroupsTable, ["Title", "Set Selector", "Sets", "Position", "", ""]);

        var oCreatedGroupRows = {};

        for (var sKey in oCustomGroups) {
            var oCreatedGroup = oCustomGroups[sKey];
            oCreatedGroupRows[sKey] = fCreateGroupTableRow(oCreatedGroup.title, oCreatedGroup.setSelector, oCreatedGroup.sets.join(", "), oCreatedGroup.position);
        }

        oHtmlFunctions.createTableRows(oCustomGroupsTable, oCreatedGroupRows);
        oHtmlFunctions.addElementToContainer(oCustomGroupsTable, oCustomAddToSetGroupSection);
        oHtmlFunctions.addElementToContainer(oCustomGroupsTable, oHideCustomGroupContainer);

        oHtmlFunctions.addElementToContainer(oShowCustomGroupContainer, oCustomAddToSetGroupSection);
        oHtmlFunctions.addElementToContainer(oHideCustomGroupContainer, oCustomAddToSetGroupSection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideCustomGroupContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowCustomGroupContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideCustomGroupContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowCustomGroupContainer, "display", "block");
        });

        return oCustomAddToSetGroupSection;
    }

    function createBasicViewConfigView(bCreationMode, oProfile, oViewConfiguration, aCustoMSections) {
        var oProfileConfigDialogContent = oHtmlFunctions.getElement("viewConfig-content");
        if (oProfileConfigDialogContent) {
            oProfileConfigDialogContent.innerHTML = "";
        }

        var oViewConfigContainer = oHtmlFunctions.createContainerWithTitle("viewConfiguration-container", "Configure View", "h2", { "margin-top": "10px", "width": "900px" });
        var oFooter = oHtmlFunctions.createElementFromHTML(`<div></div>`);
        var oBackButton = oHtmlFunctions.createButton("viewConfiguration-backButton", "Back", function () {
            var oPathInput = oHtmlFunctions.getElement("pathInput");
            var sPath = oPathInput.value;

            var oParameterInput = oHtmlFunctions.getElement("searchParamInput");
            var sParameters = oParameterInput.value;

            oViewConfiguration.setParameters(sParameters);
            if (sPath) {
                if (sPath.startsWith("/")) {
                    oViewConfiguration.setPath(sPath);
                } else {
                    oHtmlFunctions.setInputErrorState(oPathInput, true, "The path has to begin with '/'");
                    return;
                }
            } else {
                oHtmlFunctions.setInputErrorState(oPathInput, true, "The path can't be empty");
                return;
            }

            displayProfile(bCreationMode, oProfile)
        });

        oHtmlFunctions.addElementToContainer(createBasicViewConfigSection(oViewConfiguration), oViewConfigContainer);
        oHtmlFunctions.addElementToContainer(createHiddenElementSection(oViewConfiguration), oViewConfigContainer);
        oHtmlFunctions.addElementToContainer(createModifiedElementSection(oViewConfiguration), oViewConfigContainer);
        oHtmlFunctions.addElementToContainer(createMovedElementSection(oViewConfiguration), oViewConfigContainer);
        oHtmlFunctions.addElementToContainer(createModifyLinkDestination(oViewConfiguration), oViewConfigContainer);
        oHtmlFunctions.addElementToContainer(createCreatedLinkSection(oViewConfiguration), oViewConfigContainer);

        if (aCustoMSections) aCustoMSections.forEach(oCustomSection => {
            oHtmlFunctions.addElementToContainer(oCustomSection, oViewConfigContainer);
        });

        oHtmlFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
        oHtmlFunctions.addElementStyles(oBackButton, { float: "left" });
        oHtmlFunctions.addElementToContainer(oBackButton, oFooter);
        oHtmlFunctions.addElementToContainer(oFooter, oViewConfigContainer);

        oHtmlFunctions.addElementToContainer(oViewConfigContainer, oProfileConfigDialogContent);
        oHtmlFunctions.recenterElement(document.getElementById("viewConfig-dialog"));
        return oViewConfigContainer;
    }

    function createCustomSetTableSection(oViewConfiguration) {
        var oCustomSetTableSection = oHtmlFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oCustomTables = oViewConfiguration.getCustomSetTables();
        var iCustomGroupCount = Object.keys(oCustomTables).length;

        var sCustomSetTablesTitle = `Custom Set Tables(${iCustomGroupCount})`;
        var oShowCustomSetTablesContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showCustomSetTableTitle">${sCustomSetTablesTitle}</label></div>`);
        var oShowButton = oHtmlFunctions.createElementFromHTML(`<a id="customSetTables-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        oHtmlFunctions.addElementToContainer(oShowButton, oShowCustomSetTablesContainer);

        var oHideCustomSetTablesContainer = oHtmlFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideCustomSetTableTitle">${sCustomSetTablesTitle}</label></div>`);
        var oHideButton = oHtmlFunctions.createElementFromHTML(`<a id="customSetTables-hideSectionButton" style="margin-left: 5px; cursor: pointer" >« hide</a>`);
        oHtmlFunctions.addElementToContainer(oHideButton, oHideCustomSetTablesContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oCustomTableInputSection = oHtmlFunctions.createElementFromHTML(`
            <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                <div>Table Title:<label style="color: red">*</label></div>
                <input id="customSetTables-titleInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. Avians">

                <div style="${sLabelStyles}">Included Set Selector:</div>
                <input id="customSetTables-setSelectorInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. *Avian*">

                <div style="${sLabelStyles}">Specific included Sets:</div>
                <input id="customSetTables-setsInput" type="text" style="width: 600px; margin-top: 5px; display: block" placeholder="e.g. Equine, Birb, Panther, ...">
            <div>
        `);

        var fCreateCustomTable = function (oEvent) {
            var bUpdate = oEvent.srcElement.dataset.update === "true";

            var oTitleInput = oHtmlFunctions.getElement("customSetTables-titleInput");
            var oSetSelectorInput = oHtmlFunctions.getElement("customSetTables-setSelectorInput");
            var oSetsInput = oHtmlFunctions.getElement("customSetTables-setsInput");

            var fIdInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                oHtmlFunctions.setInputErrorState(oSrcElement, false);
            };

            oTitleInput.addEventListener("input", fIdInputHandler);
            oSetSelectorInput.addEventListener("input", fIdInputHandler);
            oSetsInput.addEventListener("input", fIdInputHandler);

            var sTitle = oTitleInput.value;
            var sSetSelector = oSetSelectorInput.value;
            var sSets = oSetsInput.value;
            var aSets = sSets ? sSets.split(",") : [];

            if (aSets.length > 0) aSets = aSets.map(sSetName => {
                return sSetName.trim();
            });

            if (sTitle && (sSetSelector || aSets.length > 0)) {
                var oCreatedTable = oViewConfiguration.createCustomSetTable(sTitle.toLowerCase().replace(/ /g, ""), sTitle, sSetSelector, aSets, undefined, bUpdate);
                if (bUpdate) oHtmlFunctions.removeTableRow(oCustomTablesTable, { column: "Title", value: sTitle });
                oEvent.srcElement.innerText = "Create Group";
                oEvent.srcElement.dataset.update = false;

                if (!oCreatedTable) {
                    oHtmlFunctions.setInputErrorState(oTitleInput, true, "Table has already been created");
                    return;
                }

                var sCustomSetTablesTitle = `Custom Set Tables(${Object.keys(oViewConfiguration.getCustomSetTables()).length})`;
                oHtmlFunctions.getElement("showCustomSetTableTitle").innerText = sCustomSetTablesTitle;
                oHtmlFunctions.getElement("hideCustomSetTableTitle").innerText = sCustomSetTablesTitle;

                oTitleInput.value = "";
                oSetSelectorInput.value = "";
                oSetsInput.value = "";
                oTitleInput.disabled = false;

                oHtmlFunctions.setInputErrorState(oTitleInput, false);
                oHtmlFunctions.setInputErrorState(oSetSelectorInput, false);
                oHtmlFunctions.setInputErrorState(oSetsInput, false);

                var oNewRow = {};
                oNewRow[sTitle.replace(/ /g, "")] = fCreateCustomTableRow(sTitle, sSetSelector, aSets.join(", "), undefined);

                oHtmlFunctions.createTableRows(oCustomTablesTable, oNewRow);

            } else {
                if (!sSetSelector && aSets.length === 0) {
                    if (!sSetSelector) oHtmlFunctions.setInputErrorState(oSetSelectorInput, true, "At least one selection method has to be filed");
                    if (aSets.length === 0) oHtmlFunctions.setInputErrorState(oSetsInput, true, "At least one selection method has to be filed");
                }

                if (!sTitle) oHtmlFunctions.setInputErrorState(oTitleInput, true, "The title can't be empty");
            }
        };

        var oCreateGroupButton = oHtmlFunctions.createButton(undefined, "Create Group", fCreateCustomTable);
        oHtmlFunctions.addElementStyles(oCreateGroupButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        oHtmlFunctions.addElementStyles(oCustomTableInputSection, { "margin-top": "10px", "margin-bottom": "10px" });
        oHtmlFunctions.addElementToContainer(oCreateGroupButton, oCustomTableInputSection);
        oHtmlFunctions.addElementToContainer(oCustomTableInputSection, oHideCustomSetTablesContainer);

        var fEditCustomSetTables = function (sTableId) {
            var oCustomTabel = oViewConfiguration.getCustomSetTables()[sTableId.toLowerCase().replace(/ /g, "")];

            var oTitleInput = oHtmlFunctions.getElement("customSetTables-titleInput");
            oTitleInput.value = oCustomTabel.title;
            oTitleInput.disabled = true;

            oHtmlFunctions.getElement("customSetTables-setSelectorInput").value = oCustomTabel.setSelector;
            oHtmlFunctions.getElement("customSetTables-setsInput").value = oCustomTabel.setNames.join(", ");

            oCreateGroupButton.innerText = "Save";
            oCreateGroupButton.dataset.update_group = true;
            oCreateGroupButton.dataset.update = true;
        };

        var fCreateCustomTableRow = function (sTitle, sSetSelector, sSets, iPosition) {
            return {
                tableTitle: { index: 0, content: sTitle },
                setSelector: { index: 1, content: sSetSelector },
                includedSets: { index: 2, content: sSets },
                removeButton: {
                    index: 3,
                    content: oHtmlFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sTitle = oEvent.srcElement.dataset.group_title;

                        oViewConfiguration.remvoeCustomSetTable(sTitle.toLowerCase().replace(/ /g, ""));
                        oHtmlFunctions.removeTableRow(oCustomTablesTable, { column: "Title", value: sTitle });

                        var sCustomSetTablesTitle = `Custom Set Tables(${Object.keys(oViewConfiguration.getCustomSetTables()).length})`;
                        oHtmlFunctions.getElement("showCustomSetTableTitle").innerText = sCustomSetTablesTitle;
                        oHtmlFunctions.getElement("hideCustomSetTableTitle").innerText = sCustomSetTablesTitle;
                    }, { group_title: sTitle })
                },
                editButton: {
                    index: 4,
                    content: oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditCustomSetTables(oEvent.srcElement.dataset.table_id);
                    }, { table_id: sTitle })
                }
            };
        };

        var oCustomTablesTable = oHtmlFunctions.createTable(undefined, ["table", "striped"]);
        oHtmlFunctions.createTableColumns(oCustomTablesTable, ["Title", "Set Selector", "Sets", "", ""]);

        var oCreatedTableRows = {};

        for (var sKey in oCustomTables) {
            var oCreatedTable = oCustomTables[sKey];
            oCreatedTableRows[sKey] = fCreateCustomTableRow(oCreatedTable.title, oCreatedTable.setSelector, oCreatedTable.setNames.join(", "), oCreatedTable.position);
        }

        oHtmlFunctions.createTableRows(oCustomTablesTable, oCreatedTableRows);
        oHtmlFunctions.addElementToContainer(oCustomTablesTable, oCustomSetTableSection);
        oHtmlFunctions.addElementToContainer(oCustomTablesTable, oHideCustomSetTablesContainer);

        oHtmlFunctions.addElementToContainer(oShowCustomSetTablesContainer, oCustomSetTableSection);
        oHtmlFunctions.addElementToContainer(oHideCustomSetTablesContainer, oCustomSetTableSection);

        oShowButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideCustomSetTablesContainer, "display", "block");
            oHtmlFunctions.addStyleToElement(oShowCustomSetTablesContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            oHtmlFunctions.addStyleToElement(oHideCustomSetTablesContainer, "display", "none");
            oHtmlFunctions.addStyleToElement(oShowCustomSetTablesContainer, "display", "block");
        });

        return oCustomSetTableSection;
    }

    function displayProfile(bCreationMode, oProfile) {
        var oProfileCreationView = oHtmlFunctions.getElement("profileConfig-container");
        if (oProfileCreationView) {
            oProfileCreationView.parentElement.innerHTML = "";
        }

        if (bCreationMode) {
            oProfileCreationView = createProfileConfigurationView(true);
        } else {
            oProfileCreationView = createProfileConfigurationView(false, oProfile);
        }

        displayConfigDialogSection("profileConfig-container");
        oHtmlFunctions.recenterElement(document.getElementById("viewConfig-dialog"));
    }

    function createPostViewConfigView(bCreationMode, oProfile, oViewConfig) {
        var oPostViewSettingsContainer = oHtmlFunctions.createElementFromHTML(`<div><h4 style="margin: 15px 10px 5px">Post View Specific Settings</h4></div>`);
        oHtmlFunctions.addElementToContainer(createCustomAddToSetGroupSection(oViewConfig), oPostViewSettingsContainer);
        createBasicViewConfigView(bCreationMode, oProfile, oViewConfig, [oPostViewSettingsContainer]);
    }

    function createSetVewConfigView(bCreationMode, oProfile, oViewConfig) {
        var oSetsViewSettingsContainer = oHtmlFunctions.createElementFromHTML(`<div><h4 style="margin: 15px 10px 5px">Set View Specific Settings</h4></div>`);
        oHtmlFunctions.addElementToContainer(createCustomSetTableSection(oViewConfig), oSetsViewSettingsContainer);
        createBasicViewConfigView(bCreationMode, oProfile, oViewConfig, [oSetsViewSettingsContainer]);
    }

    function displayPostViewConfiguration(bCreationMode, oProfile, oViewConfig) {
        createPostViewConfigView(bCreationMode, oProfile, oViewConfig);
        displayConfigDialogSection("viewConfiguration-container");
    }

    function displaySetViewConfiguration(bCreationMode, oProfile, oViewConfig) {
        createSetVewConfigView(bCreationMode, oProfile, oViewConfig);
        displayConfigDialogSection("viewConfiguration-container");
    }

    function displayBasicViewConfiguration(bCreationMode, oProfile, oViewConfig) {
        createBasicViewConfigView(bCreationMode, oProfile, oViewConfig);
        displayConfigDialogSection("viewConfiguration-container");
    }

    function onCreateViewConfig(bCreationMode, oProfile, sPath) {
        var sId = oProfile.createPathId(sPath);
        var oViewConfig = oProfile.createViewConfiguration(sId, sPath);

        switch (oViewConfig.getViewId()) {
            case postViewId:
                displayPostViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            case setViewId:
                displaySetViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            default:
                displayBasicViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
        }
    }

    function createProfileConfigurationView(bCreationMode, oProfile) {
        if (bCreationMode) {
            var oProfileDraft = getProfileDraft();
            if (oProfileDraft) {
                oProfile = oProfileDraft;
            } else {
                oProfile = new Profile();
                saveProfileDraft(oProfile);
            }
        }

        var oProfileCreationContainer = oHtmlFunctions.createContainerWithTitle("profileConfig-container", bCreationMode ? "Create New Profile" : "Edit Profile '" + oProfile.name + "'", "h2", { "margin-top": "10px" });
        var oProfileSelectionContainer = oHtmlFunctions.getElement("viewConfig-content");

        oHtmlFunctions.addElementToContainer(oProfileCreationContainer, oProfileSelectionContainer);

        oHtmlFunctions.addElementToContainer(createBasicInfoForm(bCreationMode, oProfile), oProfileCreationContainer);
        oHtmlFunctions.addElementToContainer(createViewConfigurationTable(bCreationMode, oProfile), oProfileCreationContainer);

        var oFooter = oHtmlFunctions.createElementFromHTML(`<div></div>`);
        oHtmlFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
        var oBackButton = oHtmlFunctions.createButton(undefined, "Cancel", displayProfileSelection);

        var sCreateButtonText = bCreationMode ? oProfile.isActive() ? "Create (Reload)" : "Create Profile" : oProfile.isActive() ? "Save (Reload)" : "Save";
        var oCreateProfileButton = oHtmlFunctions.createButton(undefined, sCreateButtonText, function () { onSaveProfile(bCreationMode, oProfile) });

        oHtmlFunctions.addElementStyles(oBackButton, { float: "left" });
        oHtmlFunctions.addElementStyles(oCreateProfileButton, { float: "right" });
        oHtmlFunctions.addElementToContainer(oBackButton, oFooter);
        oHtmlFunctions.addElementToContainer(oCreateProfileButton, oFooter);
        oHtmlFunctions.addElementToContainer(oFooter, oProfileCreationContainer);

        return oProfileCreationContainer;
    }

    function onSaveProfile(bCreationMode, oProfile) {
        var sId;
        var oNameInput = oHtmlFunctions.getElement("profileNameInput");
        var oDescriptionInput = oHtmlFunctions.getElement("profileDescriptionInput");

        if (bCreationMode) {
            var oIdInput = oHtmlFunctions.getElement("profileIdInput");
            sId = oIdInput.value;
        } else {
            sId = oProfile.getId();
        }

        var sName = oNameInput.value;
        var sDescription = oDescriptionInput.value;

        if (sId && sName) {

            oProfile.setId(sId);
            oProfile.setName(sName);
            oProfile.setDescription(sDescription);

            ProfileStorage.saveProfile(oProfile, oProfile.getActive());

            clearProfileDraft();
            displayProfileSelection();

            if (oProfile.isActive()) {
                console.log("Reloading page to use profile: " + sId);
                location.reload();
            }

        } else {
            if (!sName) oHtmlFunctions.setInputErrorState("profileNameInput", true, "Name can't be empty");
            if (!sId) oHtmlFunctions.setInputErrorState("profileIdInput", true, "ID can't be empty");
        }
    }

    function createProfileSelection() {
        var oTableContainer = oHtmlFunctions.createContainerWithTitle("profileTable-container", "Created Profiles");
        var oprofileTable = oHtmlFunctions.createTable("profileTable", ["table", "striped"]);

        oHtmlFunctions.addElementToContainer(oprofileTable, oTableContainer);
        oHtmlFunctions.createTableColumns(oprofileTable, ["Name", "Description", "Paths", "Active", "", ""]);

        var oTableRows = {};
        var oCreatedProfiles = ProfileStorage.loadCreatedProfiles();

        var oCellStyles = {
            "padding-left": "20px"
        }

        for (var sConfig in oCreatedProfiles) {
            var oProfile = oCreatedProfiles[sConfig];
            var aSortedPaths = [];

            for (var sViewConfig in oProfile.viewConfigurations) {
                aSortedPaths.push(oProfile.viewConfigurations[sViewConfig].getPath());
            };

            aSortedPaths = aSortedPaths.sort((a, b) => {
                return a.length - b.length;
            });

            oTableRows[oProfile.getId()] = {
                name: {
                    index: 0,
                    content: oProfile.getName()
                },
                description: {
                    index: 1,
                    content: oProfile.getDescription(),
                    styles: oCellStyles
                },
                paths: {
                    index: 2,
                    content: aSortedPaths.join(", "),
                    styles: oCellStyles
                },
                isActive: {
                    index: 3,
                    content: oProfile.getIsActive(),
                    styles: oCellStyles
                },
                editButton: {
                    index: 4,
                    content: oProfile.isEditable() ? oHtmlFunctions.createButton(undefined, "Edit", function (oEvent) {
                        onEditProfile(oEvent.srcElement.dataset.profile_id)
                    }, { profile_id: oProfile.getId() }) : ""
                },
                useButton: {
                    index: 5,
                    content: !oProfile.isActive() ? oHtmlFunctions.createButton(undefined, "Use", function (oEvent) {
                        onUseProfile(oEvent.srcElement.dataset.profile_id)
                    }, { profile_id: oProfile.getId() }) : ""
                }
            }
        };

        oHtmlFunctions.createTableRows(oprofileTable, oTableRows);
        var oProfileSelectionContainer = oHtmlFunctions.getElement("viewConfig-content");
        oHtmlFunctions.addElementToContainer(oTableContainer, oProfileSelectionContainer);

        var oFooter = oHtmlFunctions.createElementFromHTML(`<div></div>`);
        var ocreateProfileButton = oHtmlFunctions.createButton(undefined, "Create Profile", function () { displayProfile(true) });
        oHtmlFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });

        var oImportProfileButton = oHtmlFunctions.createButton(undefined, "Import Profile", onImportProfile);
        oHtmlFunctions.addElementStyles(oImportProfileButton, { float: "right" });

        oHtmlFunctions.addElementToContainer(oImportProfileButton, oFooter);
        oHtmlFunctions.addElementToContainer(ocreateProfileButton, oFooter);
        oHtmlFunctions.addElementToContainer(oFooter, oTableContainer);
    }

    function onImportProfile() {
        var oImportDialog = oHtmlFunctions.createDialog("importDialog", "Import Profile", true);
        var oCancelExportButton = oHtmlFunctions.createButton(undefined, "Cancel", function () { oHtmlFunctions.hideElement(oImportDialog.dialog) });
        var oFileUploader = oHtmlFunctions.createElementFromHTML("<input type='file' accept='.json' style='margin-top: 15px; display: block'/>");
        var oProgressBar = oHtmlFunctions.createElementFromHTML(`<progress max="100" value="0" style="width: 100%; margin-top: 15px">0%</progress>`);


        oFileUploader.addEventListener("change", function (oEvent) {
            var oUploadedProfile = oEvent.srcElement.files[0];
            loadFile(oUploadedProfile, oProgressBar).then(sImportedProfile => {
                var oImportButton = oHtmlFunctions.createButton(undefined, "Import", function () { importProfile(sImportedProfile) });

                oHtmlFunctions.addElementStyles(oImportButton, { float: "right" });
                oHtmlFunctions.addElementToContainer(oImportButton, oImportDialog.footer);
            });
        });

        oHtmlFunctions.addElementToContainer(oFileUploader, oImportDialog.content);
        oHtmlFunctions.addElementToContainer(oProgressBar, oImportDialog.content);
        oHtmlFunctions.addElementToContainer(oCancelExportButton, oImportDialog.footer);
    }

    function importProfile(sProfileJson) {
        var oProfileConfig = JSON.parse(sProfileJson);
        var oImportedProfile = new Profile(oProfileConfig.id).parseProfile(oProfileConfig);
        ProfileStorage.saveProfile(oImportedProfile);
        reloadProfiles();
        displayProfileSelection();
        oHtmlFunctions.hideElement("importDialog");
    }

    function loadFile(oUploadedProfile, oProgressBar) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();

            if (oProgressBar) reader.addEventListener("progress", function (e) {
                if (e.lengthComputable) {
                    var siPercentage = Math.round((e.loaded * 100) / e.total);
                    oProgressBar.value = siPercentage;
                    oProgressBar.innerText = siPercentage + "%";
                }
            }, false);

            reader.onload = function (evt) {
                resolve(evt.target.result);
            };
            reader.readAsBinaryString(oUploadedProfile);
        });
    }

    function onEditProfile(sProfileId) {
        displayProfile(false, ProfileStorage.loadProfile(sProfileId));
    }

    function onUseProfile(sProfileId) {
        ProfileStorage.setProfileActive(ProfileStorage.loadProfile(sProfileId), true);
        console.log("Reloading page to use profile: " + sProfileId);
        location.reload();
    }

    function displayProfileSelection() {
        reloadProfiles();
        var oConfigPage = oHtmlFunctions.getElement("profileTable-container");

        if (oConfigPage) {
            oHtmlFunctions.addStyleToElement(oConfigPage, "display", "block");
        } else {
            createProfileSelection();
        }
        displayConfigDialogSection("profileTable-container");
        oHtmlFunctions.recenterElement(document.getElementById("viewConfig-dialog"));
    }

    function displayConfigDialogSection(sSectionId) {
        oHtmlFunctions.convertHtmlCollectionToArray(oHtmlFunctions.getElement("viewConfig-content").childNodes).forEach(oElement => {
            var sDisplayValue = oElement.id === sSectionId ? "block" : "none";
            oHtmlFunctions.addStyleToElement(oElement, "display", sDisplayValue);
        });
    }

    function createConfigurationForm() {
        var sStyles = `position: absolute; height: auto; width: auto`;
        var sClasses = `ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-draggable ui-resizable`;

        var sCloseButton = `
            <button id="viewConfig-closeButton" type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close">
            <span class="ui-button-icon ui-icon ui-icon-closethick"></span>
            <span class="ui-button-icon-space"></span>Close</button>`;

        var oConfigurationDialog = `
        <div id="viewConfig-dialog" tabindex="-1" role="dialog" class="${sClasses}" style="${sStyles}">
            <div class="ui-dialog-titlebar ui-corner-all ui-widget-header ui-helper-clearfix ui-draggable-handle">
                <span class="ui-dialog-title">
                    Profile Configuration
                </span>
                ${sCloseButton}
            </div>
                <div id="viewConfig-content" class="ui-dialog-content ui-widget-content">
                </div>
            </div>
        </div>`

        var oConfigDialog = oHtmlFunctions.createElementFromHTML(oConfigurationDialog);
        oHtmlFunctions.addElementToContainer(oConfigDialog, document.body);

        oHtmlFunctions.getElement("viewConfig-closeButton").addEventListener("click", closeProfileConfiguration);

        return oConfigDialog;
    }

    function configButtonPressed() {
        var oConfigDialog = document.getElementById("viewConfig-dialog");
        if (oConfigDialog) {
            if (oConfigDialog.style.display === "none") {
                oConfigDialog.style.display = "block";
            }
        } else {
            oConfigDialog = createConfigurationForm();
        }

        displayProfileSelection();
        new HtmlFunctions().recenterElement(oConfigDialog);
    }

    function closeProfileConfiguration() {
        oHtmlFunctions.hideElement("viewConfig-dialog");
    }

    function addButtonToMainToolbar() {
        var oMainToolbar = oHtmlFunctions.convertHtmlCollectionToArray(document.getElementById("nav").childNodes).filter(oElement => { return oElement.tagName === "MENU" })[0];
        var oSettingsButton = oHtmlFunctions.createElementFromHTML(`<li id="viewConfig" style="float: right;"><a id="viewConfigButton" style="cursor: pointer" >Configure View</a></li>`);

        oHtmlFunctions.addElementToContainer(oSettingsButton, oMainToolbar);
        oHtmlFunctions.getElement("viewConfigButton").onclick = configButtonPressed;
    }

    function createDefaultProfiles() {
        console.log("Generating the default profiles ...");

        var oE621Layout = createNewProfile(e621ProfileId, "E621", "Default layout of e621", false, {}, false, false);
        ProfileStorage.saveProfile(oE621Layout, false);

        var oPostViewSettings = new PostViewConfiguration("postsViewConfig", "/posts", true);

        oPostViewSettings.hideElement("post-related-images");
        oPostViewSettings.hideElement("post-information");
        oPostViewSettings.hideElement("image-resize-selector");

        oPostViewSettings.moveElement("set", "image-extra-controls", 4);
        oPostViewSettings.modifyElementStyle("set", undefined, { "background": "#453269", "margin-right": "10px" });
        oPostViewSettings.modifyElementStyle("c-posts", undefined, { "height": "100%" });
        oPostViewSettings.modifyElementClass("set", undefined, ["button"]);

        oPostViewSettings.modifyElementStyle(undefined, "artist-tag-list", { "font-size": "18px", "padding-top": "15px", "padding-bottom": "15px" });

        oPostViewSettings.createLink("add-to-set-dialog", "createNewSet", "Create Set", "/post_sets/new", oPostViewSettings.BUTTON_ELEMENT, undefined, true);
        oPostViewSettings.modifyElementStyle("createNewSet", undefined, { "margin-top": "20px", "width": "100%", "text-align": "center" });
        oPostViewSettings.addElementToSetSelectionDialog("createNewSet");

        oPostViewSettings.modifyElementStyle("add-to-set-id", undefined, { "width": "256px", "font-size": "17px" });
        oPostViewSettings.modifyElementStyle("add-to-set-submit", undefined, { "margin-top": "20px", "width": "100%", "height": "30px" });

        var oPostsViewConfig = oPostViewSettings.getConfiguration();
        var oViewConfigs = {};
        oViewConfigs[oPostsViewConfig.id] = oPostsViewConfig;

        var oDefaultConfig = createNewProfile(S87TweeksId, "S87 Tweeks", "S87's Profile", false, oViewConfigs, false, true);
        ProfileStorage.saveProfile(oDefaultConfig, true);

        return oDefaultConfig;
    }

    function configureView(oProfile) {
        var oProfileConfig = oProfile.generateJsonConfiguration();

        var aSortedConfigsNoParams = [];
        var aSortedConfigsWithParams = [];

        for (var sViewConfig in oProfileConfig.viewConfigurations) {
            var oViewConfig = oProfileConfig.viewConfigurations[sViewConfig];
            if (oViewConfig.searchParameters) {
                aSortedConfigsWithParams.push(oViewConfig);
            } else {
                aSortedConfigsNoParams.push(oViewConfig);
            }
        };

        var fSortByPathLength = function (a, b) {
            return a.path.length - b.path.length;
        };

        aSortedConfigsNoParams = aSortedConfigsNoParams.sort(fSortByPathLength);
        aSortedConfigsWithParams = aSortedConfigsWithParams.sort(fSortByPathLength);

        var fGetViewConfigForPath = function (oViewConfiguration) {
            var sViewConfigPath = oViewConfiguration.path;
            var sConfigUrlParameters = oViewConfiguration.searchParameters;

            var sParametersLogMessage = oViewConfiguration.searchParameters.length > 0 ? ` with parameters: ${sConfigUrlParameters}` : "";
            if (doesCurrentUrlMatch(sViewConfigPath, sConfigUrlParameters)) {
                switch (oViewConfiguration.view) {
                    case postViewId:
                        console.log("Using 'PostsViewParser' to parse view config for path: " + oViewConfiguration.path + sParametersLogMessage);
                        new PostsViewParser().performUiChanges(oViewConfiguration);
                        break;
                    case setViewId:
                        console.log("Using 'SetsViewParser' to parse view for path: " + oViewConfiguration.path + sParametersLogMessage);
                        new SetsViewParser().performUiChanges(oViewConfiguration);
                        break;
                    default:
                        console.log("Using 'DefaultViewParser' to parse view for path: " + oViewConfiguration.path + sParametersLogMessage);
                        new ViewConfigParser().performUiChanges(oViewConfiguration);
                        break;
                };

                return;
            }
        }

        aSortedConfigsNoParams.concat(aSortedConfigsWithParams).forEach(oViewConfig => {
            fGetViewConfigForPath(oViewConfig);
        });
    }

    function initialize() {
        var oActiveProfile;
        var oCreatedConfigs = ProfileStorage.loadCreatedProfiles();

        addButtonToMainToolbar();

        if (oCreatedConfigs && Object.keys(oCreatedConfigs).length > 0) {
            if (Object.keys(oCreatedConfigs).length > 0) {
                for (var sConfigId in oCreatedConfigs) {
                    var oProfile = oCreatedConfigs[sConfigId];
                    if (oProfile.getIsActive()) {
                        oActiveProfile = oProfile;
                        break;
                    }
                }
            }
        } else {
            oActiveProfile = createDefaultProfiles();
        }
        if (oActiveProfile) {
            console.log("Using profile: " + oActiveProfile.getName());
            configureView(oActiveProfile);
        }
    }

    var oHtmlFunctions = new HtmlFunctions();
    initialize();
})();