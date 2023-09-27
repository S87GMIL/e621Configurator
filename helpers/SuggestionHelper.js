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
        let postTags = [];
        for (let tagCategory in post.tags) {
            postTags = postTags.concat(post.tags[tagCategory]);
        }

        let weightedSets = DataBuffer.getBufferData("weightedSets");
        weightedSets = weightedSets ? weightedSets.weightedSets : null;

        if (!weightedSets) {
            let userSets = await apiHelper.getUserSets();
            weightedSets = this.calculateTagWeighting(userSets);

            DataBuffer.addDataToBuffer("weightedSets", {
                weightedSets: weightedSets
            });
        }

        let similarityScores = weightedSets.map((set) => {
            const weightedTags = set.weightedTags;
            let similarity = 0;

            let postTags = [];
            for (let tagCategory in post.tags) {
                postTags = postTags.concat(post.tags[tagCategory]);
            }

            // Calculate the similarity score using a similarity metric (e.g., cosine similarity)
            for (let tag in weightedTags) {
                if (postTags.includes(tag)) {
                    similarity += weightedTags[tag];
                } else {
                    if (set.definingTags.includes(tag))
                        similarity -= weightedTags[tag];
                }
            };

            return {
                id: set.id,
                shortName: set.shortName,
                name: set.name,
                score: similarity,
                definingTags: set.definingTags
            };
        });

        // Find the most fitting set
        similarityScores = similarityScores.sort((a, b) => b.score - a.score); // Sort in descending order
        this.suggestionBuffer[postID] = similarityScores;

        for (let i = 0; i < 6; i++) {
            console.log(`Set: ${similarityScores[i].shortName} Score: ${similarityScores[i].score}, Defining: ${similarityScores[i].definingTags.toString()}`)
        }

        return similarityScores;
    }

    async getImportantSetTags(setShortName) {
        let apiHelper = APIHelper.getInstance();
        let tagCategories = await apiHelper.getSetTagsByName(setShortName);
        let importantTags = [];

        for (let categoryName in tagCategories) {
            let category = tagCategories[categoryName];
            for (let tag in category) {
                let tagCount = category[tag];
                if (tagCount / tagCategories.postAmount > 0.75)
                    importantTags.push(tag);
            };
        }

        return importantTags;
    }

    calculateTagWeighting(postSets) {
        console.log("Transforming data ...");
        var startTime = performance.now();

        // Calculate term frequency (TF) matrix
        const tfMatrix = {};
        postSets.forEach((set) => {
            tfMatrix[set.shortName] = {};
            for (let tag in set.tags) {
                tfMatrix[set.shortName][tag] = set.tags[tag];
            };
        });

        // Calculate document frequency (DF) for each tag
        const df = {};
        postSets.forEach((set) => {
            for (let tag in set.tags) {
                if (df[tag]) {
                    df[tag]++;
                } else {
                    df[tag] = 1;
                }
            };
        });

        // Calculate inverse document frequency (IDF) for each tag
        const totalSets = postSets.length;
        const idf = {};
        for (const tag in df) {
            idf[tag] = Math.log(totalSets / df[tag]);
        }

        // Calculate TF-IDF score for each tag within each set
        const tfidfScores = {};
        postSets.forEach((set) => {
            set.definingTags = [];

            const setName = set.shortName;
            tfidfScores[setName] = {};
            for (let tag in set.tags) {
                const tf = tfMatrix[setName][tag];
                const idfScore = idf[tag];
                tfidfScores[setName][tag] = tf * idfScore

                //Defining tags should 
                if (tf / set.totalPosts > 0.75)
                    set.definingTags.push(tag);
            };
        });

        var endTime = performance.now()
        console.log(`Data transfomration and preparation completed! Runtime: ${(endTime - startTime) / 1000} sec.`);

        postSets.forEach(postSet => {
            postSet.weightedTags = tfidfScores[postSet.shortName];
            //console.log(`${postSet.shortName} - ${postSet.definingTags.toString()}`)
        });

        return postSets;
    }
}