class Profile {
    rootViewId = "root";

    constructor(sId, sName, sDescription, bIsActive, oViewConfigrations, bDeletable, bEditable) {
        this.deletable = bDeletable === undefined ? true : bDeletable;
        this.editable = bEditable === undefined ? true : bEditable;

        this.id = sId;
        this.name = sName;
        this.description = sDescription;
        this.active = bIsActive || false;

        this.viewConfigurations = {};
        if (oViewConfigrations) {
            this.#parseViewConfigs(oViewConfigrations);
        }
    }

    parseProfile(oProfile) {
        this.setName(oProfile.name);
        this.setDescription(oProfile.description);
        this.setActive(oProfile.active);
        this.editable = oProfile.editable;
        this.deletable = oProfile.deletable;

        this.#parseViewConfigs(oProfile.viewConfigurations);
        return this;
    }

    #parseViewConfigs(oViewConfigs) {
        for (var sConfigId in oViewConfigs) {
            var oViewConfig = oViewConfigs[sConfigId];

            var oParsedProfile = this.#createViewConfigurator(
                oViewConfig.id,
                oViewConfig.path,
                oViewConfig.includeSubPaths,
                oViewConfig.searchParameters
            ).parseViewConfig(oViewConfig);

            this.viewConfigurations[sConfigId] = oParsedProfile;
        }
    }

    setActive(bIsActive) {
        if (bIsActive === undefined) bIsActive = false;
        this.active = bIsActive;
    }

    isActive() {
        return this.active;
    }

    getIsActive() {
        return this.active;
    }

    setId(sId) {
        this.id = sId;
    }

    getId() {
        return this.id;
    }

    setName(sName) {
        this.name = sName;
    }

    getName() {
        return this.name;
    }

    setDescription(sDescription) {
        this.description = sDescription;
    }

    getDescription() {
        return this.description;
    }

    getActive() {
        return this.active;
    }

    createPathId(sPath) {
        var sId = sPath;
        if (this.viewConfigurations[sId]) {
            this.createPathId(sPath + this.viewConfigurations.length);
        } else {
            return sId;
        }
    }

    isEditable() {
        return this.editable;
    }

    isDeletable() {
        return this.deletable;
    }

    generateJsonConfiguration() {
        var oConfigJson = {
            deletable: this.deletable,
            editable: this.editable,
            id: this.id,
            name: this.name,
            description: this.description,
            active: this.active,
            viewConfigurations: {}
        }

        for (var sKey in this.viewConfigurations) {
            var oViewConfig = this.viewConfigurations[sKey];
            oConfigJson.viewConfigurations[sKey] = oViewConfig.getConfiguration();
        }

        return oConfigJson;
    }

    #createViewConfigurator(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        bIncludeSubPaths = bIncludeSubPaths === undefined ? true : bIncludeSubPaths;
        if (sPath.includes("/explore/posts/popular")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "popular");
        } else if (sPath.includes("/posts")) {
            return new PostViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters);
        } else if (sPath.includes("/post_sets")) {
            return new SetsViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters);
        } else if (sPath.includes("/uploads")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "uploads");
        } else if (sPath.includes("/favorites")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "favorites");
        } else if (sPath.includes("/post_versions")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "postVersions");
        } else if (sPath.includes("/comments")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "comments");
        } else if (sPath.includes("/artists")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "artists");
        } else if (sPath.includes("/tag")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "tags");
        } else if (sPath.includes("/blips")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "blips");
        } else if (sPath.includes("/pools")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "pools");
        } else if (sPath.includes("/wiki_pages")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "wiki");
        } else if (sPath.includes("/forum_topics")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "forum");
        } else if (sPath.includes("/users")) {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "users");
        } else if (sPath === "/" || sPath === "/*") {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, rootViewId);
        } else {
            return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "unknown");
        }
    }

    createViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        var oConfigurator = this.#createViewConfigurator(sId, sPath, bIncludeSubPaths, sSearchParameters);
        this.viewConfigurations[sId] = oConfigurator;
        return oConfigurator;
    }

    getViewConfiguration(sId) {
        return this.viewConfigurations[sId];
    }

    deleteViewConfiguration(sId) {
        delete this.viewConfigurations[sId];
    }
}