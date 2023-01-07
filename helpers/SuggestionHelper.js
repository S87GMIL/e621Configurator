class SuggestionHelper {

    static async suggestSets(postID) {
        let apiHelper = APIHelper.getInstance();

        let post = await apiHelper.getPost(postID);
        let setTagMatches = [];

        let userSets = await apiHelper.getUserSets();

        let setTagResults = await this.#getTagsForSets(userSets, 0);

        setTagResults.forEach(setTags => {
            let matches = post.tags.general.filter(tag => {
                return setTags.general.has(tag);
            }).length;

            matches += post.tags.species.filter(tag => {
                return setTags.species.has(tag);
            }).length;

            matches += post.tags.lore.filter(tag => {
                return setTags.lore.has(tag);
            }).length;

            setTagMatches.push({
                id: setTags.id,
                matchingTags: matches
            });
        });

        let setSuggestions = setTagMatches.sort((a, b) => {
            return a.matchingTags - b.matchingTags;
        });

        setSuggestions = setSuggestions.filter(tagMatches => {
            return tagMatches.matchingTags > 4;
        });

        return setSuggestions;
    }

    static async #getTagsForSets(sets, index) {
        let apiHelper = APIHelper.getInstance();
        let setTags = [];

        if (!sets[index + 1])
            return setTags;

        let tags = await apiHelper.getSetTags(sets[index].id);
        setTags.concat(tags);

        setTags.concat(this.#getTagsForSets(sets, index + 1));
    }
}