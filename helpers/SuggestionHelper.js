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
            let matchScore = 0;

            for (let tagCategory in post.tags) {

                post.tags[tagCategory].forEach(tag => {
                    let tagAmount = setTags[tagCategory][tag];
                    if (tagAmount && tagAmount > 5) {
                        matchScore += 1 * tagAmount / setTags.totalPosts;
                        matchedTags.push(tag);
                    }
                });
            }

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