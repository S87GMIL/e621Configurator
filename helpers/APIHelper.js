var instance = null;

class APIHelper {

    constructor() {
        if (instance)
            return instance;

        this.userSets;
        this.setTags = {};

        this.setPostTagCheckAmount = 10;
    }

    static getInstance() {
        if (!instance)
            instance = new APIHelper();

        return instance;
    }

    async getPost(postID) {
        let postResposen = await this.#performRequest(`/posts/${postID}.json`);
        if (!postResposen)
            throw Error(`No post with the ID '${postID}' could be found!`);

        return postResposen.post;
    }

    async getUserSets() {
        let activeSet = ProfileStorage.getActiveProfile();
        if (!activeSet || !activeSet.getUsername())
            throw Error("No username was set for the currently active profile!");

        if (!this.userSets)
            this.userSets = await this.#performRequest(`/post_sets.json?commit=Search&search[creator_name]=${activeSet.getUsername()}`);

        return this.userSets;
    }

    async getSet(setID) {
        let bufferedSet = DataBuffer.getBufferData(`sets${setID}`);
        if (bufferedSet)
            return bufferedSet;

        let sets = await this.getUserSets();

        let set = sets.filter(set => {
            return set.id === setID;
        })[0];

        if (!set)
            throw Error(`No set with the ID '${setID}' exists!'`);

        return set;
    }

    async getSetTags(setID) {
        let bufferedSet = DataBuffer.getBufferData(`setTags${setID}`);
        if (bufferedSet)
            return bufferedSet;

        let set = await this.getSet(setID);
        let setPosts = await this.#performRequest(`/posts.json?tags=set:${set.shortname}`);

        let setTags = {
            id: setID,
            shortName: set.shortname,
            name: set.name,
            general: {},
            importantTags: {},
            species: {},
            lore: {},
            totalPosts: setPosts.posts.length
        };

        setPosts.posts.forEach(post => {
            post.tags.general.forEach(tag => {
                let total = setTags.general[tag] || 0;
                setTags.general[tag] = total + 1;
            });

            post.tags.species.forEach(tag => {
                let total = setTags.species[tag] || 0;
                setTags.species[tag] = total + 1;
            });

            post.tags.lore.forEach(tag => {
                let total = setTags.lore[tag] || 0;
                setTags.lore[tag] = total + 1;
            });
        });

        for (let tag in setTags.general) {
            let amount = setTags.general[tag];
            if (amount / setPosts.posts.length < 0.45)
                delete setTags.general[tag];

            if (amount / setPosts.posts.length > 0.9)
                importantTags[tag] = amount;
        }


        for (let tag in setTags.species) {
            let amount = setTags.species[tag];
            if (amount / setPosts.posts.length < 0.8)
                delete setTags.species[tag];
        }

        for (let tag in setTags.lore) {
            let amount = setTags.lore[tag];
            if (amount / setPosts.posts.length < 0.7)
                delete setTags.lore[tag];
        }

        DataBuffer.addDataToBuffer(`setTags${setID}`, setTags, 30);

        return setTags;
    }

    async getPostTags(postID) {
        return await this.#performRequest();
    }

    addPostToSet(setId, postId) {
        return this.#performRequest(`/post_sets/${setId}/add_posts.json`, "POST", {
            post_ids: [postId]
        });
    }

    #performRequest(requestPath, method = "GET", body = {}) {
        return new Promise((resolve, reject) => {

            if (requestPath.substring(0, 1) !== "/")
                requestPath = "/" + requestPath;

            let host = document.location.origin;
            $.ajax({
                type: method,
                url: host + requestPath,
                data: JSON.stringify(body),
                success: resolve,
                error: error => {
                    reject(error);
                    this.#handleError(error);
                }
            });

        });
    }

    #handleError(error) {

    }

}