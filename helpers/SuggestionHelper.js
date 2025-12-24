class SuggestionHelper {

    static IMPORTANT_TF_THRESHOLD = 0.7;
    static CENTRALITY_THRESHOLD = 0.5;
    static MIN_IMPORTANT_IDF = 0.15;
    static COMMON_TAG_DF_RATIO = 0.95;
    static MISSING_IMPORTANT_PENALTY_STRENGTH = 0.6;

    constructor() {
        if (SuggestionHelper._instance)
            throw new Error("Singleton classes can't be instantiated more than once.");

        SuggestionHelper._instance = this;

        this.idfCache = null;
        this.setVectors = {};
        this.setMagnitudes = {};
        this.importantTags = {};
        this.tagToSets = {};
        this.setMeta = {};
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

        const apiHelper = APIHelper.getInstance();
        const post = await apiHelper.getPost(postID);

        await this.#ensureSetData();

        const postVector = this.#buildPostVector(post.tags);
        const postMagnitude = this.#vectorMagnitude(postVector);

        if (postMagnitude === 0)
            return this.suggestionBuffer[postID] = [];

        const candidateSets = new Set();
        for (const tag in postVector) {
            if (this.tagToSets[tag]) {
                for (const setId of this.tagToSets[tag])
                    candidateSets.add(setId);
            }
        }

        const results = [];

        for (const setId of candidateSets) {
            const similarity =
                this.#cosineSimilarityWithMagnitude(
                    postVector,
                    postMagnitude,
                    this.setVectors[setId],
                    this.setMagnitudes[setId]
                );

            if (similarity <= 0)
                continue;

            const penalty =
                this.#missingImportantTagPenalty(
                    postVector,
                    this.importantTags[setId]
                );

            const score = similarity * (1 - penalty);

            if (score > 0) {
                results.push({
                    id: setId,
                    ...this.setMeta[setId],
                    score
                });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return this.suggestionBuffer[postID] = results;
    }

    async #ensureSetData() {
        if (this.idfCache)
            return;

        const apiHelper = APIHelper.getInstance();
        const offlineSetHelper = OfflineSetHelper.getInstance();
        const offlineSets = offlineSetHelper.getOfflineSets();
        const userSets = offlineSets.concat(await apiHelper.getUserSets());

        const allSetTags = [];
        const tagDocumentCount = {};
        const globallyImportantTags = new Set();

        for (const set of userSets) {
            const tags = set.isOfflineSet ? offlineSetHelper.getSetTags(set.setId) : await apiHelper.getSetTags(set.id);
            allSetTags.push(tags);

            this.setMeta[set.id] = {
                name: tags.name,
                shortName: tags.shortName,
                isOfflineSet: !!set.isOfflineSet
            };

            const counts = [];
            for (const cat in tags.tagCategories)
                for (const tag in tags.tagCategories[cat])
                    counts.push(tags.tagCategories[cat][tag]);

            const maxTagCount = Math.max(...counts);

            for (const category in tags.tagCategories) {
                for (const tag in tags.tagCategories[category]) {
                    const count = tags.tagCategories[category][tag];
                    const tf = count / tags.totalPosts;
                    const centrality = count / maxTagCount;

                    tagDocumentCount[tag] =
                        (tagDocumentCount[tag] || 0) + 1;

                    if (
                        tf >= SuggestionHelper.IMPORTANT_TF_THRESHOLD ||
                        centrality >= SuggestionHelper.CENTRALITY_THRESHOLD
                    ) {
                        globallyImportantTags.add(tag);
                    }
                }
            }
        }

        const totalSets = allSetTags.length;
        this.idfCache = {};

        for (const tag in tagDocumentCount) {
            const dfRatio = tagDocumentCount[tag] / totalSets;

            if (
                dfRatio >= SuggestionHelper.COMMON_TAG_DF_RATIO &&
                !globallyImportantTags.has(tag)
            ) continue;

            this.idfCache[tag] = Math.max(
                0,
                Math.log(totalSets / (1 + tagDocumentCount[tag]))
            );
        }

        for (const setTags of allSetTags) {
            const { vector, important } =
                this.#buildSetVector(setTags);

            this.setVectors[setTags.id] = vector;
            this.setMagnitudes[setTags.id] =
                this.#vectorMagnitude(vector);
            this.importantTags[setTags.id] = important;

            for (const tag in vector) {
                if (!this.tagToSets[tag])
                    this.tagToSets[tag] = new Set();
                this.tagToSets[tag].add(setTags.id);
            }
        }
    }

    #buildSetVector(setTags) {
        const vector = {};
        const important = new Map();
        const totalPosts = setTags.totalPosts;

        const counts = [];
        for (const cat in setTags.tagCategories)
            for (const tag in setTags.tagCategories[cat])
                counts.push(setTags.tagCategories[cat][tag]);

        const maxTagCount = Math.max(...counts);

        for (const category in setTags.tagCategories) {
            for (const tag in setTags.tagCategories[category]) {
                const count = setTags.tagCategories[category][tag];
                const tf = count / totalPosts;
                const centrality = count / maxTagCount;

                let weight = 0;
                if (tf >= SuggestionHelper.IMPORTANT_TF_THRESHOLD)
                    weight = 1.0;
                else if (centrality >= SuggestionHelper.CENTRALITY_THRESHOLD)
                    weight = 0.6;

                if (weight > 0)
                    important.set(tag, weight);

                let idf = this.idfCache[tag] ?? 0;
                if (weight > 0)
                    idf = Math.max(idf, SuggestionHelper.MIN_IMPORTANT_IDF);

                if (idf > 0)
                    vector[tag] = tf * idf;
            }
        }

        return { vector, important };
    }

    #buildPostVector(postTags) {
        const vector = {};

        for (const category in postTags) {
            for (const tag of postTags[category]) {
                let idf = this.idfCache[tag] ?? 0;

                if (idf > 0 || this.#isIdentityTag(tag))
                    vector[tag] = Math.max(idf, SuggestionHelper.MIN_IMPORTANT_IDF);
            }
        }

        return vector;
    }

    #isIdentityTag(tag) {
        for (const setId in this.importantTags) {
            if (this.importantTags[setId]?.has(tag))
                return true;
        }
        return false;
    }

    #missingImportantTagPenalty(postVector, importantTagWeights) {
        if (!importantTagWeights || importantTagWeights.size === 0)
            return 0;

        let totalWeight = 0;
        let missingWeight = 0;

        for (const [tag, weight] of importantTagWeights) {
            totalWeight += weight;
            if (!postVector[tag])
                missingWeight += weight;
        }

        const ratio = missingWeight / totalWeight;

        return 1 - Math.exp(
            -SuggestionHelper.MISSING_IMPORTANT_PENALTY_STRENGTH * ratio
        );
    }

    #cosineSimilarityWithMagnitude(a, magA, b, magB) {
        let dot = 0;
        for (const tag in a)
            if (b[tag]) dot += a[tag] * b[tag];
        return magA && magB ? dot / (magA * magB) : 0;
    }

    #vectorMagnitude(vec) {
        let sum = 0;
        for (const v of Object.values(vec))
            sum += v * v;
        return Math.sqrt(sum);
    }

    invalidateCache() {
        this.idfCache = null;
        this.setVectors = {};
        this.setMagnitudes = {};
        this.importantTags = {};
        this.tagToSets = {};
        this.suggestionBuffer = {};
    }
}
