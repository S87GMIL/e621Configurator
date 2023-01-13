class E621Configurator {
    
    static version = 2.4;

    constructor(oElementSelection) {
        this.ElementSelection = new ElementSelection();
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

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">ID:<label style="color: red">*</label></label>`));
        var oIdInput = HTMLFunctions.createElementFromHTML(`<input id="profileIdInput" style="${sInputStyle}" type="text" value="${oProfile.id || ''}"><br><br>`);
        aBasicInfoElents.push(oIdInput);
        oIdInput.disabled = !bCreationMode;

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Name:<label style="color: red">*</label></label><br>`));
        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileNameInput" style="${sInputStyle}" type="text" value="${oProfile.name || ''}"><br><br>`));

        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Description:</label><br>`));
        aBasicInfoElents.push(HTMLFunctions.createElementFromHTML(`<input id="profileDescriptionInput" style="${sInputStyle}" type="text" value="${oProfile.description || ''}"><br><br>`));

        if (!bCreationMode && oProfile.isDeletable()) {
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

        if (!bCreationMode && oProfile.isEditable()) {
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

        aBasicInfoElents.forEach(oElement => {
            HTMLFunctions.addElementToContainer(oElement, oBasicInfoForm);
        });

        HTMLFunctions.addElementToContainer(oBasicInfoForm, oBasicInfoContainer);

        return oBasicInfoContainer;
    }

    createSetSuggestionSection(oProfile) {
        var suggestSetContainer = HTMLFunctions.createElementFromHTML('<div class="box-section" style="display: flex"></div>');
        var suggestSetForm = HTMLFunctions.createElementFromHTML('<form class="border-bottom"></form>');

        var sLabelStyle = `float: left; width:60%; margin-bottom: 10px`;
        var sInputStyle = `float: left; width:39%; margin-bottom: 10px`;

        let label = HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}" style="width: 120px !important;">Suggest Sets:</label><br><br>`);
        let checkbox = HTMLFunctions.createElementFromHTML(`<input id="suggestSetsCheckbox" style="float: left; width: auto;" type="checkbox" checked="${oProfile.getSuggestSets()}"/><br><br>`);

        HTMLFunctions.addElementToContainer(label, suggestSetForm);
        HTMLFunctions.addElementToContainer(checkbox, suggestSetForm);

        label = HTMLFunctions.createElementFromHTML(`<label style="${sLabelStyle}">Username:</label>`);
        let usernameInput = HTMLFunctions.createElementFromHTML(`<input id="usernameInput" style="${sInputStyle}" type="text" value="${oProfile.getUsername()}" /><br><br>`);

        HTMLFunctions.addElementToContainer(label, suggestSetForm);
        HTMLFunctions.addElementToContainer(usernameInput, suggestSetForm);

        HTMLFunctions.addElementToContainer(suggestSetForm, suggestSetContainer);

        return suggestSetContainer;
    }

    createViewConfigurationTable(bCreationMode, oProfile) {
        var oTableContainer = HTMLFunctions.createContainerWithTitle("viewConfig-container", "View Configurations", "h3", { "margin-top": "5px", "margin-bottom": "20px" });
        var oCreateSection = HTMLFunctions.createElementFromHTML(`<div style="padding-left: .25rem; margin-top: 10px; margin-bottom: 10px"></div>`);
        var oPathInput = HTMLFunctions.createElementFromHTML(`<input id="configCreationPathInput" type="text" style="width: 110px" placeholder="e.g. /posts">`);

        oPathInput.addEventListener("input", function () {
            HTMLFunctions.setInputErrorState(oPathInput, false);
        });

        var oUseCurrentPathButton = HTMLFunctions.createElementFromHTML(`<a style="cursor: pointer; margin-left: 10px">User Current Path</a>`);
        oUseCurrentPathButton.addEventListener("click", function () {
            oPathInput.value = window.location.pathname;
        });

        var oCreateConfigButton = HTMLFunctions.createButton("viewConfig-creationButton", "Create", function () {
            if (bCreationMode) oProfile.setId(HTMLFunctions.getElement("profileIdInput").value);
            oProfile.setName(HTMLFunctions.getElement("profileNameInput").value);
            oProfile.setDescription(HTMLFunctions.getElement("profileDescriptionInput").value);

            var sPath = oPathInput.value;
            if (sPath) {
                HTMLFunctions.setInputErrorState(oPathInput, false);
                this.onCreateViewConfig(bCreationMode, oProfile, sPath)
            } else {
                HTMLFunctions.setInputErrorState(oPathInput, true, "Enter a path");
            }
        }.bind(this));
        var oCreateButtonCotnainer = HTMLFunctions.createElementFromHTML(`<div style="display: block"></div>`);

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

        aSortedConfigs.forEach(oViewConfig => {
            var sViewName = oViewConfig.getViewId().substring(0, 1).toUpperCase() + oViewConfig.getViewId().substring(1);

            oTableRows[oViewConfig.getId()] = {
                view: {
                    index: 0,
                    content: sViewName
                },
                path: {
                    index: 1,
                    content: oViewConfig.getPath()
                },
                parameters: {
                    index: 2,
                    content: oViewConfig.getSearchParameters() || ""
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

        var sSectionName = "Hidden Elements";
        var aHiddenElements = oViewConfiguration.getHiddenElements();
        var oHiddenElementSection = new ConfigurationSection(sSectionName, aHiddenElements.length, ["Element ID", ""]);

        var fCreateTableRow = function (sId) {
            return {
                elementId: { index: 0, content: sId },
                removeButton: {
                    index: 1,
                    content: HTMLFunctions.createButton(undefined, "Remove", function (oEvent) {
                        oViewConfiguration.removeHiddenElement(oEvent.srcElement.dataset.element_id);
                        HTMLFunctions.removeTableRow(oHiddenElementSection.table, { column: "Element ID", value: sId });

                        var sHiddenElementsTitle = `${sSectionName}(${oViewConfiguration.getHiddenElements().length})`;
                        oHiddenElementSection.setTitle(sHiddenElementsTitle);
                    }, { element_id: sId })
                }
            };
        };

        var oHiddenElementRows = {};
        aHiddenElements.forEach(sHiddenElementId => {
            oHiddenElementRows[sHiddenElementId] = fCreateTableRow(sHiddenElementId);
        });

        oHiddenElementSection.addTableRows(oHiddenElementRows);

        var oInputSection = HTMLFunctions.createElementFromHTML("<div></div>");
        var oElementInput = this.ElementSelection.crateHtmlElementSelectionInput("e.g. image-resize-selector", undefined, true);

        var oHideElementButton = HTMLFunctions.createButton(undefined, "Hide Element", function () {
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


                var sHiddenElementsTitle = `${sSectionName}(${oViewConfiguration.getHiddenElements().length})`;
                oHiddenElementSection.setTitle(sHiddenElementsTitle);

                oInput.value = "";
                var oCreatedElementRow = {};
                oCreatedElementRow[sId] = fCreateTableRow(sId);
                oHiddenElementSection.addTableRows(oCreatedElementRow);
            } else {
                HTMLFunctions.setInputErrorState(oElementInput.input, true, "Element ID can't be empty");
            }
        });

        HTMLFunctions.addElementStyles(oHideElementButton, { "padding": "0.25rem 0rem", "margin-top": "15px" });
        HTMLFunctions.addElementToContainer(oElementInput.container, oInputSection);
        HTMLFunctions.addElementToContainer(oHideElementButton, oInputSection);

        oHiddenElementSection.addInputs(oInputSection);

        return oHiddenElementSection.container;
    }

    createModifiedElementSection(oViewConfiguration) {

        var sSectionName = "Modified Elements";
        var oModifiedElements = {
            ...oViewConfiguration.getStyleModifiedElements(), ...oViewConfiguration.getClassModifiedElements()
        };
        var iModifiedElementCount = Object.keys(oModifiedElements).length;

        var oModifiedElementSection = new ConfigurationSection(sSectionName, iModifiedElementCount, ["Element ID", "Element Class", "Operation", "Values", "", ""]);

        var oModifyElementInputSection = HTMLFunctions.createElementFromHTML(`
            <div>
                Select by class
                <br>
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

        var oClassSelectorCheckbox = HTMLFunctions.createElementFromHTML('<input id="modifyElements-classSlectorCheckbox" type="checkbox" style="margin-left: 10px">');
        HTMLFunctions.addElementToContainer(oClassSelectorCheckbox, oModifyElementInputSection, 1);

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
        HTMLFunctions.addElementToContainer(oOperationSelection, oModifyElementInputSection, 9);

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

        HTMLFunctions.addElementToContainer(HTMLFunctions.createElementFromHTML("<br>"), oModifyElementInputSection, 2);

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

        var fClearInputFields = function () {
            var oStylesInput = HTMLFunctions.getElement("modifyElements-stylesInput");
            var oClassesInput = HTMLFunctions.getElement("modifyElements-classesInput");

            oIdSelectorSection.input.value = "";
            oClassInput.input.value = "";
            oStylesInput.value = "";
            oClassesInput.value = "";

            HTMLFunctions.setInputErrorState(oIdSelectorSection.input, false);
            HTMLFunctions.setInputErrorState(oClassInput.input, false);
            HTMLFunctions.setInputErrorState(oStylesInput, false);
            HTMLFunctions.setInputErrorState(oClassesInput, false);

            oIdSelectorSection.input.disabled = false;
            oClassInput.input.disabled = false;
            oOperationSelection.disabled = false;
            oClassSelectorCheckbox.disabled = false;
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

        var fCreateModifyTableEntry = function (oModifiedElement) {
            var sContent = "";
            if (oModifiedElement.operation === oViewConfiguration.MODIFY_STYLE_OPERATION && oModifiedElement.styles) {
                sContent = JSON.stringify(oModifiedElement.styles).replace(/[{}]/g, "");
            } else if (oModifiedElement.operation === oViewConfiguration.MODIFY_CLASS_OPERATION && oModifiedElement.classes) {
                sContent = oModifiedElement.classes.join(", ");
            }

            oModifiedElementSection.addTableRows({
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

                            iModifiedElementCount -= 1;
                            HTMLFunctions.removeTableRow(oModifiedElementSection.table, { columns: [{ column: bUseClassSelector ? "Element Class" : "Element ID", value: bUseClassSelector ? sElementClass : sElementId }] });

                            var sHiddenElementsTitle = `Modified Elements(${iModifiedElementCount})`;
                            oModifiedElementSection.setTitle(sHiddenElementsTitle);
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
            var bUseClassSelector = oClassSelectorCheckbox.checked;

            var sIdSelector = oIdSelectorSection.input.value;
            var sClassSelector = oClassInput.input.value;
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

            var oModification;
            var sModifyFunction;
            if (sOperation === oViewConfiguration.MODIFY_STYLE_OPERATION) {
                sModifyFunction = "modifyElementStyle";
                try {
                    if (!sRawStyles) {
                        HTMLFunctions.setInputErrorState("modifyElements-stylesInput", true, "No styles defined");
                        return;
                    }
                    oModification = JSON.parse(`{ ${sRawStyles} }`);
                } catch (oError) {
                    HTMLFunctions.setInputErrorState("modifyElements-stylesInput", true, "Invalid style entry");
                    return;
                }
            } else {
                sModifyFunction = "modifyElementClass";
                if (!sRawClassInput) {
                    HTMLFunctions.setInputErrorState("modifyElements-classesInput", true, "No classes defined");
                    return;
                }
                oModification = sRawClassInput.replace(/ /g, "").split(",");
            }

            var oModifyEntry = oViewConfiguration[sModifyFunction](sIdSelector, sClassSelector, oModification, bUpdate);
            iModifiedElementCount += 1;

            if (bUpdate) {
                iModifiedElementCount -= 1;

                HTMLFunctions.removeTableRow(
                    oModifiedElementSection.table,
                    {
                        columns: [
                            {
                                column: oModifyEntry.class ? "Element Class" : "Element ID",
                                value: oModifyEntry.class ? oModifyEntry.class : oModifyEntry.id
                            },
                            {
                                column: "Operation", value: sOperation
                            }
                        ]
                    });
            }
            oModifyButton.innerText = "Modify Element";
            oModifyButton.dataset.update = false;

            if (!oModifyEntry) {
                var sMessage = "Element has already been modified";
                var oInput = bUseClassSelector ? oClassInput.input : oIdSelectorSection.input;
                HTMLFunctions.setInputErrorState(oInput, true, sMessage);
                return;
            }

            oModifiedElementSection.setTitle(`Modified Elements(${iModifiedElementCount})`);

            fCreateModifyTableEntry(oModifyEntry);
            fClearInputFields();
        };

        var oModifyElementButton = HTMLFunctions.createButton("modifyElements-modifyButton", "Modify Element", fModifyElement);
        HTMLFunctions.addElementStyles(oModifyElementButton, { "padding": "0.25rem 0rem", "margin-top": "20px" });
        HTMLFunctions.addElementToContainer(oModifyElementButton, oModifyElementInputSection);

        oModifiedElementSection.addInputs(oModifyElementInputSection);

        var oModifiedElementRows = {};
        for (var sKey in oModifiedElements) {
            var oModifiedElement = oModifiedElements[sKey];

            fCreateModifyTableEntry(oModifiedElement);
        };

        oModifiedElementSection.addTableRows(oModifiedElementRows);

        return oModifiedElementSection.container;
    }

    createMovedElementSection(oViewConfiguration) {

        var sSectionName = "Moved Elements";
        var oMovedElements = oViewConfiguration.getMovedElements();
        var iMovedElementCount = Object.keys(oMovedElements).length;

        var oModifiedElementSection = new ConfigurationSection(sSectionName, iMovedElementCount, ["Element ID", "Target ID", "Position", "", ""]);

        var elementInputSection = this.ElementSelection.crateHtmlElementSelectionInput("e.g. add-to-set", undefined, true);

        var oMoveElementButtonSection = HTMLFunctions.createElementFromHTML(`
            <div>
                <div style="margin-top: 10px; display: block">Position:</div>
                <input id="moveElements-positionInput" type="number" min="0" style="width: 60px; margin-top: 5px; display: block" placeholder="e.g. 0">
            <div>
        `);

        HTMLFunctions.addElementToContainer(elementInputSection.container, oMoveElementButtonSection, 1);
        HTMLFunctions.addElementStyles(elementInputSection.container, { "margin-top": "10px" });

        var oTargetElementSection = this.ElementSelection.crateHtmlElementSelectionInput("e.g. image-extra-controls", "Target Container ID / XPath:", true);
        HTMLFunctions.addElementToContainer(oTargetElementSection.container, oMoveElementButtonSection, 2);
        HTMLFunctions.addElementStyles(oTargetElementSection.container, { "margin-top": "10px" });

        var fEditMovedElements = function (sElementId) {
            var oMovedElement = oViewConfiguration.getMovedElements()[sElementId];

            elementInputSection.input.value = oMovedElement.id;
            elementInputSection.input.disabled = true;
            oTargetElementSection.input.value = oMovedElement.targetContainer;

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
                        HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Element ID", value: sId });

                        iMovedElementCount -= 1;
                        oModifiedElementSection.setTitle(`Moved Elements(${iMovedElementCount})`);
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
                if (sElementId === sTargetId) {
                    HTMLFunctions.setInputErrorState(oTargetElementSection.input, true, "The target can't be equal to the moved element");
                    return;
                }
                iMovedElementCount += 1;
                var oMovedElement = oViewConfiguration.moveElement(sElementId, sTargetId, iPosition, bUpdate);

                if (bUpdate) {
                    iMovedElementCount -= 1;
                    HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Element ID", value: sElementId });
                }
                oEvent.srcElement.dataset.update = false;

                if (!oMovedElement) {
                    HTMLFunctions.setInputErrorState(oElementIdInput, true, "Element has already been moved");
                    return;
                }

                oModifiedElementSection.setTitle(`Moved Elements(${iMovedElementCount})`);

                oElementIdInput.value = "";
                oTargetIdInput.value = "";
                HTMLFunctions.getElement("moveElements-positionInput").value = "";
                elementInputSection.input.disabled = false;

                HTMLFunctions.createTableRows(oModifiedElementSection.table, { sElementId: fCreatedMovedElementTableRow(sElementId, sTargetId, iPosition) });

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

        oModifiedElementSection.addInputs(oMoveElementButtonSection);

        var oMovedElementRows = {};
        for (var sKey in oMovedElements) {
            var oMovedElement = oMovedElements[sKey];
            oMovedElementRows[sKey] = fCreatedMovedElementTableRow(oMovedElement.id, oMovedElement.targetContainer, oMovedElement.position);
        }

        oModifiedElementSection.addTableRows(oMovedElementRows);

        return oModifiedElementSection.container;
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
        var oChangedLinks = oViewConfiguration.getChangedLinks();
        var iChangedLinkCount = Object.keys(oChangedLinks).length;

        var oModifiedElementSection = new ConfigurationSection("Changed Links", iChangedLinkCount, ["Element ID", "Destination", "", ""]);

        var oChangeLinkButtonSection = HTMLFunctions.createElementFromHTML(`
                <div">
                    <div style="margin-top: 10px; display: block">New Destination:<label style="color: red">*</label></div>
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
                if (bUpdate) {
                    iChangedLinkCount -= 1;
                    HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Element ID", value: sElementId });
                }
                oChangeDestinationButton.innerText = "Change Destination";
                oChangeDestinationButton.dataset.update = false;

                if (!oChangedLink) {
                    HTMLFunctions.setInputErrorState(oElementIdInput, true, "Link has already been changed");
                    return;
                }

                iChangedLinkCount += 1;
                oModifiedElementSection.setTitle(`Changed Links(${iChangedLinkCount})`);

                oElementIdInput.value = "";
                oDestinationInput.value = "";
                HTMLFunctions.setInputErrorState(oElementIdInput, false);

                HTMLFunctions.createTableRows(oModifiedElementSection.table, { sElementId: fCreateChangedLinkTableRow(sElementId, sDestination) });

            } else {
                if (!sElementId) HTMLFunctions.setInputErrorState(oElementInput.input, true, "Element ID can't be empty");
                if (!sDestination) HTMLFunctions.setInputErrorState("changeLink-destinationInput", true, "The destination can't be empty");
            }
        };

        var oChangeDestinationButton = HTMLFunctions.createButton(undefined, "Change Destination", fChangeLink);
        HTMLFunctions.addElementStyles(oChangeDestinationButton, { padding: "0.25rem 0rem", "margin-top": "20px" });
        HTMLFunctions.addElementToContainer(oChangeDestinationButton, oChangeLinkButtonSection, 5);

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
                        HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Element ID", value: sId });

                        iChangedLinkCount -= 1;
                        oModifiedElementSection.setTitle(`Changed Links(${iChangedLinkCount})`);
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

        var oChangedLinkRows = {};
        for (var sKey in oChangedLinks) {
            var oChangedLink = oChangedLinks[sKey];
            oChangedLinkRows[sKey] = fCreateChangedLinkTableRow(oChangedLink.id, oChangedLink.destination);
        }

        oModifiedElementSection.addTableRows(oChangedLinkRows);
        oModifiedElementSection.addInputs(oChangeLinkButtonSection);

        return oModifiedElementSection.container;
    }

    createCreatedLinkSection(oViewConfiguration) {
        var oCreatedElements = oViewConfiguration.getCreatedLinks();
        var iCreatedElementCount = Object.keys(oCreatedElements).length;

        var oModifiedElementSection = new ConfigurationSection("Created Links", iCreatedElementCount, ["Element ID", "Target ID", "Destination", "Type", "", ""]);

        var sLabelStyles = "margin-top: 10px; display: block";
        var ocreateElementButtonSection = HTMLFunctions.createElementFromHTML(`
                <div>
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

        var fResetInputs = function () {
            var oElementIdInput = HTMLFunctions.getElement("createElement-elementIdInput");
            var oDestinationInput = HTMLFunctions.getElement("createElement-destination");
            var oColorPicker = HTMLFunctions.getElement("createElement-colorPicker");
            var oTypeSelector = oElementTypeSelection;
            var oOpenNewTabCheckbox = HTMLFunctions.getElement("createElement-openInNewTabCheckbox");
            var oTextInput = HTMLFunctions.getElement("createElement-linkTextInput");

            oElementIdInput.value = "";
            oElementIdInput.disabled = false;
            oTargetInput.input.value = "";
            oColorPicker.value = "#1f3c67";
            oDestinationInput.value = "";
            oTextInput.value = "";
            oOpenNewTabCheckbox.checked = false;
            oTypeSelector.value = oViewConfiguration.LINK_ELEMENT;

            HTMLFunctions.setInputErrorState(oElementIdInput, false);
            HTMLFunctions.setInputErrorState(oTargetInput.input, false);
            HTMLFunctions.setInputErrorState(oDestinationInput, false);
            HTMLFunctions.setInputErrorState(oTextInput, false);

            fTypeSelectionHandler();
        }

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
                if (bUpdate) {
                    iCreatedElementCount -= 1;
                    HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Element ID", value: sElementId });
                }
                oEvent.srcElement.innerText = "Create Link";
                oEvent.srcElement.dataset.update = false;

                if (!oCreatedElement) {
                    HTMLFunctions.setInputErrorState("createElement-elementIdInput", true, "Element has already been created");
                    return;
                }

                iCreatedElementCount += 1;
                oModifiedElementSection.setTitle(`Created Links(${iCreatedElementCount})`);

                fResetInputs();

                HTMLFunctions.createTableRows(oModifiedElementSection.table, { sElementId: fCreateElementCrationTableRow(sElementId, sTargetId, sDestination, sElemntType) });

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

        var fEditCreatedLink = function (sElementId) {
            fResetInputs();

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
                        HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Element ID", value: sId });

                        iCreatedElementCount -= 1;
                        oModifiedElementSection.setTitle(`Created Links(${iCreatedElementCount})`);
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

        var oCreatedElementRows = {};
        for (var sKey in oCreatedElements) {
            var oCreatedElement = oCreatedElements[sKey];
            oCreatedElementRows[sKey] = fCreateElementCrationTableRow(oCreatedElement.id, oCreatedElement.targetContainer, oCreatedElement.type, oCreatedElement.destination);
        }

        oModifiedElementSection.addInputs(ocreateElementButtonSection);
        oModifiedElementSection.addTableRows(oCreatedElementRows);

        return oModifiedElementSection.container;
    }

    createCustomAddToSetGroupSection(oViewConfiguration) {
        var oCustomGroups = oViewConfiguration.getSetSelectionGroups();
        var iCustomGroupCount = Object.keys(oCustomGroups).length;

        var oModifiedElementSection = new ConfigurationSection("Custom Set Selection Groups", iCustomGroupCount, ["Title", "Set Selector", "Sets", "Position", "", ""]);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oCustomGroupInputSection = HTMLFunctions.createElementFromHTML(`
                <div>
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

        var fResetInputFields = function () {
            var oTitleInput = HTMLFunctions.getElement("customSetGroups-titleInput");
            var oSetSelectorInput = HTMLFunctions.getElement("customSetGroups-setSelectorInput");
            var oSetsInput = HTMLFunctions.getElement("customSetGroups-setsInput");
            var oGroupPositionInput = HTMLFunctions.getElement("customSetGroups-groupPositionInput");

            oTitleInput.value = "";
            oTitleInput.disabled = false;
            oSetSelectorInput.value = "";
            oSetsInput.value = "";
            oGroupPositionInput.value = "";

            HTMLFunctions.setInputErrorState(oTitleInput, false);
            HTMLFunctions.setInputErrorState(oSetSelectorInput, false);
            HTMLFunctions.setInputErrorState(oSetsInput, false);
        }

        var fEditCustomSetGroups = function (oGroupId) {
            fResetInputFields();
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
                        HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Title", value: sId });

                        iCustomGroupCount -= 1;
                        oModifiedElementSection.setTitle(`Custom Set Selection Groups(${iCustomGroupCount})`);
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
                if (bUpdateGroup) {
                    iCustomGroupCount -= 1;
                    HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Title", value: oCreatedGroup.id });
                }

                oEvent.srcElement.dataset.update_group = false;
                oEvent.srcElement.innerText = "Create Group";

                if (!oCreatedGroup) {
                    HTMLFunctions.setInputErrorState(oTitleInput, true, "Group has already been created");
                    return;
                }

                iCustomGroupCount += 1;
                oModifiedElementSection.setTitle(`Custom Set Selection Groups(${iCustomGroupCount})`);
                fResetInputFields();

                var oNewRow = {};
                oNewRow[sTitle.replace(/ /g, "")] = fCreateGroupTableRow(sTitle, sSetSelector, aSets.join(", "), iGroupPosition);

                HTMLFunctions.createTableRows(oModifiedElementSection.table, oNewRow);

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

        HTMLFunctions.addElementToContainer(oCreateGroupButton, oCustomGroupInputSection);

        var oCreatedGroupRows = {};
        for (var sKey in oCustomGroups) {
            var oCreatedGroup = oCustomGroups[sKey];
            oCreatedGroupRows[sKey] = fCreateGroupTableRow(oCreatedGroup.title, oCreatedGroup.setSelector, oCreatedGroup.sets.join(", "), oCreatedGroup.position);
        }

        oModifiedElementSection.addInputs(oCustomGroupInputSection);
        oModifiedElementSection.addTableRows(oCreatedGroupRows);

        return oModifiedElementSection.container;
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
        var oCustomTables = oViewConfiguration.getCustomSetTables();
        var iCustomGroupCount = Object.keys(oCustomTables).length;

        var oModifiedElementSection = new ConfigurationSection("Custom Set Tables", iCustomGroupCount, ["Title", "Set Selector", "Sets", "", ""]);

        var sLabelStyles = "margin-top: 10px; display: block";
        var oCustomTableInputSection = HTMLFunctions.createElementFromHTML(`
                <div>
                    <div>Table Title:<label style="color: red">*</label></div>
                    <input id="customSetTables-titleInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. Avians">
    
                    <div style="${sLabelStyles}">Included Set Selector:</div>
                    <input id="customSetTables-setSelectorInput" type="text" style="width: 200px; margin-top: 5px; display: block" placeholder="e.g. *Avian*">
    
                    <div style="${sLabelStyles}">Specific included Sets:</div>
                    <input id="customSetTables-setsInput" type="text" style="width: 600px; margin-top: 5px; display: block" placeholder="e.g. Equine, Birb, Panther, ...">
                <div>
            `);

        var fResetInputFields = function () {
            var oTitleInput = HTMLFunctions.getElement("customSetTables-titleInput");
            var oSetSelectorInput = HTMLFunctions.getElement("customSetTables-setSelectorInput");
            var oSetsInput = HTMLFunctions.getElement("customSetTables-setsInput");

            oTitleInput.value = "";
            oSetSelectorInput.value = "";
            oSetsInput.value = "";
            oTitleInput.disabled = false;

            HTMLFunctions.setInputErrorState(oTitleInput, false);
            HTMLFunctions.setInputErrorState(oSetSelectorInput, false);
            HTMLFunctions.setInputErrorState(oSetsInput, false);
        }

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
                if (bUpdate) {
                    iCustomGroupCount -= 1;
                    HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Title", value: sTitle });
                }
                oEvent.srcElement.innerText = "Create Group";
                oEvent.srcElement.dataset.update = false;

                if (!oCreatedTable) {
                    HTMLFunctions.setInputErrorState(oTitleInput, true, "Table has already been created");
                    return;
                }

                iCustomGroupCount += 1;
                oModifiedElementSection.setTitle(`Custom Set Tables(${iCustomGroupCount})`);
                fResetInputFields();

                var oNewRow = {};
                oNewRow[sTitle.replace(/ /g, "")] = fCreateCustomTableRow(sTitle, sSetSelector, aSets.join(", "), undefined);

                oModifiedElementSection.addTableRows(oNewRow);
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
        HTMLFunctions.addElementToContainer(oCreateGroupButton, oCustomTableInputSection);

        var fEditCustomSetTables = function (sTableId) {
            fResetInputFields();
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
                        HTMLFunctions.removeTableRow(oModifiedElementSection.table, { column: "Title", value: sTitle });

                        iCustomGroupCount -= 1;
                        oModifiedElementSection.setTitle(`Custom Set Tables(${iCustomGroupCount})`);
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

        var oCreatedTableRows = {};
        for (var sKey in oCustomTables) {
            var oCreatedTable = oCustomTables[sKey];
            oCreatedTableRows[sKey] = fCreateCustomTableRow(oCreatedTable.title, oCreatedTable.setSelector, oCreatedTable.setNames.join(", "), oCreatedTable.position);
        }

        oModifiedElementSection.addInputs(oCustomTableInputSection);
        oModifiedElementSection.addTableRows(oCreatedTableRows);

        return oModifiedElementSection.container;
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
        HTMLFunctions.addElementToContainer(this.createSetSuggestionSection(oProfile), oProfileCreationContainer);
        HTMLFunctions.addElementToContainer(this.createViewConfigurationTable(bCreationMode, oProfile), oProfileCreationContainer);

        var oFooter = HTMLFunctions.createElementFromHTML(`<div></div>`);
        HTMLFunctions.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
        var oBackButton = HTMLFunctions.createButton(undefined, "Cancel", function () {
            if (oProfile.hasUnsavedChanges) {
                this.displayConfirmationDialog("Unsaved Changes!", "The profile contains unsaved changes, do you really want to revert all changes?", this.displayProfileSelection.bind(this));
            } else {
                this.displayProfileSelection();
            }
        }.bind(this));

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
        let suggestSets = HTMLFunctions.getElement("suggestSetsCheckbox").checked;
        let username = HTMLFunctions.getElement("usernameInput").value;

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
            oProfile.setSuggestSets(suggestSets);
            oProfile.setUsername(username);

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
        HTMLFunctions.createTableColumns(oprofileTable, ["Name", "Description", "Views", "Active", "", ""]);

        var oTableRows = {};
        var oCreatedProfiles = ProfileStorage.loadCreatedProfiles();

        for (var sConfig in oCreatedProfiles) {
            var oProfile = oCreatedProfiles[sConfig];
            var aConfiguredViews = [];

            for (var sViewConfig in oProfile.viewConfigurations) {
                var sView = oProfile.viewConfigurations[sViewConfig].getViewId();
                var sConvertedView = sView.substring(0, 1).toUpperCase() + sView.substring(1);
                if (!aConfiguredViews.includes(sConvertedView)) aConfiguredViews.push(sConvertedView);
            };

            aConfiguredViews = aConfiguredViews.sort((a, b) => {
                return a.length - b.length;
            });

            oTableRows[oProfile.getId()] = {
                name: {
                    index: 0,
                    content: oProfile.getName()
                },
                description: {
                    index: 1,
                    content: oProfile.getDescription()
                },
                views: {
                    index: 2,
                    content: aConfiguredViews.join(", ")
                },
                isActive: {
                    index: 3,
                    content: oProfile.getIsActive()
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

        var oS87Profile = this.createNewProfile("s87Tweaks", "S87 Tweaks", "S87's e621 tweaks", false, undefined, false, true);
        var oPostViewSettings = oS87Profile.createViewConfiguration("postsViewConfig", "/posts", true);

        oPostViewSettings.hideElement("post-related-images");
        oPostViewSettings.hideElement("post-information");
        oPostViewSettings.hideElement("image-resize-selector");
        oPostViewSettings.hideElement("/html/body/div[1]/div[3]/div[1]/section/section[1]/div[4]");

        oPostViewSettings.moveElement("set", "image-extra-controls", 4);
        oPostViewSettings.modifyElementStyle("set", undefined, { "background": "#453269", "margin-right": "10px" });
        oPostViewSettings.modifyElementStyle("c-posts", undefined, { "height": "100%" });
        oPostViewSettings.modifyElementClass("set", undefined, ["button"]);

        oPostViewSettings.modifyElementStyle(undefined, "artist-tag-list", { "font-size": "18px", "padding-top": "15px", "padding-bottom": "15px" });

        oPostViewSettings.createLink("add-to-set-dialog", "createNewSet", "Create Set", "/post_sets/new", oPostViewSettings.BUTTON_ELEMENT, undefined, true);
        oPostViewSettings.createLink("/html/body/header/nav/menu[2]", "liked-posts", "Liked", "/posts?tags=votedup:anything", oPostViewSettings.LINK_ELEMENT);

        oPostViewSettings.modifyElementStyle("createNewSet", undefined, { "margin-top": "20px", "width": "100%", "text-align": "center" });
        oPostViewSettings.addElementToSetSelectionDialog("createNewSet");

        oPostViewSettings.modifyElementStyle("add-to-set-id", undefined, { "width": "256px", "font-size": "17px" });
        oPostViewSettings.modifyElementStyle("add-to-set-submit", undefined, { "margin-top": "20px", "width": "100%", "height": "30px" });

        ProfileStorage.saveProfile(oS87Profile, true);

        return oS87Profile;
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
                        new PostsViewParser().performUiChanges(oViewConfiguration, oProfile);
                        break;
                    case SetsViewConfiguration.setViewId:
                        console.log("Using 'SetsViewParser' to parse view for path: " + oViewConfiguration.path + sParametersLogMessage);
                        new SetsViewParser().performUiChanges(oViewConfiguration, oProfile);
                        break;
                    default:
                        console.log("Using 'DefaultViewParser' to parse view for path: " + oViewConfiguration.path + sParametersLogMessage);
                        new ViewConfigParser().performUiChanges(oViewConfiguration, oProfile);
                        break;
                };

                return;
            }
        }

        if (oProfile.getSuggestSets() && URLFunctions.doesCurrentUrlMatch("/posts/*"))
            new PostsViewParser().addSetSuggestionSection(oProfile.getUsername());

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
