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