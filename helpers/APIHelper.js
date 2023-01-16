class APIHelper {

    constructor() {
        if (APIHelper._instance)
            throw new Error("Singleton classes can't be instantiated more than once.")

        APIHelper._instance = this;

        this.userSets = [];
        this.setTags = {};

        this.setPostTagCheckAmount = 10;
    }


    static getInstance() {
        if (!APIHelper._instance)
            APIHelper._instance = new APIHelper();

        return APIHelper._instance;
    }

    async getPost(postID) {
        let postRespose = await this.#performRequest(`/posts/${postID}.json`);
        if (!postRespose)
            throw Error(`No post with the ID '${postID}' could be found!`);

        return postRespose.post;
    }

    async getUserSets() {
        let activeProfile = ProfileStorage.getActiveProfile();
        if (!activeProfile || !activeProfile.getUsername())
            throw Error("No username was set for the currently active profile!");

        if (!this.userSets || this.userSets.length === 0)
            this.userSets = await this.#performRequest(`/post_sets.json?commit=Search&search[creator_name]=${activeProfile.getUsername()}`);

        return this.userSets;
    }

    async getSet(setID) {
        let set = this.userSets.filter(set => { return set.id === setID })[0];
        if (set)
            return set;

        set = await this.#performRequest(`/post_sets.json?commit=Search&search[id]=${setID}`);

        if (!set)
            throw Error(`No set with the ID '${setID}' exists!'`);

        this.userSets.push(set);

        return set;
    }

    async getPostsBySetName(shortName) {
        let set = this.userSets.filter(set => { return set.shortName === shortName })[0];
        if (set)
            return set.posts;

        return await this.#performRequest(`/posts.json?tags=set:${shortName}`);
    }

    async getSetTagsByName(setShortname) {
        let posts = await this.getPostsBySetName(setShortname);
        return this.getPostTags(posts);
    }

    async getSetTags(setID) {
        let bufferedSet = DataBuffer.getBufferData(`setTags${setID}`);
        if (bufferedSet)
            return bufferedSet;

        let set = await this.getSet(setID);

        let setTags = {
            id: setID,
            shortName: set.shortname,
            name: set.name,
            tagCategories: {},
            totalPosts: set.post_count
        };

        //Only evaluate sets with more than 5 posts
        if (set.post_count < 5)
            return setTags;

        let setPosts = await this.#performRequest(`/posts.json?tags=set:${set.shortname}`);

        setTags.totalPosts = setPosts.posts.length;

        let tagCategories = this.getPostTags(setPosts.posts);
        delete tagCategories.postAmount;

        setTags.tagCategories = tagCategories;

        if (setPosts.posts.length > 0)
            DataBuffer.addDataToBuffer(`setTags${setID}`, setTags, set.post_count > 10 ? 30 : 5);

        return setTags;
    }

    getPostTags(posts) {
        let tagCategories = {};

        posts.forEach(post => {
            for (let tagCategory in post.tags) {
                if (!tagCategories[tagCategory])
                    tagCategories[tagCategory] = {};

                post.tags[tagCategory].forEach(tag => {
                    let setCategoryTags = tagCategories[tagCategory];
                    let tagTotal = setCategoryTags[tag] || 0;

                    setCategoryTags[tag] = tagTotal + 1;
                });
            }
        });

        tagCategories.postAmount = posts.length;
        return tagCategories;
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
                data: body,
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