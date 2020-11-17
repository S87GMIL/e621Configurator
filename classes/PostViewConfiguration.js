const postViewId = "posts";

class PostViewConfiguration extends ViewConfiguration {
    constructor(sId, sPath, bIncludeSubPaths, sSearchParameters, oProfile) {
        super(sId, sPath, bIncludeSubPaths, sSearchParameters, postViewId, oProfile);

        this.customSetGroups = {};
        this.setSelectionDialogElements = new Set();
    }

    static get postViewId() {
        return postViewId;
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
        this.parentProfile.hasUnsavedChanges = true;
        this.setSelectionDialogElements[sElementId] = {
            id: sElementId,
            position: iPosition
        };
    }

    removeAddedSetSelectionDialogElements(sElementId) {
        this.parentProfile.hasUnsavedChanges = true;
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
        if (!bUpdateGroup && oCustomGroup) return false;
        this.parentProfile.hasUnsavedChanges = true;

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
        this.parentProfile.hasUnsavedChanges = true;
        delete this.customSetGroups[sGroupId];
    }
}