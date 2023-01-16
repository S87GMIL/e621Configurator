class SuggestionHelper {

    constructor() {
        if (SuggestionHelper._instance)
            throw new Error("Singleton classes can't be instantiated more than once.")

        SuggestionHelper._instance = this;

        this.suggestionBuffer = {};
    }

    static getInstance() {
        if (!SuggestionHelper._instance)
            SuggestionHelper._instance = new SuggestionHelper();

        return SuggestionHelper._instance;
    }

    async suggestSets(postID) {

        if (this.suggestionBuffer[postID])
            return this.suggestionBuffer[postID];


        let apiHelper = APIHelper.getInstance();

        let post = await apiHelper.getPost(postID);
        let setTagMatches = [];

        let userSets = await apiHelper.getUserSets();

        let setTagResults = [];
        await this.#getTagsForSets(userSets, 0, setTagResults);

        setTagResults.forEach(setTags => {
            let matchedTags = [];
            let matchScore = 0;

            for (let tagCategory in post.tags) {

                post.tags[tagCategory].forEach(tag => {
                    let setCategoryTags = setTags.tagCategories[tagCategory];

                    if (setCategoryTags) {

                        let tagAmount = setCategoryTags[tag];
                        if (tagAmount) {
                            matchScore += 1 * tagAmount / setTags.totalPosts;
                            matchedTags.push(tag);
                        }
                    }
                });
            }

            /*setTags.importantTags.forEach(importantTag => {
                if (matchedTags.includes(importantTag))
                    matchScore += 2;
            });*/

            setTagMatches.push({
                id: setTags.id,
                shortName: setTags.shortName,
                name: setTags.name,
                matchScore: matchScore,
                matchedTags: matchedTags
            });
        });

        let setSuggestions = setTagMatches.sort((a, b) => {
            return b.matchScore - a.matchScore;
        });

        this.suggestionBuffer[postID] = setSuggestions;

        return setSuggestions;
    }

    async #getTagsForSets(sets, index, setTags) {
        let apiHelper = APIHelper.getInstance();

        if (!sets[index])
            return setTags;

        let tags = await apiHelper.getSetTags(sets[index].id);
        setTags.push(tags);

        await this.#getTagsForSets(sets, index + 1, setTags);
    }

    async getImportantSetTags(setShortName) {
        let apiHelper = APIHelper.getInstance();
        let tagCategories = await apiHelper.getSetTagsByName(setShortName);
        let importantTags = [];

        for (let category in tagCategories) {
            for (let tag in tagCategories[category]) {
                let tagCount = tagCategories.general[tag];
                if (tagCount / tagCategories.postAmount > 0.75)
                    importantTags.push(tag);
            };
        }

        return importantTags;
    }
}