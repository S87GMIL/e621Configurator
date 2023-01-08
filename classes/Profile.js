class Profile {
    rootViewId = "root";

    constructor(sId, sName, sDescription, bIsActive, oViewConfigrations, bDeletable, bEditable, suggestSets = false, username = "") {
        this.deletable = bDeletable === undefined ? true : bDeletable;
        this.editable = bEditable === undefined ? true : bEditable;

        this.isDirty = false;

        this.id = sId;
        this.name = sName;
        this.description = sDescription;
        this.active = bIsActive || false;
        this.suggestSets = suggestSets || false;
        this.username = username;

        this.viewConfigurations = {};
        if (oViewConfigrations) {
            this.#parseViewConfigs(oViewConfigrations);
        }
    }

    get hasUnsavedChanges() {
        return this.isDirty;
    }

    set hasUnsavedChanges(bHasChanges) {
        this.isDirty = bHasChanges;
    }

    parseProfile(oProfile) {
        this.name = oProfile.name;
        this.description = oProfile.description;
        this.active = oProfile.active;
        this.editable = oProfile.editable;
        this.deletable = oProfile.deletable;
        this.suggestSets = oProfile.suggestSets;
        this.username = oProfile.username;

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
        this.isDirty = true;
    }

    isActive() {
        return this.active;
    }

    getIsActive() {
        return this.active;
    }

    setId(sId) {
        if (this.id !== sId) {
            this.isDirty = true;
            this.id = sId;
        }
    }

    getId() {
        return this.id;
    }

    setName(sName) {
        if (this.name !== sName) {
            this.name = sName;
            this.isDirty = true;
        }
    }

    getName() {
        return this.name;
    }

    setDescription(sDescription) {
        if (this.description !== sDescription) {
            this.description = sDescription;
            this.isDirty = true;
        }
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
            viewConfigurations: {},
            suggestSets: this.suggestSets,
            username: this.username
        }

        for (var sKey in this.viewConfigurations) {
            var oViewConfig = this.viewConfigurations[sKey];
            oConfigJson.viewConfigurations[sKey] = oViewConfig.getConfiguration();
        }

        return oConfigJson;
    }

    #createViewConfigurator(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        bIncludeSubPaths = bIncludeSubPaths === undefined ? true : bIncludeSubPaths;

        switch (true) {
            case sPath.includes("/explore/posts/popular"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "popular", this);
            case sPath.includes("/posts"):
                return new PostViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, this);
            case sPath.includes("/post_sets"):
                return new SetsViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, this);
            case sPath.includes("/uploads"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "uploads", this);
            case sPath.includes("/favorites"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "favorites", this);
            case sPath.includes("/post_versions"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "postVersions", this);
            case sPath.includes("/comments"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "comments", this);
            case sPath.includes("/artists"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "artists", this);
            case sPath.includes("/tag"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "tags", this);
            case sPath.includes("/blips"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "blips", this);
            case sPath.includes("/pools"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "pools", this);
            case sPath.includes("/wiki_pages"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "wiki", this);
            case sPath.includes("/forum_topics"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "forum", this);
            case sPath.includes("/users"):
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "users", this);
            case sPath === "/" || sPath === "/*":
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, rootViewId, this);
            default:
                return new ViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters, "unknown", this);
        }
    }

    createViewConfiguration(sId, sPath, bIncludeSubPaths, sSearchParameters) {
        var oConfigurator = this.#createViewConfigurator(sId, sPath, bIncludeSubPaths, sSearchParameters, this);
        this.viewConfigurations[sId] = oConfigurator;
        this.isDirty = true;

        return oConfigurator;
    }

    getViewConfiguration(sId) {
        return this.viewConfigurations[sId];
    }

    deleteViewConfiguration(sId) {
        this.isDirty = true;
        delete this.viewConfigurations[sId];
    }

    getSuggestSets() {
        return this.suggestSets;
    }

    setSuggestSets(suggestSets){
        this.suggestSets = suggestSets;
    }

    getUsername() {
        return this.username;
    }

    setUsername(username){
        this.username = username;
    }
}