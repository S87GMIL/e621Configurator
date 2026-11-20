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
        let postResponse = await this.#performRequest(`/posts/${postID}.json?mode=extended`);
        if (!postResponse)
            throw Error(`No post with the ID '${postID}' could be found!`);

        // The current API returns the post directly. Keep support for legacy v1
        // responses in case another page or cache requests them.
        return postResponse.post || postResponse;
    }

    async getUserSets() {
        const activeProfile = ProfileStorage.getActiveProfile();
        if (!activeProfile || !activeProfile.getUsername())
            throw Error("No username was set for the currently active profile!");

        if (!this.userSets || this.userSets.length === 0) {
            const username = encodeURIComponent(activeProfile.getUsername());
            this.userSets = await this.#performRequest(`/post_sets.json?search[creator_name]=${username}`);
        }

        return this.userSets;
    }

    async getSet(setID) {
        let set = this.userSets.filter(set => { return set.id === Number(setID) || set.id === setID })[0];
        if (set)
            return set;

        set = await this.#performRequest(`/post_sets/${setID}.json`);

        if (!set)
            throw Error(`No set with the ID '${setID}' exists!'`);

        this.userSets.push(set);

        return set;
    }

    async getPostsBySetName(shortName) {
        let set = this.userSets.filter(set => { return set.shortname === shortName || set.shortName === shortName })[0];
        if (set && Array.isArray(set.posts))
            return set.posts;

        const response = await this.#performRequest(`/posts.json?mode=extended&tags=set:${encodeURIComponent(shortName)}`);
        return Array.isArray(response) ? response : (response.posts || []);
    }

    async getSetTagsByName(setShortname) {
        let response = await this.getPostsBySetName(setShortname);
        return this.getPostTags(response);
    }

    async getSetTags(setID) {
        let bufferedSet = DataBuffer.getBufferData(`setTags${setID}`);
        if (bufferedSet)
            return bufferedSet;

        let set = await this.getSet(setID);
        const shortname = set.shortname || set.shortName;

        let setTags = {
            id: setID,
            shortName: shortname,
            name: set.name,
            tagCategories: {},
            totalPosts: set.post_count
        };

        //Only evaluate sets with more than 5 posts
        if (set.post_count < 5)
            return setTags;

        const setPosts = await this.#performRequest(`/posts.json?mode=extended&tags=set:${encodeURIComponent(shortname)}`);
        const posts = Array.isArray(setPosts) ? setPosts : (setPosts.posts || []);

        setTags.totalPosts = posts.length;

        let tagCategories = this.getPostTags(posts);
        delete tagCategories.postAmount;

        setTags.tagCategories = tagCategories;

        if (posts.length > 0)
            DataBuffer.addDataToBuffer(`setTags${setID}`, setTags, set.post_count > 10 ? 30 : 5);

        return setTags;
    }

    getPostTags(posts) {
        let tagCategories = {};

        posts.forEach(post => {
            if (Array.isArray(post.tags)) {
                if (!tagCategories.general)
                    tagCategories.general = {};

                post.tags.forEach(tag => {
                    const categoryTags = tagCategories.general;
                    categoryTags[tag] = (categoryTags[tag] || 0) + 1;
                });
                return;
            }

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