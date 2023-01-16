class SetsViewParser extends ViewConfigParser {
    constructor(sPath, sSearchParameters) {
        super(sPath, sSearchParameters);

        this.bTablesAdded = false;
    }

    performUiChanges(oViewConfig) {
        this.displaySimilarPostsLink();

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

    async displaySimilarPostsLink() {
        let relatedLinksList = document.getElementById("related-list");
        if (!relatedLinksList)
            return;

        let listItem = document.createElement("li");
        relatedLinksList.appendChild(listItem);
        let link = document.createElement("a");
        listItem.appendChild(link);

        link.innerText = "Loading posts suggestions ...";

        let suggestionhelper = SuggestionHelper.getInstance();

        let setShortName = window.location.search.split("%3A").pop();
        if (!setShortName) {
            listItem.display = "None";
            return;
        }

        let importantTags = await suggestionhelper.getImportantSetTags(setShortName);

        if (importantTags.length === 0) {
            listItem.display = "None";
            return;
        }

        link.innerText = "Suggested Posts";


        let importantTagSearchString = "";

        importantTags.forEach(tag => {
            importantTagSearchString += tag + "+";
        });

        link.addEventListener("click", () => {
            window.location = `https://e621.net/posts?tags=${importantTagSearchString}`;
        });
    }
}