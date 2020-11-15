class ConfigurationSection {
    constructor(sTitle, iElementCount, aTableColumns, oInputs) {
        this.title = sTitle || "";
        this.inputs = oInputs;
        this.elementCount = iElementCount;
        this.tableColumns = aTableColumns;

        this.configurationSection = this.#createConfigSection();
    }

    #createConfigSection() {
        this.#createContainer();
        this.#createPanels();

        HTMLFunctions.addElementToContainer(this.collapsedPanel, this.container);
        HTMLFunctions.addElementToContainer(this.expandedPanel, this.container);

        this.#createInputSection();

        HTMLFunctions.addElementToContainer(this.inputSection, this.expandedPanel);

        this.addInputs(this.inputs);
        this.#createTable()

        HTMLFunctions.addElementToContainer(this.table, this.expandedPanel);

        return this.container;
    }

    #createContainer() {
        this.container = HTMLFunctions.createElementFromHTML(`<div style="margin-top: 10px; margin-bottom: 10px" class="box-section"><div>`);
        return this.container;
    }

    #createPanels() {
        this.collapsedPanelTitle = HTMLFunctions.createElementFromHTML(`<label>${this.title}(${this.elementCount})</label>`);
        this.expandedPanelTitle = HTMLFunctions.createElementFromHTML(`<label>${this.title}(${this.elementCount})</label>`);

        var oShowButton = HTMLFunctions.createElementFromHTML(`<a style="margin-left: 5px; cursor: pointer" >show »</a>`);
        this.collapsedPanel = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"></div>`);

        HTMLFunctions.addElementToContainer(this.collapsedPanelTitle, this.collapsedPanel);
        HTMLFunctions.addElementToContainer(oShowButton, this.collapsedPanel);

        var oHideButton = HTMLFunctions.createElementFromHTML(`<a style="margin-left: 5px; cursor: pointer">« hide</a>`);
        this.expandedPanel = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"></div>`);

        HTMLFunctions.addElementToContainer(this.expandedPanelTitle, this.expandedPanel);
        HTMLFunctions.addElementToContainer(oHideButton, this.expandedPanel);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(this.expandedPanel, "display", "block");
            HTMLFunctions.hideElement(this.collapsedPanel);
        }.bind(this));

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(this.collapsedPanel, "display", "block");
            HTMLFunctions.hideElement(this.expandedPanel);
        }.bind(this));


        return {
            collapsedPanel: this.collapsedPanel,
            expandedPanel: this.expandedPanel
        }
    }

    #createInputSection() {
        this.inputSection = HTMLFunctions.createElementFromHTML(`<div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;"></div>`);
        return this.inputSection;
    }

    #createTable() {
        this.table = HTMLFunctions.createTable();
        if (this.tableColumns) HTMLFunctions.createTableColumns(this.table, this.tableColumns);
        return this.table;
    }

    createTableColumns(aColumnNames) {
        HTMLFunctions.createTableColumns(this.table, aColumnNames);
    }

    addTableRows(oRows) {
        if (Object.keys(oRows).length > 0) HTMLFunctions.createTableRows(this.table, oRows);
    }

    addInputs(oInputs) {
        if (oInputs) HTMLFunctions.addElementToContainer(oInputs, this.inputSection)
    }

    setTitle(sTitle) {
        this.collapsedPanelTitle.innerText = sTitle;
        this.expandedPanelTitle.innerText = sTitle;
    }
}