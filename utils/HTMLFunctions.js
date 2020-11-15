class HTMLFunctions {
    static getElement(vElement) {
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

    static getElementsByClass(sClass) {
        var sClasses = "." + sClass.split(" ").join(".");
        return this.convertHtmlCollectionToArray($(`${sClasses}`));
    }

    static getElementsByTag(sTag) {
        return this.convertHtmlCollectionToArray($(`${sTag}`));
    }

    static createElementFromHTML(sHtml) {
        var div = document.createElement('div');
        div.innerHTML = sHtml.trim();

        return div.firstChild;
    }

    static hideElement(vElement) {
        this.addStyleToElement(this.getElement(vElement), "display", "none");
    }

    static recenterElement(vElement) {
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

    static setInputErrorState(vInput, bErrorState, sErrorMessage) {
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

    static createTable(sId, aClasses) {
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

    static createTableColumns(vTable, aColumns) {
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

    static createTableRows(vTable, oTableRows) {
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

    static removeTableRow(vTable, oRowInfo) {
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

    static createContainerWithTitle(sId, sTitle, sTitleLevel, oStyles, aClasses) {
        var sClasses = aClasses ? aClasses.join(" ") : "";
        var sTitleLevel = sTitleLevel || "h2";
        var sTable = `<div id="${sId}" class="${sClasses}"><${sTitleLevel} style="margin-bottom: 5px">${sTitle}</${sTitleLevel}></div>`;
        var oContainer = this.createElementFromHTML(sTable);

        this.addElementStyles(oContainer, oStyles);

        return oContainer;
    }

    static convertHtmlCollectionToArray(oHtmlCollection) {
        return Array.prototype.slice.call(oHtmlCollection);
    }

    static addStyleToElement(vElement, sPropertyKey, sPropertyValue) {
        var oElement = this.getElement(vElement);
        if (oElement) {
            if (!oElement.style) oElement.style = {};
            oElement.style[sPropertyKey] = sPropertyValue;
        }
    }

    static addStyleClassToElement(oElement, aStyleClasses) {
        if (oElement) oElement.classList.add(aStyleClasses);
    }

    static addElementStyles(oElement, oStyleProperties) {
        for (var sProperty in oStyleProperties) {
            this.addStyleToElement(oElement, sProperty, oStyleProperties[sProperty]);
        }
    }

    static setLinkHref(oLink, sHref) {
        if (oLink && oLink.href) oLink.href = sHref;
    }

    static addElementToContainer(oElement, vContainer, iposition) {
        var oContainer = this.getElement(vContainer);
        if (oElement && oContainer) if (iposition) {
            oContainer.insertBefore(oElement, oContainer.childNodes[iposition]);
        } else {
            oContainer.appendChild(oElement);
        }
    }

    static createButton(sId, sText, fClickHandler, oButtonData) {
        var sButtonData = "";

        for (var sKey in oButtonData) {
            sButtonData += `data-${sKey}="${oButtonData[sKey]}"`;
        }

        var sButton = `<a id="${sId || ""}" class="button" style="cursor: pointer" ${sButtonData}>${sText}</a>`;
        var oButton = this.createElementFromHTML(sButton);
        oButton.addEventListener("click", fClickHandler);

        return oButton;
    }

    static addButtonToContainer(oContainer, sButtonText, sButtonDestination, aClasses, sBackgroundColor, bOpneNewTab) {
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

    static doesGroupExist(sGroupId) {
        return !!this.getElement(sGroupId);
    }

    static createOptionGroup(sGroupId, sGroupTitle) {
        if (!sGroupId) {
            sGroupId = sGroupTitle.replace(/ /g, "");
        }

        if (sGroupTitle) {
            var sGroup = `<optgroup id="${sGroupId}" label="${sGroupTitle}"></optgroup>`;
            return this.createElementFromHTML(sGroup);
        }
    }

    static addGroupToSelect(vSelect, oGroup, iPosition) {
        var oSelect = this.getElement(vSelect);
        this.addElementToContainer(oGroup, oSelect, iPosition);
    }

    static hideGroupByName(sGroupName) {
        $("optgroup").each(function (iIndex, oOptGroup) {
            if (oOptGroup.label === sGroupName) this.hideElement(oOptGroup);
        });
    }

    static moveOptionToGroup(oOption, oSourceGroup, oTargetGroup) {
        if (oSourceGroup) oSourceGroup.removeChild(oOption)
        oTargetGroup.appendChild(oOption);
    }

    static getOptionsByName(vSelect, sSetSelector, aNames) {
        var oSelect = this.getElement(vSelect)

        if (!oSelect) return [];

        return this.convertHtmlCollectionToArray(oSelect.options).filter(oOption => {
            return this.#doesSetMatchSetSelectors(oOption.innerText, sSetSelector, aNames);
        });
    }

    static #doesSetMatchSetSelectors(sSetName, sSetSelector, aSetNames) {
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

    static moveOptionsByName(vSelect, oTargetGroup, sSetSelector, aNames) {
        var oSelect = this.getElement(vSelect);
        var oSourceGroup;
        this.getOptionsByName(oSelect, sSetSelector, aNames).forEach(oOption => {
            if (!oSourceGroup) oSourceGroup = oOption.parentElement;
            this.moveOptionToGroup(oOption, oSourceGroup, oTargetGroup);
        });
    }

    static createRegexFromWildcardString(sSearchString) {
        if (sSearchString && sSearchString.includes("*")) {
            var sEscapedString = sSearchString.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp('^' + sEscapedString.replace(/\*/g, '.*') + '$');
        }
    }

    static createTableWithTitle(sId, sTitle, aClasses) {
        var oTable = this.createTable(sId, aClasses);
        var oTableContainer = this.createElementFromHTML(`<div><h2 style="padding-top: 20px">${sTitle}</h2></div>`);
        this.addElementToContainer(oTable, oTableContainer);
        return { table: oTable, container: oTableContainer };
    }

    static moveSetsToTable(vSourceTable, vTarget, sSetSelector, aSetNames) {
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

    static createDialog(sNamespace, sTitle, bHasFooter, bHasCloseButton) {
        if (!sNamespace) sNamespace = sTitle.toLowerCase().replace(/ /g, "");

        if (bHasFooter === undefined) bHasFooter = true;
        var sStyles = `position: absolute; height: auto; width: auto`;
        var sClasses = `ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-front`;

        var sCloseButton = bHasCloseButton ?
            `<button id="${sNamespace}-closeButton" type="button" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close">
             <span class="ui-button-icon ui-icon ui-icon-closethick"></span>
             <span class="ui-button-icon-space"></span>Close</button>` : "";

        var oDialog = this.getElement(`${sNamespace}-dialog`);
        if (oDialog) oDialog.parentNode.removeChild(oDialog);

        var oDialogContent = this.createElementFromHTML(`<div id="${sNamespace}-content" class="ui-dialog-content ui-widget-content"></div>`);

        oDialog = this.createElementFromHTML(`
        <div id="${sNamespace}-dialog" tabindex="-1" role="dialog" class="${sClasses}" style="${sStyles}" role="dialog">
            <div class="ui-dialog-titlebar ui-corner-all ui-widget-header ui-helper-clearfix">
                <span class="ui-dialog-title">
                    ${sTitle}
                </span>
                ${sCloseButton}
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
            dialog: oDialog,
            content: oDialogContent,
            footer: oFooter
        };
    }

    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static getElementTreeXPath = function (element) {
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

    static getElementXPath = function (element) {
        if (element && element.id)
            return '//*[@id="' + element.id + '"]';
        else
            return this.getElementTreeXPath(element);
    };

    static getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
}