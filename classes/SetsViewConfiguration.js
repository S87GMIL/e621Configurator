const setViewId = "sets";

class SetsViewConfiguration extends ViewConfiguration {
    constructor(sId, sPath, bIncludeSubPaths, sSearchParameters, oProfile) {
        super(sId, sPath, bIncludeSubPaths, sSearchParameters, setViewId, oProfile);
        this.customSetTables = {};
    }

    static get setViewId() {
        return setViewId;
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
        this.parentProfile.hasUnsavedChanges = true;

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
        this.parentProfile.hasUnsavedChanges = true;
        delete this.customSetTables[sTableId];
    }
}