class OfflineSetHelper {
    CUSTOM_SET_KEY_PREFIX = "customSet_";

    constructor() {
        if (OfflineSetHelper._instance)
            throw new Error("Singleton classes can't be instantiated more than once.")

        OfflineSetHelper._instance = this;

        this.offlineSets = {};
    }


    static getInstance() {
        if (!OfflineSetHelper._instance)
            OfflineSetHelper._instance = new OfflineSetHelper();

        return OfflineSetHelper._instance;
    }

    #createUserSetsKey() {
        return this.CUSTOM_SET_KEY_PREFIX + UIHelper.getCurrentUserID();
    }

    getOfflineSets() {
        if (!this.offlineSets || Object.keys(this.offlineSets).length === 0)
            this.offlineSets = Window.S87OfflineSetAPI?.getUserSets() || [];

        return Object.keys(this.offlineSets).map(key => {
            return { id: this.offlineSets[key].setId, setId: key, isOfflineSet: true }
        });
    }

    getSetTags(setId) {
        const tagCategories = {};

        const set = this.offlineSets[setId];
        const posts = set?.posts || [];
        posts.forEach(post => {
            for (const tagCategory in post.tags) {
                if (!tagCategories[tagCategory])
                    tagCategories[tagCategory] = {};

                post.tags[tagCategory].forEach(tag => {
                    const setCategoryTags = tagCategories[tagCategory];
                    const tagTotal = setCategoryTags[tag] || 0;

                    setCategoryTags[tag] = tagTotal + 1;
                });
            }
        });

        set.tagCategories = tagCategories;
        set.tagCategories.postAmount = posts.length;
        set.totalPosts = posts.length;
        set.id = set.setId;
        set.name = set.label;
        set.shortName = set.setId;

        return set;
    }

}