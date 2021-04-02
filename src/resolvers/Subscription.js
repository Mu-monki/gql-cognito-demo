const Subscription = {
    comment: {
        subscribe(parent, { postId }, { db, pubsub }, info) {
            let post = db.posts.find((post) => {
                return post.id === postId && post.published;
            });

            if(!post) {
                throw new Error('Post not found');
            }

            return pubsub.asyncIterator(`COMMENT ${postId}`);
        }
    },

    post: {
        subscribe(parent, args, {db, pubsub}, info) {
            return pubsub.asyncIterator(`POST`);
        }
    }
}

export { Subscription as default };