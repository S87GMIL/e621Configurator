class ViewConfigParser extends HtmlFunctions {
    constructor(sPath, sSearchParameters) {
        super();
        this.path = sPath;
        this.searchParameters = sSearchParameters;
    }

    performUiChanges(oViewConfig) {
        oViewConfig.executionOrder.forEach(sFunctionName => {
            var oConfig = oViewConfig[sFunctionName];

            if (oConfig) this[sFunctionName](oConfig);
        })
    }

    hideElements(aElementIds) {
        aElementIds.forEach(sElementId => {
            this.hideElement(sElementId);
        });
    }

    changeLinkDestination(oNewLinkConfigs) {
        for (var sLinkId in oNewLinkConfigs) {
            var oLinkConfig = oNewLinkConfigs[sLinkId];
            this.setLinkHref(this.getElement(oLinkConfig.id), oLinkConfig.destination);
        }
    }

    createButtons(oButtonConfigs) {
        for (var sButtonId in oButtonConfigs) {
            var oButtonConfig = oButtonConfigs[sButtonId];

            this.addButtonToContainer(
                this.getElement(oButtonConfig.targetContainer),
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

            var oTargetContainer = this.getElement(oLinkConfig.targetContainer);

            if (oTargetContainer) {
                var sLink = `<a id="${oLinkConfig.id}" class="${sType}" style="${sBackground}" href="${oLinkConfig.destination}" target="${sTarget}">${oLinkConfig.text}</a>`;
                this.addElementToContainer(this.createElementFromHTML(sLink), oTargetContainer);
            }
        }
    }

    moveElements(oMoveConfigs) {
        for (var sElementId in oMoveConfigs) {
            var oMoveConfig = oMoveConfigs[sElementId];

            this.addElementToContainer(
                this.getElement(oMoveConfig.id),
                this.getElement(oMoveConfig.targetContainer),
                oMoveConfig.position
            );
        }
    }

    modifyElementStyles(oModifyStyleConfigs) {
        for (var sElementId in oModifyStyleConfigs) {
            var oStyleConfig = oModifyStyleConfigs[sElementId];

            if (oStyleConfig.class) {
                this.getElementsByClass(oStyleConfig.class).forEach(oElement => {
                    this.addElementStyles(
                        oElement,
                        oStyleConfig.styles
                    );
                });
            } else {
                this.addElementStyles(
                    this.getElement(oStyleConfig.id),
                    oStyleConfig.styles
                );
            }
        }
    }

    modifyTagStyles(oModifyStyleConfigs) {
        for (var sTag in oModifyStyleConfigs) {
            var oStyleConfig = oModifyStyleConfigs[sTag];
            this.getElementsByTag(oStyleConfig.tag).forEach(oElement => {
                this.addElementStyles(
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
                this.getElementsByClass(oClassConfig.class).forEach(oElement => {
                    this.addElementStyles(
                        oElement,
                        oClassConfig.styles
                    );
                });
            } else {
                this.addStyleClassToElement(
                    this.getElement(oClassConfig.id),
                    oClassConfig.classes
                );
            }
        }
    }
}