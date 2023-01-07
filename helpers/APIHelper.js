var instance = null;

class APIHelper {

    constructor() {
        if (instance)
            return instance;

        this.userSets = [];
        this.setTags = {};

        this.setPostTagCheckAmount = 20;
    }

    getInstance() {
        if (!instance)
            instance = new APIHelper();

        return instance;
    }

    async getPost(postID) {
        let post = await this.#performRequest.#performRequest(`/posts/${postID}.json`);
        if (!post)
            throw Error(`No post with the ID '${postID}' could be found!`);

        return post;
    }

    async getUserSets() {
        let activeSet = ProfileStorage.getActiveProfile();
        if (!activeSet || !activeSet.getUsername())
            throw Error("No username was set for the currently active profile!");

        if (!this.userSets)
            this.userSets = await this.#performRequest.#performRequest(`/post_sets.json?commit=Search&search[creator_name]=${activeSet.getUsername()}`);

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
            general: new Set(),
            species: new Set(),
            lore: new Set()
        };

        let setTags = this.setTags[setID];

        let set = await this.getSet(setID);

        for (let index = 0; index < this.setPostTagCheckAmount; index++) {
            let postId = set.post_ids[index];

            let post = await this.getPost(postId);

            post.tags.general.forEach(tag => {
                setTags.general.add();
            });

            post.tags.species.forEach(tag => {
                setTags.species.add();
            });

            post.tags.lore.forEach(tag => {
                setTags.lore.add();
            });
        }

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
        return new Promise(resolve, reject => {

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