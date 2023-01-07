class SuggestionHelper {

    static async suggestSets(postID) {
        let apiHelper = APIHelper.getInstance();

        let post = await apiHelper.getPost(postID);
        let setTagMatches = [];

        let userSets = await apiHelper.getUserSets();

        let setTagResults = [];
        await this.#getTagsForSets(userSets, 0, setTagResults);

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
            return b.matchingTags - a.matchingTags;
        });

        setSuggestions = setSuggestions.filter(tagMatches => {
            return tagMatches.matchingTags > 10;
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