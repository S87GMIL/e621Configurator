class ElementSelection {
    deactivateElementSelectionMode() {
        this.elementSelectioNModeActive = false;
        this.oBodyClone.parentNode.replaceChild(this.oOriginalBody, this.oBodyClone);
        HTMLFunctions.addElementStyles("viewConfig-dialog", { "display": "block" });
    }

    activateElementSelectionMode(fElementSelectedCallback, oInput, bReturnElementClass) {
        if (!this.oOriginalBody) this.oOriginalBody = document.getElementsByTagName("body")[0];

        this.oBodyClone = this.oOriginalBody.cloneNode(true);
        this.oOriginalBody.parentNode.replaceChild(this.oBodyClone, this.oOriginalBody); //Replace body with a clone to disconnect all event listeners

        HTMLFunctions.hideElement("viewConfig-dialog");

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
                            sElementIdentifier = HTMLFunctions.getElementXPath(oEvent.target);
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
        var oLabel = HTMLFunctions.createElementFromHTML(`<div style="display: block">${sLabelText}${sRequiredLabel}</div>`)
        var oInput = HTMLFunctions.createElementFromHTML(`<Input placeholder="${sPlaceholder}" type="text" style="width: 200px">`);
        var fSelectElementCallback = function (sElementSelector, oParentInput) {
            this.deactivateElementSelectionMode();
            oParentInput.value = sElementSelector;
        }.bind(this);

        var oSelectButton = HTMLFunctions.createButton(undefined, "Select", function () {
            this.activateElementSelectionMode(fSelectElementCallback, oInput, bReturnElementClass);
        }.bind(this), { is_element_select_button: true });

        var oInputContainer = HTMLFunctions.createElementFromHTML(`<div></div>`);

        HTMLFunctions.addElementToContainer(oLabel, oInputContainer);
        HTMLFunctions.addElementToContainer(oInput, oInputContainer);
        HTMLFunctions.addElementToContainer(oSelectButton, oInputContainer);

        return {
            input: oInput,
            selectButton: oSelectButton,
            container: oInputContainer
        }
    }
}