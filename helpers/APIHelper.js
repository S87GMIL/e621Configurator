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
        let sets = await this.getUserSets();

        let set = sets.filter(set => {
            return set.id === setID;
        })[0];

        if (!set)
            throw Error(`No set with the ID '${setID}' exists!'`);

        return set;
    }

    async getSetTags(setID) {
        if (this.setTags[setID])
            return this.setTags[setID];

        this.setTags[setID] = {
            id: setID,
            general: new Set(),
            species: new Set(),
            lore: new Set()
        };

        let setTags = this.setTags[setID];

        let set = await this.getSet(setID);
        let setPosts = await this.#performRequest(`/posts.json?tags=set:${set.shortname}`);

        setPosts.posts.forEach(post => {
            post.tags.general.forEach(tag => {
                setTags.general.add(tag);
            });

            post.tags.species.forEach(tag => {
                setTags.species.add(tag);
            });

            post.tags.lore.forEach(tag => {
                setTags.lore.add(tag);
            });
        });

        return this.setTags[setID]
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