const createdProfilesStorageKey = "createdProfiles";

class ProfileStorage {
    static deleteStoredProfiles(sKey) {
        GM_deleteValue(sKey);
        console.log("Deleted stored data: " + sKey);
    }

    static loadCreatedProfiles() {
        var oCreatedProfileConfigs = this.#getCreatedProfielConfigs();
        var oParsedProfiles = {};
        for (var sProfileId in oCreatedProfileConfigs) {
            oParsedProfiles[sProfileId] = new Profile(sProfileId).parseProfile(oCreatedProfileConfigs[sProfileId]);
        }
        return oParsedProfiles;
    }

    static loadProfile(sProfileId) {
        var oProfiles = GM_getValue(createdProfilesStorageKey);
        var oProfile;
        for (var sKey in oProfiles) {
            if (sKey === sProfileId) {
                oProfile = oProfiles[sKey];
                break;
            }
        };

        if (oProfile) {
            return new Profile(oProfile.id).parseProfile(oProfile);
        }

    }

    static getActiveProfile() {
        let profiles = GM_getValue(createdProfilesStorageKey);
        let activeProfileConfig = {};

        for (let key in profiles) {
            if (profiles[key].active === true);
            activeProfileConfig = profiles[key];
        };

        return new Profile(profileConfig.id).parseProfile(profileConfig);
    }

    static setProfileActive(oProfile, bIsActive) {
        oProfile.setActive(bIsActive);
        this.saveProfile(oProfile, bIsActive);
    }

    static deleteProfile(oProfileId) {
        var oConfigs = this.#getCreatedProfielConfigs();
        delete oConfigs[oProfileId];
        this.#saveToStorage(createdProfilesStorageKey, oConfigs);
        console.log("Deleted config: " + oProfileId);
    }

    static #getCreatedProfielConfigs() {
        return GM_getValue(createdProfilesStorageKey);
    }

    static #saveToStorage(sKey, vValue) {
        GM_setValue(sKey, vValue);
    }

    static saveProfile(oProfile, bIsActive) {
        var oCreatedProfiles = this.#getCreatedProfielConfigs();
        var sProfileId = oProfile.getId();

        if (!oCreatedProfiles) oCreatedProfiles = {};
        oProfile.active = bIsActive;
        oCreatedProfiles[sProfileId] = oProfile.generateJsonConfiguration();

        if (bIsActive) {
            for (var sExisitingProfileId in oCreatedProfiles) {
                if (sExisitingProfileId !== sProfileId) oCreatedProfiles[sExisitingProfileId].active = false;
            }
        }

        this.#saveToStorage(createdProfilesStorageKey, oCreatedProfiles);
        console.log("Saved config: " + sProfileId);
    }
}
