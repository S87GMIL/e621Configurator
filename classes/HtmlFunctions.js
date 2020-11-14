class HtmlFunctions {
    getElement(vElement) {
        if (typeof vElement === "object") {
            return vElement;
        } else {
            var oElement = document.getElementById(vElement);
            if (!oElement) {
                oElement = this.getElementByXpath(vElement);
            }
            return oElement;
        }
    }

    getElementsByClass(sClass) {
        var sClasses = "." + sClass.split(" ").join(".");
        return this.convertHtmlCollectionToArray($(`${sClasses}`));
    }

    getElementsByTag(sTag) {
        return this.convertHtmlCollectionToArray($(`${sTag}`));
    }

    createElementFromHTML(sHtml) {
        var div = document.createElement('div');
        div.innerHTML = sHtml.trim();

        return div.firstChild;
    }

    hideElement(vElement) {
        this.addStyleToElement(this.getElement(vElement), "display", "none");
    }

    recenterElement(vElement) {
        var oElement = this.getElement(vElement);
        if (!oElement) return;

        var iElementHeight = oElement.offsetHeight;
        var iElementWidth = oElement.offsetWidth;

        var iTop = window.innerHeight / 2 - iElementHeight / 2;
        var iLeft = window.innerWidth / 2 - iElementWidth / 2;

        iTop = iTop > 0 ? iTop : 20;
        iLeft = iLeft > 0 ? iLeft : 0;

        this.addElementStyles(oElement, {
            top: iTop + "px",
            left: iLeft + "px"
        });
    }

    setInputErrorState(vInput, bErrorState, sErrorMessage) {
        var oInput = this.getElement(vInput);
        if (oInput) {
            if (bErrorState) {
                this.addStyleToElement(oInput, "border", "1px solid red");
                oInput.setCustomValidity(sErrorMessage);
                oInput.reportValidity();
            } else {
                this.addStyleToElement(oInput, "border", "none");
                oInput.setCustomValidity("");
            }
        }
    }

    createStyleClass(sClassName, oStyles) {
        var oStyleClass = document.createElement('style');
        oStyleClass.type = 'text/css';
        var sStyles = "";

        for (var sKey in oStyles) {
            sStyles += sKey + ": " + oStyles[sKey] + ";";
        }

        sStyles = sStyles.substring(0, sStyles.length - 1);
        oStyleClass.innerHTML = "." + sClassName + " {" + sStyles + "}";
        document.getElementsByTagName('head')[0].appendChild(oStyleClass);
    }

    createTable(sId, aClasses) {
        var sClasses;
        var sIdTag = sId ? `id="${sId}"` : "";
        if (aClasses) {
            sClasses = aClasses.join(" ");
        } else {
            sClasses = "table striped";
        }



        var sTable = `<table ${sIdTag} class="${sClasses}"><tbody></tbody></table>`;
        return this.createElementFromHTML(sTable);
    }

    createTableColumns(vTable, aColumns) {
        var oTable = this.getElement(vTable);
        var aHeaders = oTable.headers ? this.convertHtmlCollectionToArray(oTable.headers) : [];
        if (aHeaders.length === 0) {
            var oHeaderRow = oTable.createTHead().insertRow();

            aColumns.forEach((sColumn, iIndex) => {
                var oCell = oHeaderRow.insertCell();
                oCell.innerHTML = sColumn;
                if (iIndex > 0) this.addStyleToElement(oCell, "padding-left", "20px");
            });
        }
    }

    createTableRows(vTable, oTableRows) {
        var oTable = this.getElement(vTable);

        for (var sKey in oTableRows) {
            var oRowConfig = oTableRows[sKey];

            var oNewRow = oTable.tBodies[0].insertRow();

            for (var sColumn in oRowConfig) {
                var oCellConfig = oRowConfig[sColumn];
                var oCell = oNewRow.insertCell(oCellConfig.index);

                if (typeof oCellConfig.content === "object") {
                    oCell.appendChild(oCellConfig.content);
                } else {
                    oCell.innerHTML = oCellConfig.content;
                }

                if (oCellConfig.styles) this.addElementStyles(oCell, oCellConfig.styles);
            }
        }
    }

    removeTableRow(vTable, oRowInfo) {
        var oTable = this.getElement(vTable);
        var aHeaders = this.convertHtmlCollectionToArray(oTable.tHead.rows[0].cells);
        var iColumnIndex;

        if (oRowInfo.column) oRowInfo.columns = [oRowInfo];

        var oFoundRows = {};
        for (var sKey in oRowInfo.columns) {
            var oColumn = oRowInfo.columns[sKey];

            aHeaders.forEach((oHeader, iIndex) => {
                if (oHeader.innerText.trim() === oColumn.column) iColumnIndex = iIndex;
            });

            var aTableRows = this.convertHtmlCollectionToArray(oTable.tBodies[0].rows);
            if (!Number.isNaN(iColumnIndex) && iColumnIndex !== undefined) aTableRows.forEach((oRow, iIndex) => {
                if (oRow.cells[iColumnIndex].innerText.trim() === oColumn.value) {
                    if (oFoundRows[iIndex]) {
                        oFoundRows[iIndex] += 1;
                    } else {
                        oFoundRows[iIndex] = 1;
                    }
                }
            });
        }

        var iCoulmnCount = oRowInfo.columns.length;
        var iDesiredTableRow;

        for (var sRow in oFoundRows) {
            var iRowFoundCount = oFoundRows[sRow];
            if (iRowFoundCount === iCoulmnCount) {
                iDesiredTableRow = sRow;
                break;
            }
        }

        if (!Number.isNaN(iDesiredTableRow) && iDesiredTableRow !== undefined) {
            oTable.tBodies[0].removeChild(oTable.tBodies[0].rows[iDesiredTableRow])
        }
    }

    createContainerWithTitle(sId, sTitle, sTitleLevel, oStyles, aClasses) {
        var sClasses = aClasses ? aClasses.join(" ") : "";
        var sTitleLevel = sTitleLevel || "h2";
        var sTable = `<div id="${sId}" class="${sClasses}"><${sTitleLevel} style="margin-bottom: 5px">${sTitle}</${sTitleLevel}></div>`;
        var oContainer = this.createElementFromHTML(sTable);

        this.addElementStyles(oContainer, oStyles);

        return oContainer;
    }

    convertHtmlCollectionToArray(oHtmlCollection) {
        return Array.prototype.slice.call(oHtmlCollection);
    }

    addStyleToElement(vElement, sPropertyKey, sPropertyValue) {
        var oElement = this.getElement(vElement);
        if (oElement) {
            if (!oElement.style) oElement.style = {};
            oElement.style[sPropertyKey] = sPropertyValue;
        }
    }

    addStyleClassToElement(oElement, aStyleClasses) {
        if (oElement) oElement.classList.add(aStyleClasses);
    }

    addElementStyles(oElement, oStyleProperties) {
        for (var sProperty in oStyleProperties) {
            this.addStyleToElement(oElement, sProperty, oStyleProperties[sProperty]);
        }
    }

    setLinkHref(oLink, sHref) {
        if (oLink && oLink.href) oLink.href = sHref;
    }

    addElementToContainer(oElement, vContainer, iposition) {
        var oContainer = this.getElement(vContainer);
        if (oElement && oContainer) if (iposition) {
            oContainer.insertBefore(oElement, oContainer.childNodes[iposition]);
        } else {
            oContainer.appendChild(oElement);
        }
    }

    createButton(sId, sText, fClickHandler, oButtonData) {
        var sButtonData = "";

        for (var sKey in oButtonData) {
            sButtonData += `data-${sKey}="${oButtonData[sKey]}"`;
        }

        var sButton = `<a id="${sId || ""}" class="button" style="cursor: pointer" ${sButtonData}>${sText}</a>`;
        var oButton = this.createElementFromHTML(sButton);
        oButton.addEventListener("click", fClickHandler);

        return oButton;
    }

    addButtonToContainer(oContainer, sButtonText, sButtonDestination, aClasses, sBackgroundColor, bOpneNewTab) {
        if (oContainer) {
            var sClasses = aClasses ? aClasses.join(" ") : "button";
            sBackgroundColor = sBackgroundColor || "";
            var sTarget = bOpneNewTab ? "_blank" : "_self";
            var sButton = `<a class="${sClasses}" style="background: ${sBackgroundColor}" href="${sButtonDestination}" target="${sTarget}">${sButtonText}</a>`;
            var oButton = this.createElementFromHTML(sButton);

            oContainer.appendChild(oButton);

            return oButton;
        }
    }

    doesGroupExist(sGroupId) {
        return !!this.getElement(sGroupId);
    }

    createOptionGroup(sGroupId, sGroupTitle) {
        if (!sGroupId) {
            sGroupId = sGroupTitle.replace(/ /g, "");
        }

        if (sGroupTitle) {
            var sGroup = `<optgroup id="${sGroupId}" label="${sGroupTitle}"></optgroup>`;
            return this.createElementFromHTML(sGroup);
        }
    }

    addGroupToSelect(vSelect, oGroup, iPosition) {
        var oSelect = this.getElement(vSelect);
        this.addElementToContainer(oGroup, oSelect, iPosition);
    }

    hideGroupByName(sGroupName) {
        $("optgroup").each(function (iIndex, oOptGroup) {
            if (oOptGroup.label === sGroupName) this.hideElement(oOptGroup);
        });
    }

    moveOptionToGroup(oOption, oSourceGroup, oTargetGroup) {
        if (oSourceGroup) oSourceGroup.removeChild(oOption)
        oTargetGroup.appendChild(oOption);
    }

    getOptionsByName(vSelect, sSetSelector, aNames) {
        var oSelect = this.getElement(vSelect)

        if (!oSelect) return [];

        return this.convertHtmlCollectionToArray(oSelect.options).filter(oOption => {
            return this.#doesSetMatchSetSelectors(oOption.innerText, sSetSelector, aNames);
        });
    }

    #doesSetMatchSetSelectors(sSetName, sSetSelector, aSetNames) {
        var bMacthed = false;
        var aLowerCaseNames = aSetNames.map ? aSetNames.map(sName => { return sName.toLowerCase() }) : [];
        if (aSetNames && aSetNames.length > 0) {
            if (aSetNames.includes(sSetName.trim())) bMacthed = true;
            if (aLowerCaseNames.includes(sSetName.trim().toLowerCase())) bMacthed = true;
        }
        if (sSetSelector && sSetSelector.includes("*")) {
            var oSetNameRegex = this.createRegexFromWildcardString(sSetSelector);
            var oSetLowerCaseNameRegex = this.createRegexFromWildcardString(sSetSelector.toLowerCase());
            if (oSetNameRegex.test(sSetName) || oSetLowerCaseNameRegex.test(sSetName.toLowerCase())) bMacthed = true;
        }
        return bMacthed;
    }

    moveOptionsByName(vSelect, oTargetGroup, sSetSelector, aNames) {
        var oSelect = this.getElement(vSelect);
        var oSourceGroup;
        this.getOptionsByName(oSelect, sSetSelector, aNames).forEach(oOption => {
            if (!oSourceGroup) oSourceGroup = oOption.parentElement;
            this.moveOptionToGroup(oOption, oSourceGroup, oTargetGroup);
        });
    }

    createRegexFromWildcardString(sSearchString) {
        if (sSearchString && sSearchString.includes("*")) {
            if (sSearchString.startsWith("?")) sSearchString = sSearchString.substring(1);
            return new RegExp('^' + sSearchString.replace(/\*/g, '.*') + '$');
        }
    }

    createTableWithTitle(sId, sTitle, aClasses) {
        var oTable = this.createTable(sId, aClasses);
        var oTableContainer = this.createElementFromHTML(`<div><h2 style="padding-top: 20px">${sTitle}</h2></div>`);
        this.addElementToContainer(oTable, oTableContainer);
        return { table: oTable, container: oTableContainer };
    }

    moveSetsToTable(vSourceTable, vTarget, sSetSelector, aSetNames) {
        var oSourceTable = this.getElement(vSourceTable);
        var oTarget = this.getElement(vTarget);
        if (oSourceTable) {

            var oSourceTableBody = oSourceTable.getElementsByTagName('tbody')[0];
            var aDesiredTableRows = this.convertHtmlCollectionToArray(oSourceTableBody.getElementsByTagName("tr")).filter(oTableRow => {
                return this.#doesSetMatchSetSelectors(oTableRow.getElementsByTagName("td")[0].innerText, sSetSelector, aSetNames);
            });

            aDesiredTableRows.forEach(oDesiredTableRow => {
                if (oDesiredTableRow) {
                    oTarget.getElementsByTagName('tbody')[0].appendChild(oDesiredTableRow);

                    if (oTarget.getElementsByTagName('thead').length === 0) {
                        var oHeaderClone = oSourceTable.getElementsByTagName('thead')[0].cloneNode(true);
                        this.convertHtmlCollectionToArray(oHeaderClone.getElementsByTagName("th")).forEach(oHeaderText => {
                            oHeaderText.innerText = "";
                        });
                        oTarget.appendChild(oHeaderClone);
                    }
                }
            });
        }
    }

    createDialog(sId, sTitle, bHasFooter) {
        if (bHasFooter === undefined) bHasFooter = true;
        var sStyles = `position: absolute; height: auto; width: auto`;
        var sClasses = `ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-draggable ui-resizable`;

        if (!sId) sId = sTitle.toLowerCase().replace(/ /g, "");

        var oDialog = this.getElement(`${sId}-dialog`);
        if (oDialog) oDialog.parentNode.removeChild(oDialog);

        var oDialogContent = this.createElementFromHTML(`<div id="${sId}-content" class="ui-dialog-content ui-widget-content"></div>`);

        oDialog = this.createElementFromHTML(`
        <div id="${sId}" tabindex="-1" role="dialog" class="${sClasses}" style="${sStyles}">
            <div class="ui-dialog-titlebar ui-corner-all ui-widget-header ui-helper-clearfix ui-draggable-handle">
                <span class="ui-dialog-title">
                    ${sTitle}
                </span>
            </div>
        </div>`);

        this.addElementToContainer(oDialogContent, oDialog);
        this.addElementToContainer(oDialog, document.body);

        var oFooter;
        if (bHasFooter) {
            oFooter = this.createElementFromHTML(`<div></div>`);
            this.addElementStyles(oFooter, { "margin-top": "20px", "margin-bottom": "5px", "border-top": "1px solid #1f3c67" });
            this.addElementToContainer(oFooter, oDialog);
        }

        this.recenterElement(oDialog);

        return {
            id: sId,
            dialog: oDialog,
            content: oDialogContent,
            footer: oFooter
        };
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getElementTreeXPath = function (element) {
        var paths = [];
        for (; element && element.nodeType == Node.ELEMENT_NODE;
            element = element.parentNode) {
            var index = 0;
            var hasFollowingSiblings = false;
            for (var sibling = element.previousSibling; sibling;
                sibling = sibling.previousSibling) {
                if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                    continue;

                if (sibling.nodeName == element.nodeName)
                    ++index;
            }

            for (var sibling = element.nextSibling;
                sibling && !hasFollowingSiblings;
                sibling = sibling.nextSibling) {
                if (sibling.nodeName == element.nodeName)
                    hasFollowingSiblings = true;
            }

            var tagName = (element.prefix ? element.prefix + ":" : "")
                + element.localName;
            var pathIndex = (index || hasFollowingSiblings ? "["
                + (index + 1) + "]" : "");
            paths.splice(0, 0, tagName + pathIndex);
        }

        return paths.length ? "/" + paths.join("/") : null;
    };

    getElementXPath = function (element) {
        if (element && element.id)
            return '//*[@id="' + element.id + '"]';
        else
            return this.getElementTreeXPath(element);
    };

    getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    deactivateElementSelectionMode() {
        this.elementSelectioNModeActive = false;
        this.oBodyClone.parentNode.replaceChild(this.oOriginalBody, this.oBodyClone);
        this.addElementStyles("viewConfig-dialog", { "display": "block" });
    }

    activateElementSelectionMode(fElementSelectedCallback, oInput, bReturnElementClass) {
        if (!this.oOriginalBody) this.oOriginalBody = document.getElementsByTagName("body")[0];

        this.oBodyClone = this.oOriginalBody.cloneNode(true);
        this.oOriginalBody.parentNode.replaceChild(this.oBodyClone, this.oOriginalBody); //Replace body with a clone to disconnect all event listeners

        this.hideElement("viewConfig-dialog");

        $("a").each(function (iIndex, oAnchor) {
            oAnchor.onclick = function () { return false; };
        });

        this.elementSelectioNModeActive = true;
        var oDocument = $(document);

        oDocument.mouseover(function (oEvent) {
            if (!this.elementSelectioNModeActive) return;
            oEvent.target.style.border = "dotted 1px #ff0000e0";

            oEvent.target.addEventListener("mouseout", function (oEvent) {
                oEvent.target.style.border = "";
            });
        }.bind(this));

        var fClickEventListener = function (oEvent) {
            if (!this.elementSelectioNModeActive) return;

            if (oEvent.target && oEvent.target.id !== "viewConfigButton" && !oEvent.target.dataset.is_element_select_button) {
                if (oEvent.target && fElementSelectedCallback) {
                    var sElementIdentifier;
                    if (bReturnElementClass) {
                        sElementIdentifier = oEvent.target.className;
                    } else {
                        if (oEvent.target.id) {
                            sElementIdentifier = oEvent.target.id;
                        } else {
                            sElementIdentifier = this.getElementXPath(oEvent.target);
                        }
                    }

                    document.removeEventListener("click", fClickEventListener);
                    fElementSelectedCallback(sElementIdentifier, oInput);
                }
            }
        }.bind(this);

        document.addEventListener("click", fClickEventListener);
    }

    crateHtmlElementSelectionInput(sPlaceholder, sLabelText, bRequired, bReturnElementClass) {
        if (!sLabelText) sLabelText = "Element ID / XPath:";

        var sRequiredLabel = bRequired ? `<label style="color: red">*</label>` : "";
        var oLabel = this.createElementFromHTML(`<div style="display: block">${sLabelText}${sRequiredLabel}</div>`)
        var oInput = this.createElementFromHTML(`<Input placeholder="${sPlaceholder}" type="text" style="width: 200px">`);
        var fSelectElementCallback = function (sElementSelector, oParentInput) {
            this.deactivateElementSelectionMode();
            oParentInput.value = sElementSelector;
        }.bind(this);

        var oSelectButton = this.createButton(undefined, "Select", function () {
            this.activateElementSelectionMode(fSelectElementCallback, oInput, bReturnElementClass);
        }.bind(this), { is_element_select_button: true });

        var oInputContainer = this.createElementFromHTML(`<div></div>`);

        this.addElementToContainer(oLabel, oInputContainer);
        this.addElementToContainer(oInput, oInputContainer);
        this.addElementToContainer(oSelectButton, oInputContainer);

        return {
            input: oInput,
            selectButton: oSelectButton,
            container: oInputContainer
        }
    }
}