class SuggestionHelper {

    static async suggestSets(postID) {
        let apiHelper = APIHelper.getInstance();

        let post = await apiHelper.getPost(postID);
        let setTagMatches = [];

        let userSets = await apiHelper.getUserSets();

        let setTagResults = [];
        await this.#getTagsForSets(userSets, 0, setTagResults);

        setTagResults.forEach(setTags => {
            let matchedTags = [];

            let importantTagMatches = post.tags.general.filter(tag => {
                if (setTags.general[tag]){
                    matchedTags.push(tag);
                    return true;
                }

                return false;
            }).length;

            setTagMatches.push({
                id: setTags.id,
                shortName: setTags.shortName,
                name: setTags.name,
                importantTagMatches: importantTagMatches,
                matchedTags: matchedTags
            });
        });

        let setSuggestions = setTagMatches.sort((a, b) => {
            return b.importantTagMatches - a.importantTagMatches;
        });

        setSuggestions = setSuggestions.filter(tagMatches => {
            return tagMatches.importantTagMatches > 3;
        });

        return setSuggestions;
    }

    static async #getTagsForSets(sets, index, setTags) {
        let apiHelper = APIHelper.getInstance();

        if (!sets[index])
            return setTags;

        let tags = await apiHelper.getSetTags(sets[index].id);
        setTags.push(tags);

        await this.#getTagsForSets(sets, index + 1, setTags);
    }
}