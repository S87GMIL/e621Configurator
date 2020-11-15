class ViewConfigParser {
    constructor(sPath, sSearchParameters) {
        this.path = sPath;
        this.searchParameters = sSearchParameters;
    }

    performUiChanges(oViewConfig) {
        oViewConfig.executionOrder.forEach(sFunctionName => {
            var oConfig = oViewConfig[sFunctionName];

            if (oConfig) this[sFunctionName](oConfig);
        });
    }

    hideElements(aElementIds) {
        aElementIds.forEach(sElementId => {
            HTMLFunctions.hideElement(sElementId);
        });
    }

    changeLinkDestination(oNewLinkConfigs) {
        for (var sLinkId in oNewLinkConfigs) {
            var oLinkConfig = oNewLinkConfigs[sLinkId];
            HTMLFunctions.setLinkHref(HTMLFunctions.getElement(oLinkConfig.id), oLinkConfig.destination);
        }
    }

    createButtons(oButtonConfigs) {
        for (var sButtonId in oButtonConfigs) {
            var oButtonConfig = oButtonConfigs[sButtonId];

            HTMLFunctions.addButtonToContainer(
                HTMLFunctions.getElement(oButtonConfig.targetContainer),
                oButtonConfig.text,
                oButtonConfig.destination,
                oButtonConfig.classes,
                oButtonConfig.backgroundColor,
                oButtonConfig.openInNewTab
            );
        }
    }

    createLinks(oLinkConfigs) {
        for (var sLinkId in oLinkConfigs) {
            var oLinkConfig = oLinkConfigs[sLinkId];

            var sType = oLinkConfig.type === "button" ? "button" : "";
            var sTarget = oLinkConfig.openInNewTab ? "_blank" : "_self";
            var sBackground = oLinkConfig.backgroundColor ? "background: " + oLinkConfig.backgroundColor : "";

            var oTargetContainer = HTMLFunctions.getElement(oLinkConfig.targetContainer);

            if (oTargetContainer) {
                var sLink = `<a id="${oLinkConfig.id}" class="${sType}" style="${sBackground}" href="${oLinkConfig.destination}" target="${sTarget}">${oLinkConfig.text}</a>`;
                HTMLFunctions.addElementToContainer(HTMLFunctions.createElementFromHTML(sLink), oTargetContainer);
            }
        }
    }

    moveElements(oMoveConfigs) {
        for (var sElementId in oMoveConfigs) {
            var oMoveConfig = oMoveConfigs[sElementId];

            HTMLFunctions.addElementToContainer(
                HTMLFunctions.getElement(oMoveConfig.id),
                HTMLFunctions.getElement(oMoveConfig.targetContainer),
                oMoveConfig.position
            );
        }
    }

    modifyElementStyles(oModifyStyleConfigs) {
        for (var sElementId in oModifyStyleConfigs) {
            var oStyleConfig = oModifyStyleConfigs[sElementId];

            if (oStyleConfig.class) {
                HTMLFunctions.getElementsByClass(oStyleConfig.class).forEach(oElement => {
                    HTMLFunctions.addElementStyles(
                        oElement,
                        oStyleConfig.styles
                    );
                });
            } else {
                HTMLFunctions.addElementStyles(
                    HTMLFunctions.getElement(oStyleConfig.id),
                    oStyleConfig.styles
                );
            }
        }
    }

    modifyTagStyles(oModifyStyleConfigs) {
        for (var sTag in oModifyStyleConfigs) {
            var oStyleConfig = oModifyStyleConfigs[sTag];
            HTMLFunctions.getElementsByTag(oStyleConfig.tag).forEach(oElement => {
                HTMLFunctions.addElementStyles(
                    oElement,
                    oStyleConfig.styles
                );
            });
        }
    }

    modifyElementClasses(oModifyElementClassConfigs) {
        for (var sElementId in oModifyElementClassConfigs) {
            var oClassConfig = oModifyElementClassConfigs[sElementId];

            if (oClassConfig.class) {
                HTMLFunctions.getElementsByClass(oClassConfig.class).forEach(oElement => {
                    HTMLFunctions.addElementStyles(
                        oElement,
                        oClassConfig.styles
                    );
                });
            } else {
                HTMLFunctions.addStyleClassToElement(
                    HTMLFunctions.getElement(oClassConfig.id),
                    oClassConfig.classes
                );
            }
        }
    }
}