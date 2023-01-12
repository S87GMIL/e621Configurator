class APIHelper {

    constructor() {
        if (APIHelper._instance)
            throw new Error("Singleton classes can't be instantiated more than once.")

        APIHelper._instance = this;

        this.userSets;
        this.setTags = {};

        this.setPostTagCheckAmount = 10;
    }


    static getInstance() {
        if (!APIHelper._instance)
            APIHelper._instance = new APIHelper();

        return APIHelper._instance;
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
            tagCategories: {},
            importantTags: [],
            totalPosts: setPosts.posts.length
        };

        setPosts.posts.forEach(post => {
            for (let tagCategory in post.tags) {
                if (!setTags.tagCategories[tagCategory])
                    setTags.tagCategories[tagCategory] = {};

                post.tags[tagCategory].forEach(tag => {
                    let setCategoryTags = setTags.tagCategories[tagCategory];
                    let tagTotal = setCategoryTags[tag] || 0;

                    setCategoryTags[tag] = tagTotal + 1;
                });
            }
        });


        setTags.tagCategories.forEach(category => {
            let tagAmounts = setTags.tagCategorie[category];
            for (let tag in tagAmounts) {
                let amount = tagAmounts[tag];

                if (amount / setTags.totalPosts > 0.9)
                    importantTags.push(tag);
            }
        });


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