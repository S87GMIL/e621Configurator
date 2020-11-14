class PostsViewParser extends ViewConfigParser {
    createCustomSetGroup(oConfigs) {
        if (Object.keys(oConfigs).length > 0) {
            var fSetsLoadedCallback = function () {
                for (var sKey in oConfigs) {
                    var oGroupConfig = oConfigs[sKey];

                    if (!this.doesGroupExist(oGroupConfig.id)) {
                        var oSetSelect = this.getElement("add-to-set-id");

                        var oCustomGroup = this.createOptionGroup(oGroupConfig.id, oGroupConfig.title);
                        this.moveOptionsByName(
                            oSetSelect,
                            oCustomGroup,
                            oGroupConfig.setSelector,
                            oGroupConfig.sets
                        );

                        this.addGroupToSelect(oSetSelect, oCustomGroup, oGroupConfig.position);
                    }
                }
            }.bind(this)

            var oAddToSetButton = this.getElement("set");
            if (oAddToSetButton) oAddToSetButton.onclick = function () {
                this.waitUntilSetsAreLoaded("add-to-set-id", fSetsLoadedCallback);
            }.bind(this)
        }
    }

    moveElementToSetSelectionDialog(oConfig) {
        var oSelectionDialog = this.getElement("add-to-set-dialog");
        if (!oSelectionDialog) return;
        var oSetSelectionForm = oSelectionDialog.children[0];
        if (oSetSelectionForm)
            for (var sKey in oConfig) {
                var oMoveConfig = oConfig[sKey];

                this.addElementToContainer(this.getElement(oMoveConfig.id), oSetSelectionForm, oMoveConfig.position);
            }
    }

    waitUntilSetsAreLoaded(sSelectId, fCallback) {
        var oTarget = this.getElement(sSelectId);
        var fObserverCallback = function (mutationsList, observer) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    if (mutation.target.options[0].innerText !== "Loading...") {
                        oObserver.disconnect();
                        fCallback()
                    }
                }
            });
        };
        var oObserver = new MutationObserver(fObserverCallback);
        oObserver.observe(oTarget, { attributes: true, childList: true, subtree: true });
    }
}