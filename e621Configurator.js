class E621Configurator {
    constructor(oElementSelection) {
        this.ElementSelection = oElementSelection;
    }

    createNewProfile(sId, sName, sDescription, oIsActive, oViewConfigs, bDeletable, bEditable) {
        return new Profile(sId, sName, sDescription, oIsActive, oViewConfigs, bDeletable, bEditable);
    }

    reloadProfiles() {
        HTMLFunctions.getElement("viewConfig-content").innerHTML = "";
    }

    displayConfirmationDialog(sTitle, sText, fConfirmHandler, fCancelHandler) {
        var oDialog = HTMLFunctions.createDialog("confirmationDialog", sTitle, true);

        var oTextSection = HTMLFunctions.createElementFromHTML(`<div style="padding-top: 15px; padding-left: 10px; padding-right: 10px;">${sText}</div>`);
        HTMLFunctions.addElementToContainer(oTextSection, oDialog.content)

        var oCancelButton = HTMLFunctions.createButton(undefined, "Cancel", function () {
            HTMLFunctions.hideElement(oDialog.dialog);
            if (fCancelHandler) fCancelHandler();
        });

        var oConfirmButton = HTMLFunctions.createButton("profileCreation-creationButton", "Confirm", function () {
            HTMLFunctions.hideElement(oDialog.dialog);
            if (fConfirmHandler) fConfirmHandler()
        });

        HTMLFunctions.addElementStyles(oCancelButton, { float: "left" });
        HTMLFunctions.addElementStyles(oConfirmButton, { float: "right" });
        HTMLFunctions.addElementToContainer(oCancelButton, oDialog.footer);
        HTMLFunctions.addElementToContainer(oConfirmButton, oDialog.footer);

        return oDialog.dialog;
    }

    createBasicInfoForm(bCreationMode, oProfile) {
        var oBasicInfoContainer = HTMLFunctions.createElementFromHTML('<div class="box-section" style="display: flex"></div>');
        var oBasicInfoForm = HTMLFunctions.createElementFromHTML('<form class="border-bottom"></form>');

        var aBasicInfoElents = [];
        var sLabelStyle = `float: left; width:60%; margin-bottom: 10px`;
        var sInputStyle = `float: left; width:39%; margin-bottom: 10px`;

        if (bCreationMode) {
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">ID:<label style="color: red">*</label></label>`));
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileIdInput" style="${sInputStyle}" type="text" value="${oProfile.id || ''}"><br><br>`));

            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Name:<label style="color: red">*</label></label><br>`));
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileNameInput" style="${sInputStyle}" type="text" value="${oProfile.name || ''}"><br><br>`));

            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Description:</label><br>`));
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileDescriptionInput" style="${sInputStyle}" type="text" value="${oProfile.description || ''}"><br><br>`));
        } else {
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">ID:</label>`));
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<div style="${sInputStyle}">${oProfile.id}</div><br><br>`));

            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Name:<label style="color: red">*</label></label><br>`));
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileNameInput" style="${sInputStyle}" value="${oProfile.name}" type="text"><br><br>`));

            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Description:</label><br>`));
            aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileDescriptionInput" style="${sInputStyle}" value="${oProfile.description}" type="text"><br><br>`));

            if (oProfile.isDeletable()) {
                var oDeleteButton = HTMLFunctions.createButton(
                    undefined, "Delete", function (oEvent) {

                        var sText = `Confirm the deletion of the profile '${oEvent.srcElement.dataset.profile_name}'`;
                        var sProfielId = oEvent.srcElement.dataset.profile_id;
                        this.displayConfirmationDialog("Confirm Profile Deletion", sText, function () {
                            ProfileStorage.deleteProfile(sProfielId);
                            this.displayProfileSelection();
                        }.bind(this));

                    }.bind(this), { profile_id: oProfile.getId(), profile_name: oProfile.getName() }
                );

                HTMLFunctions.addElementStyles(oDeleteButton, { "padding-top": "10px", "padding-left": "0px" });
                aBasicInfoElents.push(oDeleteButton);
            }

            if (oProfile.isEditable()) {
                var oExportButton = HTMLFunctions.createButton(undefined, "Export", function () {
                    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(oProfile.generateJsonConfiguration()));
                    var oDownloadAnchor = HTMLFunctions.createElementFromHTML('<a></a>');
                    var sFileName = oProfile.getName();

                    oDownloadAnchor.setAttribute("href", dataStr);
                    oDownloadAnchor.setAttribute("download", `${sFileName}.json`);
                    oDownloadAnchor.click();
                });
                HTMLFunctions.addElementStyles(oExportButton, { "padding-top": "10px", "padding-left": "0px", "display": "block" });

                aBasicInfoElents.push(oExportButton);
            }
        }

        aBasicInfoElents.forEach(oElement => {
            HTMLFunctions.addElementToContainer(oElement, oBasicInfoForm);
        });

        HTMLFunctions.addElementToContainer(oBasicInfoForm, oBasicInfoContainer);

        return oBasicInfoContainer;
    }

    createViewConfigurationTable(bCreationMode, oProfile) {
        var oTableContainer = HTMLFunctions.createContainerWithTitle("viewConfig-container", "View Configurations", "h3", { "margin-top": "5px", "margin-bottom": "20px" });

        var oCreateSection = HTMLFunctions.createElementFromHTML(`
            <div style="padding-left: .25rem">
            </div>
        `);
        var oPathInput = HTMLFunctions.createElementFromHTML(`
            <input id="configCreationPathInput" type="text" style="width: 110px" placeholder="e.g. /posts">
        `);

        oPathInput.addEventListener("input", function (oEvent) {
            HTMLFunctions.setInputErrorState(oEvent.srcElement, false);
        });

        var oUseCurrentPathButton = HTMLFunctions.createElementFromHTML(`
            <a style="cursor: pointer; margin-left: 10px">User Current Path</a>
        `);
        oUseCurrentPathButton.addEventListener("click", function () {
            oPathInput.value = window.location.pathname;
        });

        var oCreateConfigButton = HTMLFunctions.createButton("viewConfig-creationButton", "Create", function () {
            if (bCreationMode) oProfile.setId(HTMLFunctions.getElement("profileIdInput").value);
            oProfile.setName(HTMLFunctions.getElement("profileNameInput").value);
            oProfile.setDescription(HTMLFunctions.getElement("profileDescriptionInput").value);

            var oPathInput = HTMLFunctions.getElement("configCreationPathInput");
            var sPath = oPathInput.value;
            if (sPath) {
                HTMLFunctions.setInputErrorState(oPathInput, false);
                this.onCreateViewConfig(bCreationMode, oProfile, sPath)
            } else {
                HTMLFunctions.setInputErrorState(oPathInput, true, "Enter a path");
            }
        }.bind(this));
        var oCreateButtonCotnainer = HTMLFunctions.createElementFromHTML(`<div style="display: block"></div>`);

        HTMLFunctions.addElementStyles(oCreateSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementStyles(oCreateConfigButton, { "padding-left": "0px", "margin-top": "10px" });

        HTMLFunctions.addElementToContainer(oPathInput, oCreateSection);
        HTMLFunctions.addElementToContainer(oUseCurrentPathButton, oCreateSection);
        HTMLFunctions.addElementToContainer(oCreateConfigButton, oCreateButtonCotnainer);
        HTMLFunctions.addElementToContainer(oCreateButtonCotnainer, oCreateSection);
        HTMLFunctions.addElementToContainer(oCreateSection, oTableContainer);

        var oViewConfigTable = HTMLFunctions.createTable("viewConfigTable", ["table", "striped"]);

        HTMLFunctions.addElementToContainer(oViewConfigTable, oTableContainer);
        HTMLFunctions.createTableColumns(oViewConfigTable, ["View", "Path", "Parameters", "", ""]);

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
                    content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        if (bCreationMode) oProfile.setId(HTMLFunctions.getElement("profileIdInput").value);
                        oProfile.setName(HTMLFunctions.getElement("profileNameInput").value);
                        oProfile.setDescription(HTMLFunctions.getElement("profileDescriptionInput").value);

                        this.onEditViewConfig(bCreationMode, oProfile, oEvent.srcElement.dataset.config_id);
                    }.bind(this), { config_id: oViewConfig.getId() })
                },
                deleteButton: {
                    index: 4,
                    content: HTMLFunctions.createButton(undefined, "Delete", function (oEvent) {
                        var sViewConfigId = oEvent.srcElement.dataset.config_id;
                        var sPath = oEvent.srcElement.dataset.path;

                        oProfile.deleteViewConfiguration(sViewConfigId);
                        HTMLFunctions.removeTableRow(oViewConfigTable, { column: "Path", value: sPath })
                    }, { config_id: oViewConfig.getId(), path: oViewConfig.getPath() })
                }
            }
        });

        HTMLFunctions.createTableRows(oViewConfigTable, oTableRows);

        return oTableContainer;
    }

    onEditViewConfig(bCreationMode, oProfile, sViewConfigId) {
        var oViewConfig = oProfile.getViewConfiguration(sViewConfigId);
        switch (oViewConfig.getViewId()) {
            case PostViewConfiguration.postViewId:
                this.displayPostViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            case SetsViewConfiguration.setViewId:
                this.displaySetViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            default:
                this.displayBasicViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
        }
    }

    createHiddenElementSection(oViewConfiguration) {
        var oHiddenElementsSection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-top: 20px; margin-bottom: 10px"></div>`);

        var aHiddenElements = oViewConfiguration.getHiddenElements();
        var iHiddenElementCount = aHiddenElements.length;

        var sHiddenElementsTitle = `Hidden Elements(${iHiddenElementCount})`;
        var oShowHiddenElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showHiddenElementsTitle">${sHiddenElementsTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="hiddenElements-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowHiddenElementsContainer);

        var oHideHiddenElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideHiddenElementsTitle">${sHiddenElementsTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="hiddenElements-hideSectionButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideHiddenElementsContainer);

        var oHideElementButtonSection = HTMLFunctions.createElementFromHTML(`
                <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                <div>
            `);

        var oElementInput = this.ElementSelection.crateHtmlElementSelectionInput("e.g. image-resize-selector", undefined, true);
        HTMLFunctions.addElementToContainer(oElementInput.container, oHideElementButtonSection);


        var oHideElementButton = HTMLFunctions.createButton("hiddenElements-hideButton", "Hide Element", function () {
            var oInput = oElementInput.input;

            var fSelectorInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;

                if (oSrcElement.value.includes(" ")) {
                    HTMLFunctions.setInputErrorState(oSrcElement, true, "The element ID can't contain spaces")
                } else {
                    HTMLFunctions.setInputErrorState(oSrcElement, false);
                }
            }

            oInput.addEventListener("input", fSelectorInputHandler);

            var sId = oInput.value;
            if (sId) {
                HTMLFunctions.setInputErrorState(oElementInput.input, false,);
                var oHiddenElement = oViewConfiguration.hideElement(sId);

                if (!oHiddenElement) {
                    HTMLFunctions.setInputErrorState(oInput, true, "Element has already been hidden");
                    return;
                }


                var sHiddenElementsTitle = `Hidden Elements(${oViewConfiguration.getHiddenElements().length})`;
                HTMLFunctions.getElement("showHiddenElementsTitle").innerText = sHiddenElementsTitle;
                HTMLFunctions.getElement("hideHiddenElementsTitle").innerText = sHiddenElementsTitle;

                oInput.value = "";
                HTMLFunctions.createTableRows(oHiddenElementsTable, {
                    sId: {
                        elementId: { index: 0, content: sId },
                        removeButton: {
                            index: 1,
                            content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                                oViewConfiguration.removeHiddenElement(oEvent.srcElement.dataset.element_id);
                                HTMLFunctions.removeTableRow(oHiddenElementsTable, { column: "Element ID", value: sId });

                                var sHiddenElementsTitle = `Hidden Elements(${oViewConfiguration.getHiddenElements().length})`;
                                HTMLFunctions.getElement("showHiddenElementsTitle").innerText = sHiddenElementsTitle;
                                HTMLFunctions.getElement("hideHiddenElementsTitle").innerText = sHiddenElementsTitle;
                            }, { element_id: sId })
                        }
                    }
                });
            } else {
                HTMLFunctions.setInputErrorState(oElementInput.input, true, "Element ID can't be empty");
            }
        });
        HTMLFunctions.addElementStyles(oHideElementButton, { padding: "0.25rem 0rem" });

        HTMLFunctions.addElementStyles(oHideElementButton, { "margin-top": "20px" });
        HTMLFunctions.addElementStyles(oHideElementButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oHideElementButton, oHideElementButtonSection, 6);
        HTMLFunctions.addElementToContainer(oHideElementButtonSection, oHideHiddenElementsContainer);

        var oHiddenElementsTable = HTMLFunctions.createTable("hiddenElementsTable", ["table", "striped"]);
        HTMLFunctions.createTableColumns(oHiddenElementsTable, ["Element ID", ""]);

        var oHiddenElementRows = {};
        aHiddenElements.forEach(sHiddenElementId => {
            oHiddenElementRows[sHiddenElementId] = {
                elementId: {
                    index: 0,
                    content: sHiddenElementId
                },
                removeButton: {
                    index: 1,
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sElementId = oEvent.srcElement.dataset.element_id;
                        oViewConfiguration.removeHiddenElement(sElementId);

                        HTMLFunctions.removeTableRow(oHiddenElementsTable, { column: "Element ID", value: sElementId });

                        var sHiddenElementsTitle = `Hidden Elements(${oViewConfiguration.getHiddenElements().length})`;
                        HTMLFunctions.getElement("showHiddenElementsTitle").innerText = sHiddenElementsTitle;
                        HTMLFunctions.getElement("hideHiddenElementsTitle").innerText = sHiddenElementsTitle;
                    }, { element_id: sHiddenElementId })
                }
            }
        });

        HTMLFunctions.createTableRows(oHiddenElementsTable, oHiddenElementRows);
        HTMLFunctions.addElementToContainer(oHiddenElementsTable, oHiddenElementsSection);
        HTMLFunctions.addElementToContainer(oHiddenElementsTable, oHideHiddenElementsContainer);

        HTMLFunctions.addElementToContainer(oShowHiddenElementsContainer, oHiddenElementsSection);
        HTMLFunctions.addElementToContainer(oHideHiddenElementsContainer, oHiddenElementsSection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideHiddenElementsContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowHiddenElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideHiddenElementsContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowHiddenElementsContainer, "display", "block");
        });

        return oHiddenElementsSection;
    }

    createModifiedElementSection(oViewConfiguration) {
        var oModifiedElementSelection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oModifiedElements = {
            ...oViewConfiguration.getStyleModifiedElements(), ...oViewConfiguration.getClassModifiedElements()
        };
        var iModifiedElementCount = Object.keys(oModifiedElements).length;

        var sModifiedElementsTitle = `Modified Elements(${iModifiedElementCount})`;
        var oShowModifiedElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showModifiedElementsTitle">${sModifiedElementsTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="modifyElements-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowModifiedElementsContainer);

        var oHideModifiedElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideModifiedElementsTitle">${sModifiedElementsTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="modifyElements-hideButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideModifiedElementsContainer);

        var oModifyElementInputSection = HTMLFunctions.createElementFromHTML(`
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

        var oClassSelectorCheckbox = HTMLFunctions.createElementFromHTML('<input id="modifyElements-classSlectorCheckbox" type="checkbox">');
        HTMLFunctions.addElementToContainer(oClassSelectorCheckbox, oModifyElementInputSection, 2);

        var oIdSelectorSection = this.ElementSelection.crateHtmlElementSelectionInput("e.g. add-to-set-id", undefined, true);
        HTMLFunctions.addElementToContainer(oIdSelectorSection.container, oModifyElementInputSection, 3);

        var oClassInput = this.ElementSelection.crateHtmlElementSelectionInput("e.g. search-tag", "Element Class:", true, true);
        HTMLFunctions.addElementStyles(oClassInput.container, { "display": "none" })
        HTMLFunctions.addElementToContainer(oClassInput.container, oModifyElementInputSection, 3);

        var oOperationSelection = HTMLFunctions.createElementFromHTML(`
                <select id="modifyElements-operationSelection" style="margin-top: 5px">
                    <option value="${oViewConfiguration.MODIFY_STYLE_OPERATION}">Add Style</option>
                    <option value="${oViewConfiguration.MODIFY_CLASS_OPERATION}">Add Class</option>
                </select><br><br>`
        );
        HTMLFunctions.addElementToContainer(oOperationSelection, oModifyElementInputSection, 10);

        var fSelectorInputHandler = function (oEvent) {
            var oSrcElement = oEvent.srcElement;

            if (oSrcElement.value.includes(" ")) {
                HTMLFunctions.setInputErrorState(oSrcElement, true, "Selector can't contain spaces")
            } else {
                HTMLFunctions.setInputErrorState(oSrcElement, false);
            }
        }

        oIdSelectorSection.input.addEventListener("input", fSelectorInputHandler);
        oClassInput.input.addEventListener("input", fSelectorInputHandler);

        HTMLFunctions.addElementToContainer(HTMLFunctions.createElementFromHTML("<br>"), oModifyElementInputSection, 3);
        HTMLFunctions.addElementToContainer(HTMLFunctions.createElementFromHTML("<br>"), oModifyElementInputSection, 3);

        var fClassSelectorCheckedHandler = function () {
            if (oClassSelectorCheckbox.checked) {
                HTMLFunctions.hideElement(oIdSelectorSection.container);
                HTMLFunctions.addStyleToElement(oClassInput.container, "display", "block");
            } else {
                HTMLFunctions.hideElement(oClassInput.container);
                HTMLFunctions.addStyleToElement(oIdSelectorSection.container, "display", "block");
            }
        }

        oClassSelectorCheckbox.addEventListener("change", fClassSelectorCheckedHandler);

        var fOperationChangedHandler = function () {
            if (oOperationSelection.value === oViewConfiguration.MODIFY_STYLE_OPERATION) {
                HTMLFunctions.hideElement("modifyElements-classSection");
                HTMLFunctions.addStyleToElement("modifyElements-styleSection", "display", "block");
            } else {
                HTMLFunctions.hideElement("modifyElements-styleSection");
                HTMLFunctions.addStyleToElement("modifyElements-classSection", "display", "block");
            }
        }

        oOperationSelection.addEventListener("change", fOperationChangedHandler);

        HTMLFunctions.addElementToContainer(oModifyElementInputSection, oHideModifiedElementsContainer);

        var oModifiedElementsTable = HTMLFunctions.createTable("modifiedElementsTable", ["table", "striped"]);
        HTMLFunctions.createTableColumns(oModifiedElementsTable, ["Element ID", "Element Class", "Operation", "Values", "", ""]);

        var fClearInputFields = function () {
            oIdSelectorSection.input.value = "";
            oClassInput.input.value = "";
            HTMLFunctions.getElement("modifyElements-stylesInput").value = "";
            HTMLFunctions.getElement("modifyElements-classesInput").value = "";

            oIdSelectorSection.input.disabled = false;
            oClassInput.input.disabled = false;
            oOperationSelection.disabled = false;
            HTMLFunctions.getElement("modifyElements-classSlectorCheckbox").disabled = false;
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

            var oClassSelectorCheckbox = HTMLFunctions.getElement("modifyElements-classSlectorCheckbox");
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

            HTMLFunctions.getElement("modifyElements-stylesInput").value = oElement.styles ? JSON.stringify(oElement.styles).replace(/[{}]/g, "") : "";
            HTMLFunctions.getElement("modifyElements-classesInput").value = oElement.classes ? oElement.classes.join(", ") : "";

            var oModifyButton = HTMLFunctions.getElement("modifyElements-modifyButton");
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

            HTMLFunctions.createTableRows(oTable, {
                sId: {
                    elementId: { index: 0, content: oModifiedElement.id || "" },
                    elementClass: { index: 1, content: oModifiedElement.class || "" },
                    operation: { index: 2, content: oModifiedElement.operation },
                    values: { index: 3, content: sContent },
                    removeButton: {
                        index: 4, content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                            var sElementId = oEvent.srcElement.dataset.element_id;
                            var sElementClass = oEvent.srcElement.dataset.element_class;
                            var sOperation = oEvent.srcElement.dataset.operation;
                            var bUseClassSelector = sElementClass ? true : false;

                            if (sOperation === "modifyStyle") {
                                oViewConfiguration.removeElementStyleModification(sElementId, sElementClass);
                            } else {
                                oViewConfiguration.removeElementClassModification(sElementId, sElementClass);
                            }

                            HTMLFunctions.removeTableRow(oTable, { columns: [{ column: bUseClassSelector ? "Element Class" : "Element ID", value: bUseClassSelector ? sElementClass : sElementId }] });

                            var iModifiedElements = Object.keys(oViewConfiguration.getStyleModifiedElements()).length + Object.keys(oViewConfiguration.getClassModifiedElements()).length;
                            var sHiddenElementsTitle = `Modified Elements(${iModifiedElements})`;
                            HTMLFunctions.getElement("showModifiedElementsTitle").innerText = sHiddenElementsTitle;
                            HTMLFunctions.getElement("hideModifiedElementsTitle").innerText = sHiddenElementsTitle;
                        }, { element_id: oModifiedElement.id || "", element_class: oModifiedElement.class || "", operation: oModifiedElement.operation || "" })
                    },
                    editButton: {
                        index: 5,
                        content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                            fEditElementModification(oEvent.srcElement.dataset.element_id, oEvent.srcElement.dataset.operation);
                        }, { element_id: oModifiedElement.id || oModifiedElement.class, operation: oModifiedElement.operation })
                    }
                }
            });
        }

        var fModifyElement = function () {
            var oModifyButton = HTMLFunctions.getElement("modifyElements-modifyButton");
            var bUpdate = oModifyButton.dataset.update === "true";
            var bUseClassSelector = HTMLFunctions.getElement("modifyElements-classSlectorCheckbox").checked;

            var sIdSelector = oIdSelectorSection.input.value;
            var sClassSelector = oClassInput.input.value;

            var oOperationSelection = HTMLFunctions.getElement("modifyElements-operationSelection");

            var sOperation = oOperationSelection.value;

            var sRawStyles = HTMLFunctions.getElement("modifyElements-stylesInput").value;
            var sRawClassInput = HTMLFunctions.getElement("modifyElements-classesInput").value;

            if (bUseClassSelector) {
                sIdSelector = undefined;

                if (!sClassSelector) {
                    HTMLFunctions.setInputErrorState(oClassInput.input, true, "The Class selector can't be empty");
                    return;
                }
            } else {
                sClassSelector = undefined;

                if (!sIdSelector) {
                    HTMLFunctions.setInputErrorState(oIdSelectorSection.input, true, "Element ID can't be empty");
                    return;
                }
            }

            var oModifyEntry;
            if (sOperation === oViewConfiguration.MODIFY_STYLE_OPERATION) {
                try {
                    if (!sRawStyles) {
                        HTMLFunctions.setInputErrorState("modifyElements-stylesInput", true, "No styles defined");
                        return;
                    }

                    oModifyEntry = oViewConfiguration.modifyElementStyle(sIdSelector, sClassSelector, JSON.parse(`{ ${sRawStyles} }`), bUpdate);
                    if (bUpdate) HTMLFunctions.removeTableRow(oModifiedElementsTable, { columns: [{ column: oModifyEntry.class ? "Element Class" : "Element ID", value: oModifyEntry.class ? oModifyEntry.class : oModifyEntry.id }, { column: "Operation", value: sOperation }] });
                    oModifyButton.innerText = "Modify Element";
                    oModifyButton.dataset.update = false;

                } catch (oError) {
                    HTMLFunctions.setInputErrorState("modifyElements-stylesInput", true, "Invalid style entry");
                    return;
                }
            } else {
                if (!sRawClassInput) {
                    HTMLFunctions.setInputErrorState("modifyElements-classesInput", true, "No classes defined");
                    return;
                }

                oModifyEntry = oViewConfiguration.modifyElementClass(sIdSelector, sClassSelector, sRawClassInput.replace(/ /g, "").split(","), bUpdate);
                if (bUpdate) HTMLFunctions.removeTableRow(oTable, { column: oModifyEntry.class ? "Element Class" : "Element ID", value: oModifyEntry.class ? oModifyEntry.class : oModifyEntry.id });
                oModifyButton.innerText = "Modify Element";
                oModifyButton.dataset.update = false;

            }

            if (!oModifyEntry) {
                var sMessage = "Element has already been modified";
                var oInput = bUseClassSelector ? oClassInput.input : oIdSelectorSection.input;
                HTMLFunctions.setInputErrorState(oInput, true, sMessage);
                return;
            }

            var iModifiedElements = Object.keys(oViewConfiguration.getStyleModifiedElements()).length + Object.keys(oViewConfiguration.getClassModifiedElements()).length;
            var sHiddenElementsTitle = `Modified Elements(${iModifiedElements})`;
            HTMLFunctions.getElement("showModifiedElementsTitle").innerText = sHiddenElementsTitle;
            HTMLFunctions.getElement("hideModifiedElementsTitle").innerText = sHiddenElementsTitle;

            fCreateModifyTableEntry(oModifiedElementsTable, oModifyEntry);
            fClearInputFields();
        };

        var oModifyElementButton = HTMLFunctions.createButton("modifyElements-modifyButton", "Modify Element", fModifyElement);
        HTMLFunctions.addElementStyles(oModifyElementButton, { padding: "0.25rem 0rem" });

        HTMLFunctions.addElementStyles(oModifyElementButton, { "margin-top": "20px" })

        HTMLFunctions.addElementStyles(oModifyElementInputSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oModifyElementButton, oModifyElementInputSection);
        HTMLFunctions.addElementToContainer(oModifyElementInputSection, oHideModifiedElementsContainer);

        var oModifiedElementRows = {};
        for (var sKey in oModifiedElements) {
            var oModifiedElement = oModifiedElements[sKey];

            fCreateModifyTableEntry(oModifiedElementsTable, oModifiedElement);
        }

        HTMLFunctions.createTableRows(oModifiedElementsTable, oModifiedElementRows);
        HTMLFunctions.addElementToContainer(oModifiedElementsTable, oModifiedElementSelection);
        HTMLFunctions.addElementToContainer(oModifiedElementsTable, oHideModifiedElementsContainer);

        HTMLFunctions.addElementToContainer(oShowModifiedElementsContainer, oModifiedElementSelection);
        HTMLFunctions.addElementToContainer(oHideModifiedElementsContainer, oModifiedElementSelection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideModifiedElementsContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowModifiedElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideModifiedElementsContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowModifiedElementsContainer, "display", "block");
        });

        return oModifiedElementSelection;
    }

    createMovedElementSection(oViewConfiguration) {
        var oMovedElementsSection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oMovedElements = oViewConfiguration.getMovedElements();
        var iMovedElementCount = Object.keys(oMovedElements).length;

        var sMovedElementsTitle = `Moved Elements(${iMovedElementCount})`;
        var oShowMovedElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showMovedElementsTitle">${sMovedElementsTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="moveElements-showButton" style="margin-left: 5px; cursor: pointer">show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowMovedElementsContainer);

        var oHideMovedElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideMovedElementsTitle">${sMovedElementsTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="moveElements-hideSectionButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideMovedElementsContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oMoveElementButtonSection = HTMLFunctions.createElementFromHTML(`
                <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                    <div style="${sLabelStyles}">Position:</div>
                    <input id="moveElements-positionInput" type="number" min="0" style="width: 60px; margin-top: 5px; display: block" placeholder="e.g. 0">
                <div>
            `);

        var elementInputSection = this.ElementSelection.crateHtmlElementSelectionInput("e.g. add-to-set", undefined, true);
        HTMLFunctions.addElementToContainer(elementInputSection.container, oMoveElementButtonSection, 1);
        HTMLFunctions.addElementStyles(elementInputSection.container, { "margin-top": "10px" });

        var oTargetElementSection = this.ElementSelection.crateHtmlElementSelectionInput("e.g. image-extra-controls", "Target Container ID / XPath:", true);
        HTMLFunctions.addElementToContainer(oTargetElementSection.container, oMoveElementButtonSection, 2);
        HTMLFunctions.addElementStyles(oTargetElementSection.container, { "margin-top": "10px" });

        var fEditMovedElements = function (sElementId) {
            var oMovedElement = oViewConfiguration.getMovedElements()[sElementId];

            elementInputSection.input.value = oMovedElement.id;
            elementInputSection.input.disabled = true;
            oTargetElementSection.input.value = oMovedElement.targetContainer

            HTMLFunctions.getElement("moveElements-positionInput").value = oMovedElement.position;

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
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.element_id;
                        oViewConfiguration.removeElementMove(sId);
                        HTMLFunctions.removeTableRow(oMovedElementsTable, { column: "Element ID", value: sId });

                        var sMovedElementsTitle = `Moved Elements(${Object.keys(oViewConfiguration.getMovedElements()).length})`;
                        HTMLFunctions.getElement("showMovedElementsTitle").innerText = sMovedElementsTitle;
                        HTMLFunctions.getElement("hideMovedElementsTitle").innerText = sMovedElementsTitle;
                    }, { element_id: sElementId })
                },
                editButton: {
                    index: 4,
                    content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditMovedElements(oEvent.srcElement.dataset.element_id);
                    }, { element_id: sElementId })
                }
            };
        };

        var fMoveElement = function (oEvent) {
            var bUpdate = oEvent.srcElement.dataset.update === "true";

            var oElementIdInput = elementInputSection.input;
            var oTargetIdInput = oTargetElementSection.input;
            var oPositionInput = HTMLFunctions.getElement("moveElements-positionInput");

            var fSelectorInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    HTMLFunctions.setInputErrorState(oSrcElement, true, "The ID can't contain spaces")
                } else {
                    HTMLFunctions.setInputErrorState(oSrcElement, false);
                }
            }

            oElementIdInput.addEventListener("input", fSelectorInputHandler);
            oTargetIdInput.addEventListener("input", fSelectorInputHandler);

            var sElementId = oElementIdInput.value;
            var sTargetId = oTargetIdInput.value;
            var iPosition = Number(oPositionInput.value);

            if (sElementId && sTargetId) {
                var oMovedElement = oViewConfiguration.moveElement(sElementId, sTargetId, iPosition, bUpdate);
                if (bUpdate) HTMLFunctions.removeTableRow(oMovedElementsTable, { column: "Element ID", value: sElementId });
                oEvent.srcElement.dataset.update = false;

                if (!oMovedElement) {
                    HTMLFunctions.setInputErrorState(oElementIdInput, true, "Element has already been moved");
                    return;
                }

                var sMovedElementsTitle = `Moved Elements(${Object.keys(oViewConfiguration.getMovedElements()).length})`;
                HTMLFunctions.getElement("showMovedElementsTitle").innerText = sMovedElementsTitle;
                HTMLFunctions.getElement("hideMovedElementsTitle").innerText = sMovedElementsTitle;

                oElementIdInput.value = "";
                oTargetIdInput.value = "";
                HTMLFunctions.getElement("moveElements-positionInput").value = "";
                elementInputSection.input.disabled = false;

                HTMLFunctions.createTableRows(oMovedElementsTable, { sElementId: fCreatedMovedElementTableRow(sElementId, sTargetId, iPosition) });

            } else {
                if (!sElementId) HTMLFunctions.setInputErrorState(elementInputSection.input, true, "Element ID can't be empty");
                if (!sTargetId) HTMLFunctions.setInputErrorState(oTargetElementSection.input, true, "Target ID can't be empty");
            }
        };

        var oMoveElementButton = HTMLFunctions.createButton(undefined, "Move Element", fMoveElement);
        HTMLFunctions.addElementStyles(oMoveElementButton, { padding: "0.25rem 0rem" });

        HTMLFunctions.addElementStyles(oMoveElementButton, { "margin-top": "20px" });
        HTMLFunctions.addElementStyles(oMoveElementButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oMoveElementButton, oMoveElementButtonSection, 6);
        HTMLFunctions.addElementToContainer(oMoveElementButtonSection, oHideMovedElementsContainer);

        var oMovedElementsTable = HTMLFunctions.createTable(undefined, ["table", "striped"]);
        HTMLFunctions.createTableColumns(oMovedElementsTable, ["Element ID", "Target ID", "Position", "", ""]);

        var oMovedElementRows = {};

        for (var sKey in oMovedElements) {
            var oMovedElement = oMovedElements[sKey];
            oMovedElementRows[sKey] = fCreatedMovedElementTableRow(oMovedElement.id, oMovedElement.targetContainer, oMovedElement.position);
        }

        HTMLFunctions.createTableRows(oMovedElementsTable, oMovedElementRows);
        HTMLFunctions.addElementToContainer(oMovedElementsTable, oMovedElementsSection);
        HTMLFunctions.addElementToContainer(oMovedElementsTable, oHideMovedElementsContainer);

        HTMLFunctions.addElementToContainer(oShowMovedElementsContainer, oMovedElementsSection);
        HTMLFunctions.addElementToContainer(oHideMovedElementsContainer, oMovedElementsSection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideMovedElementsContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowMovedElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideMovedElementsContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowMovedElementsContainer, "display", "block");
        });

        return oMovedElementsSection;
    }

    createBasicViewConfigSection(oViewConfiguration) {
        var oViewPathContainer = HTMLFunctions.createElementFromHTML('<div class="box-section" style="display: flex"></div>');
        var viewConfigPathForm = HTMLFunctions.createElementFromHTML('<form class="border-bottom"></form>');

        var aBasicInfoElents = [];
        var sLabelStyle = `float: left; width:60%; margin-bottom: 10px`;
        var sInputStyle = `float: left; width:39%; margin-bottom: 10px`;

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Path:<label style="color: red">*</label></label>`));
        var oViewPathInput = HTMLFunctions.createElementFromHTML(`<input id="pathInput" style="${sInputStyle}" type="text" value="${oViewConfiguration.getPath()}" placeholder="e.g /posts" required><br><br>`);
        aBasicInfoElents.push(oViewPathInput);

        oViewPathInput.addEventListener("input", function () {
            HTMLFunctions.setInputErrorState(oViewPathInput, false);
        });

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Include subpaths:</label>`));
        var sCheckboxChecked = oViewConfiguration.areSubpathsIncluded() ? "checked" : "";
        var oIncludeSubpathsCheckbox = HTMLFunctions.createElementFromHTML(`<input style="margin-bottom: 10px" type="checkbox" ${sCheckboxChecked}><br><br>`);

        oIncludeSubpathsCheckbox.addEventListener("click", function (oEvent) {
            oViewConfiguration.setSubpathsIncluded(oEvent.srcElement.checked);
            oViewPathInput.value = oViewConfiguration.getPath();
        });
        aBasicInfoElents.push(oIncludeSubpathsCheckbox);

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">URL Parameters:</label>`));
        var oViewPathParameterInput = HTMLFunctions.createElementFromHTML(`<input id="searchParamInput" style="${sInputStyle}" type="text" value="${oViewConfiguration.getSearchParameters()}" placeholder="e.g ?tags=order:score"><br><br>`);
        aBasicInfoElents.push(oViewPathParameterInput);

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}"></label>`));
        var oUseCurrentParamsButton = HTMLFunctions.createElementFromHTML(`
            <a style="cursor: pointer; float: left; width: 39%; margin-botom: 10px">Use Current Parameters</a>
        `);
        oUseCurrentParamsButton.addEventListener("click", function () {
            oViewPathParameterInput.value = unescape(window.location.search);
        });

        aBasicInfoElents.push(oUseCurrentParamsButton);
        aBasicInfoElents.forEach(oElement => {
            HTMLFunctions.addElementToContainer(oElement, viewConfigPathForm);
        });

        HTMLFunctions.addElementToContainer(viewConfigPathForm, oViewPathContainer);

        return oViewPathContainer;
    }

    createModifyLinkDestination(oViewConfiguration) {
        var oModifiedLinkSection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oChangedLinks = oViewConfiguration.getChangedLinks();
        var iChangedLinkCount = Object.keys(oChangedLinks).length;

        var sChangedLinkTitle = `Changed Links(${iChangedLinkCount})`;
        var oShowChangedLinksContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showChangedLinksTitle">${sChangedLinkTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="changeLink-showButton" style="margin-left: 5px; cursor: pointer">show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowChangedLinksContainer);

        var oHideChangedLinksContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideChangedLinksTitle">${sChangedLinkTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="changeLink-hideSectionButton" style="margin-left: 5px; cursor: pointer">« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideChangedLinksContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oChangeLinkButtonSection = HTMLFunctions.createElementFromHTML(`
                <div style="margin-top: 10px; margin-left: 10px; margin-bottom: 10px;">
                    <div style="${sLabelStyles}">New Destination:<label style="color: red">*</label></div>
                    <input id="changeLink-destinationInput" type="text" style="width: 620px; margin-top: 5px; display: block" placeholder="e.g. /post_sets?commit=Search&search[creator_name]=S87gmil&search[order]=name">
                <div>
            `);

        var oElementInput = this.ElementSelection.crateHtmlElementSelectionInput("e.g. subnav-mine-link", undefined, true);
        HTMLFunctions.addElementToContainer(oElementInput.container, oChangeLinkButtonSection, 1);
        HTMLFunctions.addElementStyles(oElementInput.container, { "margin-top": "10px" });

        var fChangeLink = function () {
            var bUpdate = oChangeDestinationButton.dataset.update === "true";

            var oElementIdInput = oElementInput.input;
            var oDestinationInput = HTMLFunctions.getElement("changeLink-destinationInput");

            var fSelectorInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    HTMLFunctions.setInputErrorState(oSrcElement, true, "The ID can't contain spaces")
                } else {
                    HTMLFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            var fDestinationInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    HTMLFunctions.setInputErrorState(oSrcElement, true, "The destination can't contain spaces")
                } else {
                    HTMLFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            oElementIdInput.addEventListener("input", fSelectorInputHandler);
            oDestinationInput.addEventListener("input", fDestinationInputHandler);

            var sElementId = oElementIdInput.value;
            var sDestination = unescape(oDestinationInput.value);

            if (sElementId && sDestination) {
                if (!sDestination.startsWith("/")) {
                    HTMLFunctions.setInputErrorState("changeLink-destinationInput", true, "The destination has to start with '/'");
                    return;
                }

                var oChangedLink = oViewConfiguration.changeLinkDestination(sElementId, sDestination, bUpdate);
                if (bUpdate) HTMLFunctions.removeTableRow(oChangedLinksTable, { column: "Element ID", value: sElementId });
                oChangeDestinationButton.innerText = "Change Destination";
                oChangeDestinationButton.dataset.update = false;

                if (!oChangedLink) {
                    HTMLFunctions.setInputErrorState(oElementIdInput, true, "Link has already been changed");
                    return;
                }

                var sChangedLinkTitle = `Changed Links(${Object.keys(oViewConfiguration.getChangedLinks()).length})`;
                HTMLFunctions.getElement("showChangedLinksTitle").innerText = sChangedLinkTitle;
                HTMLFunctions.getElement("hideChangedLinksTitle").innerText = sChangedLinkTitle;

                oElementIdInput.value = "";
                oDestinationInput.value = "";

                HTMLFunctions.createTableRows(oChangedLinksTable, { sElementId: fCreateChangedLinkTableRow(sElementId, sDestination) });

            } else {
                if (!sElementId) HTMLFunctions.setInputErrorState(oElementInput.input, true, "Element ID can't be empty");
                if (!sDestination) HTMLFunctions.setInputErrorState("changeLink-destinationInput", true, "The destination can't be empty");
            }
        };

        var oChangeDestinationButton = HTMLFunctions.createButton(undefined, "Change Destination", fChangeLink);
        HTMLFunctions.addElementStyles(oChangeDestinationButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        HTMLFunctions.addElementStyles(oChangeLinkButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oChangeDestinationButton, oChangeLinkButtonSection, 5);
        HTMLFunctions.addElementToContainer(oChangeLinkButtonSection, oHideChangedLinksContainer);

        var fEditChangedLink = function (sElementId) {
            var oChangedLink = oViewConfiguration.getChangedLinks()[sElementId];

            oElementInput.input.value = oChangedLink.id;
            oElementInput.input.disabled = true;
            HTMLFunctions.getElement("changeLink-destinationInput").value = oChangedLink.destination;

            oChangeDestinationButton.innerText = "Save";
            oChangeDestinationButton.dataset.update = true;
        };

        var fCreateChangedLinkTableRow = function (sElementId, sNewDestination) {
            return {
                elementId: { index: 0, content: sElementId },
                newDestination: { index: 1, content: sNewDestination },
                removeButton: {
                    index: 2,
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.element_id;
                        oViewConfiguration.removeChangeLinkDestination(sId);
                        HTMLFunctions.removeTableRow(oChangedLinksTable, { column: "Element ID", value: sId });

                        var sChangedLinkTitle = `Changed Links(${Object.keys(oViewConfiguration.getChangedLinks()).length})`;
                        HTMLFunctions.getElement("showChangedLinksTitle").innerText = sChangedLinkTitle;
                        HTMLFunctions.getElement("hideChangedLinksTitle").innerText = sChangedLinkTitle;
                    }, { element_id: sElementId })
                },
                editButton: {
                    index: 3,
                    content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditChangedLink(oEvent.srcElement.dataset.element_id);
                    }, { element_id: sElementId })
                }
            };
        };

        var oChangedLinksTable = HTMLFunctions.createTable(undefined, ["table", "striped"]);
        HTMLFunctions.createTableColumns(oChangedLinksTable, ["Element ID", "Destination", "", ""]);

        var oChangedLinkRows = {};

        for (var sKey in oChangedLinks) {
            var oChangedLink = oChangedLinks[sKey];
            oChangedLinkRows[sKey] = fCreateChangedLinkTableRow(oChangedLink.id, oChangedLink.destination);
        }

        HTMLFunctions.createTableRows(oChangedLinksTable, oChangedLinkRows);
        HTMLFunctions.addElementToContainer(oChangedLinksTable, oModifiedLinkSection);
        HTMLFunctions.addElementToContainer(oChangedLinksTable, oHideChangedLinksContainer);

        HTMLFunctions.addElementToContainer(oShowChangedLinksContainer, oModifiedLinkSection);
        HTMLFunctions.addElementToContainer(oHideChangedLinksContainer, oModifiedLinkSection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowChangedLinksContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowChangedLinksContainer, "display", "block");
        });

        return oModifiedLinkSection;
    }

    createCreatedLinkSection(oViewConfiguration) {
        var oCreatedElementSection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oCreatedElements = oViewConfiguration.getCreatedLinks();
        var iCreatedElementCount = Object.keys(oCreatedElements).length;

        var sCreatedElementsTitle = `Created Links(${iCreatedElementCount})`;
        var oShowCreatedElementsContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showCreatedElementsTitle">${sCreatedElementsTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="createElement-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowCreatedElementsContainer);

        var oHideChangedLinksContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideCreatedElementsTitle">${sCreatedElementsTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="createElement-hideSectionButton" style="margin-left: 5px; cursor: pointer" >« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideChangedLinksContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var ocreateElementButtonSection = HTMLFunctions.createElementFromHTML(`
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

        var oTargetInput = this.ElementSelection.crateHtmlElementSelectionInput("e.g. image-extra-controls", "Target Container ID / XPath:", true);
        HTMLFunctions.addElementToContainer(oTargetInput.container, ocreateElementButtonSection, 4);
        HTMLFunctions.addElementStyles(oTargetInput.container, { "margin-top": "10px" });

        var oElementTypeSelection = HTMLFunctions.createElementFromHTML(`
            <select id="createElement-typeSelection" style="margin-top: 5px;">
                <option value="${oViewConfiguration.LINK_ELEMENT}">Link</option>
                <option value="${oViewConfiguration.BUTTON_ELEMENT}">Button</option>
            </select><br><br>`
        );
        HTMLFunctions.addElementToContainer(oElementTypeSelection, ocreateElementButtonSection, 17);

        var fTypeSelectionHandler = function () {
            if (HTMLFunctions.getElement("createElement-typeSelection").value === oViewConfiguration.BUTTON_ELEMENT) {
                HTMLFunctions.addElementStyles("createElement-colorSelectionSection", { display: "block" });
            } else {
                HTMLFunctions.hideElement("createElement-colorSelectionSection");
            }
        };
        oElementTypeSelection.addEventListener("change", fTypeSelectionHandler);

        var fCreateLink = function (oEvent) {
            var bUpdate = oEvent.srcElement.dataset.update === "true";

            var oElementIdInput = HTMLFunctions.getElement("createElement-elementIdInput");
            var oDestinationInput = HTMLFunctions.getElement("createElement-destination");
            var oColorPicker = HTMLFunctions.getElement("createElement-colorPicker");
            var oTypeSelector = oElementTypeSelection;
            var oOpenNewTabCheckbox = HTMLFunctions.getElement("createElement-openInNewTabCheckbox");
            var oTextInput = HTMLFunctions.getElement("createElement-linkTextInput");

            var fIdInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    HTMLFunctions.setInputErrorState(oSrcElement, true, "The ID can't contain spaces")
                } else {
                    HTMLFunctions.setInputErrorState(oSrcElement, false);
                }
            };

            var fDestinationInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                if (oSrcElement.value.includes(" ")) {
                    HTMLFunctions.setInputErrorState(oSrcElement, true, "The destination can't contain spaces")
                } else {
                    HTMLFunctions.setInputErrorState(oSrcElement, false);
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
                    HTMLFunctions.setInputErrorState("createElement-destination", true, "The destination has to start with '/'");
                    return;
                }

                var oCreatedElement = oViewConfiguration.createLink(sTargetId, sElementId, sLinkText, sDestination, sElemntType, sElemntType === oViewConfiguration.BUTTON_ELEMENT ? sBackgroundColor : undefined, bOpenNewTab, bUpdate);
                if (bUpdate) HTMLFunctions.removeTableRow(oCreatedElementsTable, { column: "Element ID", value: sElementId });
                oEvent.srcElement.innerText = "Create Link";
                oEvent.srcElement.dataset.update = false;

                if (!oCreatedElement) {
                    HTMLFunctions.setInputErrorState("createElement-elementIdInput", true, "Element has already been created");
                    return;
                }

                var sCreatedElementsTitle = `Created Links(${Object.keys(oViewConfiguration.getCreatedLinks()).length})`;
                HTMLFunctions.getElement("showCreatedElementsTitle").innerText = sCreatedElementsTitle;
                HTMLFunctions.getElement("hideCreatedElementsTitle").innerText = sCreatedElementsTitle;

                oElementIdInput.value = "";
                oElementIdInput.disabled = false;
                oTargetInput.input.value = "";
                oColorPicker.value = "#1f3c67";
                oDestinationInput.value = "";
                oTextInput.value = "";

                HTMLFunctions.createTableRows(oCreatedElementsTable, { sElementId: fCreateElementCrationTableRow(sElementId, sTargetId, sDestination, sElemntType) });

            } else {
                if (!sLinkText) HTMLFunctions.setInputErrorState("createElement-linkTextInput", true, "Text can't be empty")
                if (!sDestination) HTMLFunctions.setInputErrorState("createElement-destination", true, "Destination can't be empty");
                if (!sTargetId) HTMLFunctions.setInputErrorState(oTargetInput.input.input, true, "Target element ID can't be empty");
                if (!sElementId) HTMLFunctions.setInputErrorState("createElement-elementIdInput", true, "Element ID can't be empty");
            }
        };

        var oCreateElementButton = HTMLFunctions.createButton(undefined, "Create Link", fCreateLink);
        HTMLFunctions.addElementStyles(oCreateElementButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        HTMLFunctions.addElementStyles(ocreateElementButtonSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oCreateElementButton, ocreateElementButtonSection);
        HTMLFunctions.addElementToContainer(ocreateElementButtonSection, oHideChangedLinksContainer);

        var fEditCreatedLink = function (sElementId) {
            var oCreatedLink = oViewConfiguration.getCreatedLinks()[sElementId];

            var oElementIdInput = HTMLFunctions.getElement("createElement-elementIdInput");
            var oDestinationInput = HTMLFunctions.getElement("createElement-destination");
            var oColorPicker = HTMLFunctions.getElement("createElement-colorPicker");
            var oTypeSelector = oElementTypeSelection;
            var oOpenNewTabCheckbox = HTMLFunctions.getElement("createElement-openInNewTabCheckbox");
            var oTextInput = HTMLFunctions.getElement("createElement-linkTextInput");

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
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.element_id;

                        oViewConfiguration.removeCreatedLink(sId);

                        HTMLFunctions.removeTableRow(oCreatedElementsTable, { column: "Element ID", value: sId });

                        var sCreatedElementsTitle = `Created Links(${Object.keys(oViewConfiguration.getCreatedLinks()).length})`;
                        HTMLFunctions.getElement("showCreatedElementsTitle").innerText = sCreatedElementsTitle;
                        HTMLFunctions.getElement("hideCreatedElementsTitle").innerText = sCreatedElementsTitle;
                    }, { element_id: sElementId })
                },
                editButton: {
                    index: 5,
                    content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditCreatedLink(oEvent.srcElement.dataset.element_id);
                    }, { element_id: sElementId })
                }
            };
        };

        var oCreatedElementsTable = HTMLFunctions.createTable(undefined, ["table", "striped"]);
        HTMLFunctions.createTableColumns(oCreatedElementsTable, ["Element ID", "Target ID", "Destination", "Type", "", ""]);

        var oCreatedElementRows = {};

        for (var sKey in oCreatedElements) {
            var oCreatedElement = oCreatedElements[sKey];
            oCreatedElementRows[sKey] = fCreateElementCrationTableRow(oCreatedElement.id, oCreatedElement.targetContainer, oCreatedElement.type, oCreatedElement.destination);
        }

        HTMLFunctions.createTableRows(oCreatedElementsTable, oCreatedElementRows);
        HTMLFunctions.addElementToContainer(oCreatedElementsTable, oCreatedElementSection);
        HTMLFunctions.addElementToContainer(oCreatedElementsTable, oHideChangedLinksContainer);

        HTMLFunctions.addElementToContainer(oShowCreatedElementsContainer, oCreatedElementSection);
        HTMLFunctions.addElementToContainer(oHideChangedLinksContainer, oCreatedElementSection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowCreatedElementsContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideChangedLinksContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowCreatedElementsContainer, "display", "block");
        });

        return oCreatedElementSection;
    }

    createCustomAddToSetGroupSection(oViewConfiguration) {
        var oCustomAddToSetGroupSection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oCustomGroups = oViewConfiguration.getSetSelectionGroups();
        var iCustomGroupCount = Object.keys(oCustomGroups).length;

        var sCustomGroupsTitle = `Custom Set Selection Groups(${iCustomGroupCount})`;
        var oShowCustomGroupContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showSetSelectionGroupsTitle">${sCustomGroupsTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="customSetGroups-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowCustomGroupContainer);

        var oHideCustomGroupContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideSetSelectionGroupsTitle">${sCustomGroupsTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="customSetGroups-hideSectionButton" style="margin-left: 5px; cursor: pointer" >« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideCustomGroupContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oCustomGroupInputSection = HTMLFunctions.createElementFromHTML(`
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

            var oTitleInput = HTMLFunctions.getElement("customSetGroups-titleInput");
            oTitleInput.value = oSelectedGroup.title;
            oTitleInput.disabled = true;

            HTMLFunctions.getElement("customSetGroups-setSelectorInput").value = oSelectedGroup.setSelector;
            HTMLFunctions.getElement("customSetGroups-setsInput").value = oSelectedGroup.sets.join(", ");
            HTMLFunctions.getElement("customSetGroups-groupPositionInput").value = oSelectedGroup.position;

            var oCreateButton = HTMLFunctions.getElement("customSetGroups-createButton");
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
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.group_id;

                        oViewConfiguration.removeSetSelectionGroup(sId);

                        HTMLFunctions.removeTableRow(oCustomGroupsTable, { column: "Title", value: sId });

                        var sCustomGroupsTitle = `Custom Set Selection Groups(${Object.keys(oViewConfiguration.getSetSelectionGroups()).length})`;
                        HTMLFunctions.getElement("showSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;
                        HTMLFunctions.getElement("hideSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;
                    }, { group_id: sTitle.replace(/ /g, "") })
                },
                editButton: {
                    index: 5,
                    content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        var sId = oEvent.srcElement.dataset.group_id;
                        fEditCustomSetGroups(sId);
                    }, { group_id: sTitle.replace(/ /g, "") })
                }
            };
        };

        var fCreateCustomSetGroup = function (oEvent) {
            var oTitleInput = HTMLFunctions.getElement("customSetGroups-titleInput");
            var oSetSelectorInput = HTMLFunctions.getElement("customSetGroups-setSelectorInput");
            var oSetsInput = HTMLFunctions.getElement("customSetGroups-setsInput");
            var oGroupPositionInput = HTMLFunctions.getElement("customSetGroups-groupPositionInput");

            var fIdInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                HTMLFunctions.setInputErrorState(oSrcElement, false);
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
                    HTMLFunctions.setInputErrorState(oGroupPositionInput, true, "A group at this position already exists");
                    return;
                }

                var oCreatedGroup = oViewConfiguration.createSetSelectionGroup(sTitle, sSetSelector, aSets, iGroupPosition, bUpdateGroup);
                if (bUpdateGroup) HTMLFunctions.removeTableRow(oCustomGroupsTable, { column: "Title", value: oCreatedGroup.id });
                oEvent.srcElement.dataset.update_group = false;
                oEvent.srcElement.innerText = "Create Group";

                if (!oCreatedGroup) {
                    HTMLFunctions.setInputErrorState(oTitleInput, true, "Group has already been created");
                    return;
                }

                var sCustomGroupsTitle = `Custom Set Selection Groups(${Object.keys(oViewConfiguration.getSetSelectionGroups()).length})`;
                HTMLFunctions.getElement("showSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;
                HTMLFunctions.getElement("hideSetSelectionGroupsTitle").innerText = sCustomGroupsTitle;

                oTitleInput.value = "";
                oTitleInput.disabled = false;
                oSetSelectorInput.value = "";
                oSetsInput.value = "";
                oGroupPositionInput.value = "";

                HTMLFunctions.setInputErrorState(oTitleInput, false);
                HTMLFunctions.setInputErrorState(oSetSelectorInput, false);
                HTMLFunctions.setInputErrorState(oSetsInput, false);

                var oNewRow = {};
                oNewRow[sTitle.replace(/ /g, "")] = fCreateGroupTableRow(sTitle, sSetSelector, aSets.join(", "), iGroupPosition);

                HTMLFunctions.createTableRows(oCustomGroupsTable, oNewRow);

            } else {
                if (!sSetSelector && aSets.length === 0) {
                    if (!sSetSelector) HTMLFunctions.setInputErrorState(oSetSelectorInput, true, "At least one selection method has to be filed");
                    if (aSets.length === 0) HTMLFunctions.setInputErrorState(oSetsInput, true, "At least one selection method has to be filed");
                }

                if (!sTitle) HTMLFunctions.setInputErrorState(oTitleInput, true, "The title can't be empty");
            }
        };

        var oCreateGroupButton = HTMLFunctions.createButton("customSetGroups-createButton", "Create Group", fCreateCustomSetGroup);
        HTMLFunctions.addElementStyles(oCreateGroupButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        HTMLFunctions.addElementStyles(oCustomGroupInputSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oCreateGroupButton, oCustomGroupInputSection);
        HTMLFunctions.addElementToContainer(oCustomGroupInputSection, oHideCustomGroupContainer);

        var oCustomGroupsTable = HTMLFunctions.createTable(undefined, ["table", "striped"]);
        HTMLFunctions.createTableColumns(oCustomGroupsTable, ["Title", "Set Selector", "Sets", "Position", "", ""]);

        var oCreatedGroupRows = {};

        for (var sKey in oCustomGroups) {
            var oCreatedGroup = oCustomGroups[sKey];
            oCreatedGroupRows[sKey] = fCreateGroupTableRow(oCreatedGroup.title, oCreatedGroup.setSelector, oCreatedGroup.sets.join(", "), oCreatedGroup.position);
        }

        HTMLFunctions.createTableRows(oCustomGroupsTable, oCreatedGroupRows);
        HTMLFunctions.addElementToContainer(oCustomGroupsTable, oCustomAddToSetGroupSection);
        HTMLFunctions.addElementToContainer(oCustomGroupsTable, oHideCustomGroupContainer);

        HTMLFunctions.addElementToContainer(oShowCustomGroupContainer, oCustomAddToSetGroupSection);
        HTMLFunctions.addElementToContainer(oHideCustomGroupContainer, oCustomAddToSetGroupSection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideCustomGroupContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowCustomGroupContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideCustomGroupContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowCustomGroupContainer, "display", "block");
        });

        return oCustomAddToSetGroupSection;
    }

    createBasicViewConfigView(bCreationMode, oProfile, oViewConfiguration, aCustoMSections) {
        var oProfileConfigDialogContent = HTMLFunctions.getElement("viewConfig-content");
        if (oProfileConfigDialogContent) {
            oProfileConfigDialogContent.innerHTML = "";
        }

        var oViewConfigContainer = HTMLFunctions.createContainerWithTitle("viewConfiguration-container", "Configure View", "h2", { "margin-top": "10px", "width": "900px" });
        var oFooter = HTMLFunctions.createElementFromHTML(`<div></div>`);
        var oBackButton = HTMLFunctions.createButton("viewConfiguration-backButton", "Back", function () {
            var oPathInput = HTMLFunctions.getElement("pathInput");
            var sPath = oPathInput.value;

            var oParameterInput = HTMLFunctions.getElement("searchParamInput");
            var sParameters = oParameterInput.value;

            oViewConfiguration.setParameters(sParameters);
            if (sPath) {
                if (sPath.startsWith("/")) {
                    oViewConfiguration.setPath(sPath);
                } else {
                    HTMLFunctions.setInputErrorState(oPathInput, true, "The path has to begin with '/'");
                    return;
                }
            } else {
                HTMLFunctions.setInputErrorState(oPathInput, true, "The path can't be empty");
                return;
            }

            this.displayProfile(bCreationMode, oProfile)
        }.bind(this));

        HTMLFunctions.addElementToContainer(this.createBasicViewConfigSection(oViewConfiguration), oViewConfigContainer);
        HTMLFunctions.addElementToContainer(this.createHiddenElementSection(oViewConfiguration), oViewConfigContainer);
        HTMLFunctions.addElementToContainer(this.createModifiedElementSection(oViewConfiguration), oViewConfigContainer);
        HTMLFunctions.addElementToContainer(this.createMovedElementSection(oViewConfiguration), oViewConfigContainer);
        HTMLFunctions.addElementToContainer(this.createModifyLinkDestination(oViewConfiguration), oViewConfigContainer);
        HTMLFunctions.addElementToContainer(this.createCreatedLinkSection(oViewConfiguration), oViewConfigContainer);

        if (aCustoMSections) aCustoMSections.forEach(oCustomSection => {
            HTMLFunctions.addElementToContainer(oCustomSection, oViewConfigContainer);
        });

        HTMLFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
        HTMLFunctions.addElementStyles(oBackButton, { float: "left" });
        HTMLFunctions.addElementToContainer(oBackButton, oFooter);
        HTMLFunctions.addElementToContainer(oFooter, oViewConfigContainer);

        HTMLFunctions.addElementToContainer(oViewConfigContainer, oProfileConfigDialogContent);
        HTMLFunctions.recenterElement(document.getElementById("viewConfig-dialog"));
        return oViewConfigContainer;
    }

    createCustomSetTableSection(oViewConfiguration) {
        var oCustomSetTableSection = HTMLFunctions.createElementFromHTML(`<div class="box-section" style="margin-bottom: 10px"></div>`);

        var oCustomTables = oViewConfiguration.getCustomSetTables();
        var iCustomGroupCount = Object.keys(oCustomTables).length;

        var sCustomSetTablesTitle = `Custom Set Tables(${iCustomGroupCount})`;
        var oShowCustomSetTablesContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent"><label id="showCustomSetTableTitle">${sCustomSetTablesTitle}</label></div>`);
        var oShowButton = HTMLFunctions.createElementFromHTML(`<a id="customSetTables-showButton" style="margin-left: 5px; cursor: pointer" >show »</a>`);
        HTMLFunctions.addElementToContainer(oShowButton, oShowCustomSetTablesContainer);

        var oHideCustomSetTablesContainer = HTMLFunctions.createElementFromHTML(`<div class="notice notice-parent" style="display: none"><label id="hideCustomSetTableTitle">${sCustomSetTablesTitle}</label></div>`);
        var oHideButton = HTMLFunctions.createElementFromHTML(`<a id="customSetTables-hideSectionButton" style="margin-left: 5px; cursor: pointer" >« hide</a>`);
        HTMLFunctions.addElementToContainer(oHideButton, oHideCustomSetTablesContainer);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oCustomTableInputSection = HTMLFunctions.createElementFromHTML(`
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

            var oTitleInput = HTMLFunctions.getElement("customSetTables-titleInput");
            var oSetSelectorInput = HTMLFunctions.getElement("customSetTables-setSelectorInput");
            var oSetsInput = HTMLFunctions.getElement("customSetTables-setsInput");

            var fIdInputHandler = function (oEvent) {
                var oSrcElement = oEvent.srcElement;
                HTMLFunctions.setInputErrorState(oSrcElement, false);
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
                if (bUpdate) HTMLFunctions.removeTableRow(oCustomTablesTable, { column: "Title", value: sTitle });
                oEvent.srcElement.innerText = "Create Group";
                oEvent.srcElement.dataset.update = false;

                if (!oCreatedTable) {
                    HTMLFunctions.setInputErrorState(oTitleInput, true, "Table has already been created");
                    return;
                }

                var sCustomSetTablesTitle = `Custom Set Tables(${Object.keys(oViewConfiguration.getCustomSetTables()).length})`;
                HTMLFunctions.getElement("showCustomSetTableTitle").innerText = sCustomSetTablesTitle;
                HTMLFunctions.getElement("hideCustomSetTableTitle").innerText = sCustomSetTablesTitle;

                oTitleInput.value = "";
                oSetSelectorInput.value = "";
                oSetsInput.value = "";
                oTitleInput.disabled = false;

                HTMLFunctions.setInputErrorState(oTitleInput, false);
                HTMLFunctions.setInputErrorState(oSetSelectorInput, false);
                HTMLFunctions.setInputErrorState(oSetsInput, false);

                var oNewRow = {};
                oNewRow[sTitle.replace(/ /g, "")] = fCreateCustomTableRow(sTitle, sSetSelector, aSets.join(", "), undefined);

                HTMLFunctions.createTableRows(oCustomTablesTable, oNewRow);

            } else {
                if (!sSetSelector && aSets.length === 0) {
                    if (!sSetSelector) HTMLFunctions.setInputErrorState(oSetSelectorInput, true, "At least one selection method has to be filed");
                    if (aSets.length === 0) HTMLFunctions.setInputErrorState(oSetsInput, true, "At least one selection method has to be filed");
                }

                if (!sTitle) HTMLFunctions.setInputErrorState(oTitleInput, true, "The title can't be empty");
            }
        };

        var oCreateGroupButton = HTMLFunctions.createButton(undefined, "Create Group", fCreateCustomTable);
        HTMLFunctions.addElementStyles(oCreateGroupButton, { padding: "0.25rem 0rem", "margin-top": "20px" });

        HTMLFunctions.addElementStyles(oCustomTableInputSection, { "margin-top": "10px", "margin-bottom": "10px" });
        HTMLFunctions.addElementToContainer(oCreateGroupButton, oCustomTableInputSection);
        HTMLFunctions.addElementToContainer(oCustomTableInputSection, oHideCustomSetTablesContainer);

        var fEditCustomSetTables = function (sTableId) {
            var oCustomTabel = oViewConfiguration.getCustomSetTables()[sTableId.toLowerCase().replace(/ /g, "")];

            var oTitleInput = HTMLFunctions.getElement("customSetTables-titleInput");
            oTitleInput.value = oCustomTabel.title;
            oTitleInput.disabled = true;

            HTMLFunctions.getElement("customSetTables-setSelectorInput").value = oCustomTabel.setSelector;
            HTMLFunctions.getElement("customSetTables-setsInput").value = oCustomTabel.setNames.join(", ");

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
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        var sTitle = oEvent.srcElement.dataset.group_title;

                        oViewConfiguration.remvoeCustomSetTable(sTitle.toLowerCase().replace(/ /g, ""));
                        HTMLFunctions.removeTableRow(oCustomTablesTable, { column: "Title", value: sTitle });

                        var sCustomSetTablesTitle = `Custom Set Tables(${Object.keys(oViewConfiguration.getCustomSetTables()).length})`;
                        HTMLFunctions.getElement("showCustomSetTableTitle").innerText = sCustomSetTablesTitle;
                        HTMLFunctions.getElement("hideCustomSetTableTitle").innerText = sCustomSetTablesTitle;
                    }, { group_title: sTitle })
                },
                editButton: {
                    index: 4,
                    content: HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        fEditCustomSetTables(oEvent.srcElement.dataset.table_id);
                    }, { table_id: sTitle })
                }
            };
        };

        var oCustomTablesTable = HTMLFunctions.createTable(undefined, ["table", "striped"]);
        HTMLFunctions.createTableColumns(oCustomTablesTable, ["Title", "Set Selector", "Sets", "", ""]);

        var oCreatedTableRows = {};

        for (var sKey in oCustomTables) {
            var oCreatedTable = oCustomTables[sKey];
            oCreatedTableRows[sKey] = fCreateCustomTableRow(oCreatedTable.title, oCreatedTable.setSelector, oCreatedTable.setNames.join(", "), oCreatedTable.position);
        }

        HTMLFunctions.createTableRows(oCustomTablesTable, oCreatedTableRows);
        HTMLFunctions.addElementToContainer(oCustomTablesTable, oCustomSetTableSection);
        HTMLFunctions.addElementToContainer(oCustomTablesTable, oHideCustomSetTablesContainer);

        HTMLFunctions.addElementToContainer(oShowCustomSetTablesContainer, oCustomSetTableSection);
        HTMLFunctions.addElementToContainer(oHideCustomSetTablesContainer, oCustomSetTableSection);

        oShowButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideCustomSetTablesContainer, "display", "block");
            HTMLFunctions.addStyleToElement(oShowCustomSetTablesContainer, "display", "none");
        });

        oHideButton.addEventListener("click", function () {
            HTMLFunctions.addStyleToElement(oHideCustomSetTablesContainer, "display", "none");
            HTMLFunctions.addStyleToElement(oShowCustomSetTablesContainer, "display", "block");
        });

        return oCustomSetTableSection;
    }

    displayProfile(bCreationMode, oProfile) {
        var oProfileCreationView = HTMLFunctions.getElement("profileConfig-container");
        if (oProfileCreationView) {
            oProfileCreationView.parentElement.innerHTML = "";
        }

        if (bCreationMode) {
            oProfileCreationView = this.createProfileConfigurationView(true, oProfile);
        } else {
            oProfileCreationView = this.createProfileConfigurationView(false, oProfile);
        }

        this.displayConfigDialogSection("profileConfig-container");
        HTMLFunctions.recenterElement(document.getElementById("viewConfig-dialog"));
    }

    createPostViewConfigView(bCreationMode, oProfile, oViewConfig) {
        var oPostViewSettingsContainer = HTMLFunctions.createElementFromHTML(`<div><h4 style="margin: 15px 10px 5px">Post View Specific Settings</h4></div>`);
        HTMLFunctions.addElementToContainer(this.createCustomAddToSetGroupSection(oViewConfig), oPostViewSettingsContainer);
        this.createBasicViewConfigView(bCreationMode, oProfile, oViewConfig, [oPostViewSettingsContainer]);
    }

    createSetVewConfigView(bCreationMode, oProfile, oViewConfig) {
        var oSetsViewSettingsContainer = HTMLFunctions.createElementFromHTML(`<div><h4 style="margin: 15px 10px 5px">Set View Specific Settings</h4></div>`);
        HTMLFunctions.addElementToContainer(this.createCustomSetTableSection(oViewConfig), oSetsViewSettingsContainer);
        this.createBasicViewConfigView(bCreationMode, oProfile, oViewConfig, [oSetsViewSettingsContainer]);
    }

    displayPostViewConfiguration(bCreationMode, oProfile, oViewConfig) {
        this.createPostViewConfigView(bCreationMode, oProfile, oViewConfig);
        this.displayConfigDialogSection("viewConfiguration-container");
    }

    displaySetViewConfiguration(bCreationMode, oProfile, oViewConfig) {
        this.createSetVewConfigView(bCreationMode, oProfile, oViewConfig);
        this.displayConfigDialogSection("viewConfiguration-container");
    }

    displayBasicViewConfiguration(bCreationMode, oProfile, oViewConfig) {
        this.createBasicViewConfigView(bCreationMode, oProfile, oViewConfig);
        this.displayConfigDialogSection("viewConfiguration-container");
    }

    onCreateViewConfig(bCreationMode, oProfile, sPath) {
        var sId = oProfile.createPathId(sPath);
        var oViewConfig = oProfile.createViewConfiguration(sId, sPath);

        switch (oViewConfig.getViewId()) {
            case PostViewConfiguration.postViewId:
                this.displayPostViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            case SetsViewConfiguration.setViewId:
                this.displaySetViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
            default:
                this.displayBasicViewConfiguration(bCreationMode, oProfile, oViewConfig);
                break;
        }
    }

    createProfileConfigurationView(bCreationMode, oProfile) {
        if (bCreationMode) {
            {
                if (!oProfile) oProfile = new Profile();
            }
        }

        var oProfileCreationContainer = HTMLFunctions.createContainerWithTitle("profileConfig-container", bCreationMode ? "Create New Profile" : "Edit Profile '" + oProfile.name + "'", "h2", { "margin-top": "10px" });
        var oProfileSelectionContainer = HTMLFunctions.getElement("viewConfig-content");

        HTMLFunctions.addElementToContainer(oProfileCreationContainer, oProfileSelectionContainer);

        HTMLFunctions.addElementToContainer(this.createBasicInfoForm(bCreationMode, oProfile), oProfileCreationContainer);
        HTMLFunctions.addElementToContainer(this.createViewConfigurationTable(bCreationMode, oProfile), oProfileCreationContainer);

        var oFooter = HTMLFunctions.createElementFromHTML(`<div></div>`);
        HTMLFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
        var oBackButton = HTMLFunctions.createButton(undefined, "Cancel", this.displayProfileSelection.bind(this));

        var sCreateButtonText = bCreationMode ? oProfile.isActive() ? "Create (Reload)" : "Create Profile" : oProfile.isActive() ? "Save (Reload)" : "Save";
        var oCreateProfileButton = HTMLFunctions.createButton(undefined, sCreateButtonText, function () { this.onSaveProfile(bCreationMode, oProfile) }.bind(this));

        HTMLFunctions.addElementStyles(oBackButton, { float: "left" });
        HTMLFunctions.addElementStyles(oCreateProfileButton, { float: "right" });
        HTMLFunctions.addElementToContainer(oBackButton, oFooter);
        HTMLFunctions.addElementToContainer(oCreateProfileButton, oFooter);
        HTMLFunctions.addElementToContainer(oFooter, oProfileCreationContainer);

        return oProfileCreationContainer;
    }

    onSaveProfile(bCreationMode, oProfile) {
        var sId;
        var oNameInput = HTMLFunctions.getElement("profileNameInput");
        var oDescriptionInput = HTMLFunctions.getElement("profileDescriptionInput");

        if (bCreationMode) {
            var oIdInput = HTMLFunctions.getElement("profileIdInput");
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

            this.displayProfileSelection();

            if (oProfile.isActive()) {
                console.log("Reloading page to use profile: " + sId);
                location.reload();
            }

        } else {
            if (!sName) HTMLFunctions.setInputErrorState("profileNameInput", true, "Name can't be empty");
            if (!sId) HTMLFunctions.setInputErrorState("profileIdInput", true, "ID can't be empty");
        }
    }

    createProfileSelection() {
        var oTableContainer = HTMLFunctions.createContainerWithTitle("profileTable-container", "Created Profiles");
        var oprofileTable = HTMLFunctions.createTable("profileTable", ["table", "striped"]);

        HTMLFunctions.addElementToContainer(oprofileTable, oTableContainer);
        HTMLFunctions.createTableColumns(oprofileTable, ["Name", "Description", "Paths", "Active", "", ""]);

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
                    content: oProfile.isEditable() ? HTMLFunctions.createButton(undefined, "Edit", function (oEvent) {
                        this.onEditProfile(oEvent.srcElement.dataset.profile_id)
                    }.bind(this), { profile_id: oProfile.getId() }) : ""
                },
                useButton: {
                    index: 5,
                    content: !oProfile.isActive() ? HTMLFunctions.createButton(undefined, "Use", function (oEvent) {
                        this.onUseProfile(oEvent.srcElement.dataset.profile_id)
                    }.bind(this), { profile_id: oProfile.getId() }) : ""
                }
            }
        };

        HTMLFunctions.createTableRows(oprofileTable, oTableRows);
        var oProfileSelectionContainer = HTMLFunctions.getElement("viewConfig-content");
        HTMLFunctions.addElementToContainer(oTableContainer, oProfileSelectionContainer);

        var oFooter = HTMLFunctions.createElementFromHTML(`<div></div>`);
        var ocreateProfileButton = HTMLFunctions.createButton(undefined, "Create Profile", function () { this.displayProfile(true) }.bind(this));
        HTMLFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });

        var oImportProfileButton = HTMLFunctions.createButton(undefined, "Import Profile", this.onImportProfile.bind(this));
        HTMLFunctions.addElementStyles(oImportProfileButton, { float: "right" });

        HTMLFunctions.addElementToContainer(oImportProfileButton, oFooter);
        HTMLFunctions.addElementToContainer(ocreateProfileButton, oFooter);
        HTMLFunctions.addElementToContainer(oFooter, oTableContainer);
    }

    onImportProfile() {
        var oImportDialog = HTMLFunctions.createDialog("importDialog", "Import Profile", true);
        var oCancelExportButton = HTMLFunctions.createButton(undefined, "Cancel", function () { HTMLFunctions.hideElement(oImportDialog.dialog) });
        var oFileUploader = HTMLFunctions.createElementFromHTML("<input type='file' accept='.json' style='margin-top: 15px; display: block'/>");
        var oProgressBar = HTMLFunctions.createElementFromHTML(`<progress max="100" value="0" style="width: 100%; margin-top: 15px">0%</progress>`);


        oFileUploader.addEventListener("change", function (oEvent) {
            var oUploadedProfile = oEvent.srcElement.files[0];
            this.loadFile(oUploadedProfile, oProgressBar).then(sImportedProfile => {
                var oImportButton = HTMLFunctions.createButton(undefined, "Import", function () { this.importProfile(sImportedProfile, oImportDialog.dialog) }.bind(this));

                HTMLFunctions.addElementStyles(oImportButton, { float: "right" });
                HTMLFunctions.addElementToContainer(oImportButton, oImportDialog.footer);
            });
        }.bind(this));

        HTMLFunctions.addElementToContainer(oFileUploader, oImportDialog.content);
        HTMLFunctions.addElementToContainer(oProgressBar, oImportDialog.content);
        HTMLFunctions.addElementToContainer(oCancelExportButton, oImportDialog.footer);
    }

    importProfile(sProfileJson, oDialog) {
        var oProfileConfig = JSON.parse(sProfileJson);
        var oImportedProfile = new Profile(oProfileConfig.id).parseProfile(oProfileConfig);
        ProfileStorage.saveProfile(oImportedProfile);
        this.reloadProfiles();
        this.displayProfileSelection();
        HTMLFunctions.hideElement(oDialog);
    }

    loadFile(oUploadedProfile, oProgressBar) {
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

    onEditProfile(sProfileId) {
        this.displayProfile(false, ProfileStorage.loadProfile(sProfileId));
    }

    onUseProfile(sProfileId) {
        ProfileStorage.setProfileActive(ProfileStorage.loadProfile(sProfileId), true);
        console.log("Reloading page to use profile: " + sProfileId);
        location.reload();
    }

    displayProfileSelection() {
        this.reloadProfiles();
        var oConfigPage = HTMLFunctions.getElement("profileTable-container");

        if (oConfigPage) {
            HTMLFunctions.addStyleToElement(oConfigPage, "display", "block");
        } else {
            this.createProfileSelection();
        }
        this.displayConfigDialogSection("profileTable-container");
        HTMLFunctions.recenterElement(document.getElementById("viewConfig-dialog"));
    }

    displayConfigDialogSection(sSectionId) {
        HTMLFunctions.convertHtmlCollectionToArray(HTMLFunctions.getElement("viewConfig-content").childNodes).forEach(oElement => {
            var sDisplayValue = oElement.id === sSectionId ? "block" : "none";
            HTMLFunctions.addStyleToElement(oElement, "display", sDisplayValue);
        });
    }

    createConfigurationForm() {
        var oConfigDialog = HTMLFunctions.createDialog("viewConfig", "Profile Configuration", false, true).dialog;
        HTMLFunctions.addElementToContainer(oConfigDialog, document.body);

        HTMLFunctions.getElement("viewConfig-closeButton").addEventListener("click", this.closeProfileConfiguration);

        return oConfigDialog;
    }

    configButtonPressed() {
        var oConfigDialog = document.getElementById("viewConfig-dialog");
        if (oConfigDialog) {
            if (oConfigDialog.style.display === "none") {
                oConfigDialog.style.display = "block";
            }
        } else {
            oConfigDialog = this.createConfigurationForm();
        }

        this.displayProfileSelection();
        HTMLFunctions.recenterElement(oConfigDialog);
    }

    closeProfileConfiguration() {
        HTMLFunctions.hideElement("viewConfig-dialog");
    }

    addButtonToMainToolbar() {
        var oNavBar = document.getElementById("nav");
        if (oNavBar) {
            var oMainToolbar = HTMLFunctions.convertHtmlCollectionToArray(oNavBar.childNodes).filter(oElement => { return oElement.tagName === "MENU" })[0];
            var oSettingsButton = HTMLFunctions.createElementFromHTML(`<li id="viewConfig" style="float: right;"><a id="viewConfigButton" style="cursor: pointer" >Configure View</a></li>`);

            HTMLFunctions.addElementToContainer(oSettingsButton, oMainToolbar);
            HTMLFunctions.getElement("viewConfigButton").onclick = this.configButtonPressed.bind(this);
        }
    }

    createDefaultProfiles() {
        console.log("Generating the default profiles ...");

        var oE621Layout = this.createNewProfile("e621Profile", "E621", "Default layout of e621", false, {}, false, false);
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

        var oDefaultConfig = this.createNewProfile("s87Tweeks", "S87 Tweeks", "S87's Profile", false, oViewConfigs, false, true);
        ProfileStorage.saveProfile(oDefaultConfig, true);

        return oDefaultConfig;
    }

    configureView(oProfile) {
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
            if (URLFunctions.doesCurrentUrlMatch(sViewConfigPath, sConfigUrlParameters)) {
                switch (oViewConfiguration.view) {
                    case PostViewConfiguration.postViewId:
                        console.log("Using 'PostsViewParser' to parse view config for path: " + oViewConfiguration.path + sParametersLogMessage);
                        new PostsViewParser().performUiChanges(oViewConfiguration);
                        break;
                    case SetsViewConfiguration.setViewId:
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

    initializeE621Configurator(oElementSelection) {
        var oActiveProfile;
        var oCreatedConfigs = ProfileStorage.loadCreatedProfiles();

        this.addButtonToMainToolbar();

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
            oActiveProfile = this.createDefaultProfiles();
        }
        if (oActiveProfile) {
            console.log("Using profile: " + oActiveProfile.getName());
            this.configureView(oActiveProfile);
        }
    }
}