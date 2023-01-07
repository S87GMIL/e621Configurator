class SuggestionHelper {

    static async suggestSets(postID) {
        let apiHelper = APIHelper.getInstance();

        let post = await apiHelper.getPost(postID);
        let setTagMatches = [];

        let userSets = await apiHelper.getUserSets();

        userSets.forEach(set => {
            if (!set.post_ids.includes(postID)) {

                let setTags = await apiHelper.getSetTags(set.id);

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
                    id: set.id,
                    matchingTags: matches
                });

            }
        });

        let setSuggestions = setTagMatches.sort((a, b) => {
            return a.matchingTags - b.matchingTags;
        });

        setSuggestions = setSuggestions.filter(tagMatches => {
            return tagMatches.matchingTags > 4;
        });

        return setSuggestions;
    }
}