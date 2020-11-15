class SetsViewParser extends ViewConfigParser {
    constructor(sPath, sSearchParameters) {
        super(sPath, sSearchParameters);

        this.bTablesAdded = false;
    }

    performUiChanges(oViewConfig) {
        oViewConfig.executionOrder.forEach(sFunctionName => {
            var oConfig = oViewConfig[sFunctionName];

            if (oConfig) this[sFunctionName](oConfig);
        });
    }

    createCustomSetTables(oConfig) {
        if (!this.bTablesAdded) {
            for (var sKey in oConfig) {
                var oTableConfig = oConfig[sKey];

                var oNewTableSection = HTMLFunctions.createTableWithTitle(oTableConfig.id, oTableConfig.title);
                HTMLFunctions.moveSetsToTable("set-index", oNewTableSection.table, oTableConfig.setSelector, oTableConfig.setNames);
                HTMLFunctions.addElementToContainer(oNewTableSection.container, "set-index", oTableConfig.position);
            }
            this.bTablesAdded = true;
        }
    }
}