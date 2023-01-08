class PostsViewParser extends ViewConfigParser {
    async performUiChanges(oViewConfig, oProfile) {
        if (oProfile.getSuggestSets())
            await this.addSetSuggestionSection(oProfile.getUsername());

        oViewConfig.executionOrder.forEach(sFunctionName => {
            var oConfig = oViewConfig[sFunctionName];

            if (oConfig) this[sFunctionName](oConfig);
        });
    }

    createCustomSetGroup(oConfigs) {
        if (Object.keys(oConfigs).length > 0) {
            var fSetsLoadedCallback = function () {
                for (var sKey in oConfigs) {
                    var oGroupConfig = oConfigs[sKey];

                    if (!HTMLFunctions.doesGroupExist(oGroupConfig.id)) {
                        var oSetSelect = HTMLFunctions.getElement("add-to-set-id");

                        var oCustomGroup = HTMLFunctions.createOptionGroup(oGroupConfig.id, oGroupConfig.title);
                        HTMLFunctions.moveOptionsByName(
                            oSetSelect,
                            oCustomGroup,
                            oGroupConfig.setSelector,
                            oGroupConfig.sets
                        );

                        HTMLFunctions.addGroupToSelect(oSetSelect, oCustomGroup, oGroupConfig.position);
                    }
                }
            }

            var oAddToSetButton = HTMLFunctions.getElement("set");
            if (oAddToSetButton) oAddToSetButton.onclick = function () {
                this.waitUntilSetsAreLoaded("add-to-set-id", fSetsLoadedCallback);
            }.bind(this)
        }
    }

    moveElementToSetSelectionDialog(oConfig) {
        var oSelectionDialog = HTMLFunctions.getElement("add-to-set-dialog");
        if (!oSelectionDialog) return;
        var oSetSelectionForm = oSelectionDialog.children[0];
        if (oSetSelectionForm)
            for (var sKey in oConfig) {
                var oMoveConfig = oConfig[sKey];

                HTMLFunctions.addElementToContainer(HTMLFunctions.getElement(oMoveConfig.id), oSetSelectionForm, oMoveConfig.position);
            }
    }

    waitUntilSetsAreLoaded(sSelectId, fCallback) {
        var oTarget = HTMLFunctions.getElement(sSelectId);
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

    async addSetSuggestionSection(username, ignoredSets = []) {
        let addToSetDialog = HTMLFunctions.getElement("add-to-set-dialog");

        let suggestionForm = document.querySelector("#setSuggestionForm");
        suggestionForm.innerHTML = "";

        if (!suggestionForm) {
            suggestionForm = document.createElement("div");
            suggestionForm.id = "setSuggestionForm";
            suggestionForm.classList.add("simple_form");
        }

        let currentPostId = document.location.pathname.split("/").pop();
        let suggestedSets = await SuggestionHelper.suggestSets(currentPostId);

        suggestedSets = suggestedSets.filter(set => {
            return !ignoredSets.includes(set.id);
        });

        if (suggestedSets.length === 0)
            return;

        let topSuggestion = suggestedSets[0];

        let suggestedSetLable = document.createElement("label");
        suggestedSetLable.innerText = topSuggestion.name;
        suggestedSetLable.style.display = "block";

        suggestionForm.appendChild(suggestedSetLable);

        var addToSuggstedButton = HTMLFunctions.createButton("addToSuggestedButton", "Add to suggested set", () => {
            APIHelper.getInstance().addPostToSet(topSuggestion.id, currentPostId);
            ignoredSets.push(topSuggestion.id);
            this.addSetSuggestionSection(username, ignoredSets);
        });

        suggestionForm.appendChild(addToSuggstedButton);

        addToSetDialog.appendChild(suggestionForm);
    }
}