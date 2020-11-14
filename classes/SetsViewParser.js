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