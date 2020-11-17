class ViewConfiguration {
    constructor(sId, sPath, bIncludeSubPaths, sSearchParameters, viewId, oProfile) {
        this.parentProfile = oProfile;

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
        this.parentProfile.hasUnsavedChanges = true;
        this.hiddenElements.delete(sElementId);
    }

    changeLinkDestination(sElementId, sNewDestination, bUpdate) {
        var oChangedLink = this.changedLinkDestinations[sElementId];

        if (!bUpdate && oChangedLink) return false;

        this.parentProfile.hasUnsavedChanges = true;

        oChangedLink = {
            id: sElementId,
            destination: sNewDestination
        };

        this.changedLinkDestinations[sElementId] = oChangedLink;
        return oChangedLink;
    }

    removeChangeLinkDestination(sElementId) {
        this.parentProfile.hasUnsavedChanges = true;
        delete this.changedLinkDestinations[sElementId];
    }

    getChangedLinks() {
        return this.changedLinkDestinations;
    }

    createButton(sContainerId, sButtonId, sText, sDestination, aClasses, sBackgroundColor, bOpneNewTab) {
        this.parentProfile.hasUnsavedChanges = true;
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
        this.parentProfile.hasUnsavedChanges = true;
        delete this.createdButtons[sButtonId];
    }

    createLink(sContainerId, sLinkId, sText, sDestination, sType, sBackgroundColor, bOpneNewTab, bUpdate) {
        var oCreatedLink = this.createdLinks[sLinkId];
        if (!bUpdate && oCreatedLink) return false;
        this.parentProfile.hasUnsavedChanges = true;
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
        this.parentProfile.hasUnsavedChanges = true;
        delete this.createdLinks[sLinkId];
    }

    moveElement(sElementId, sTargetContainer, iPosition, bUpdate) {
        if (!bUpdate && this.movedElements[sElementId]) return false;
        this.parentProfile.hasUnsavedChanges = true;

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
        this.parentProfile.hasUnsavedChanges = true;
        delete this.movedElements[sElementId];
    }

    modifyElementStyle(sElementId, sElementClass, oStyles, bUpdate) {
        var sModificationId = this.MODIFY_STYLE_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);

        if (!bUpdate && this.elementStyleModifications[sModificationId]) return false;
        this.parentProfile.hasUnsavedChanges = true;

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
        this.parentProfile.hasUnsavedChanges = true;
        delete this.elementStyleModifications[sModificationId];
    }

    modifyElementClass(sElementId, sElementClass, aClasses, bUpdate) {
        var sModificationId = this.MODIFY_CLASS_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);
        if (!bUpdate && this.elementClassModifications[sModificationId]) return false;
        this.parentProfile.hasUnsavedChanges = true;

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
        this.parentProfile.hasUnsavedChanges = true;

        this.tagStyleModifications[sTag] = {
            id: this.MODIFY_STYLE_OPERATION + "-" + sTag,
            tag: sTag,
            styles: oStyles
        };;
    }

    removeElementClassModification(sElementId, sElementClass) {
        var sModificationId = this.MODIFY_CLASS_OPERATION + "_" + (sElementId ? "idSelector_" : "classSelector_") + (sElementId || sElementClass);
        this.parentProfile.hasUnsavedChanges = true;
        delete this.elementClassModifications[sModificationId];
    }
}