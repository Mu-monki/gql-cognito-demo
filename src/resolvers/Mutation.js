
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../service/auth';

const Mutation = {

    async createUser(parent, args, { db }, info) {
        let user;
        let cognitoUser;
        const emailTaken = db.users.some((user) => {
            return user.email === args.data.email;
        });

        if(emailTaken) {
            throw new Error('Email Taken.');
        }

        cognitoUser = await AuthService.createCognitoUser(args.data.email, args.data.tempPassword, args.data)
                        .then(res => {
                            const { tempPassword, ...userData } = args.data;

                            console.log('creating cognito user..', JSON.stringify(res, null, 4));
                            console.log('userdata', userData);
                            console.log('temp password', tempPassword);

                            user = {
                                id: uuidv4(),
                                ...userData
                            }

                            // Save Service User on DB
                            db.users.push(user); 
                            console.log('created service user', user);
                            return user;
                        })
                        .catch(error => {
                            console.log('creation failed', error);
                        });
        return user;
    },

    async confirmSignup(parent, args, { db, token }, info) {
        const { data } = args;

        const result = await AuthService.confirmSignUp(data.email, data.code)
            .then(res => {
                console.log('confirm signup', res);

                // Change User Account status here.

                return res;
            })
            .catch(error => {
                console.log('error confirm signup', error);
            });
        
        if(result) {
            return true;
        } else {
            return false;
        }
    },

    updateUser(parent, args, { db }, info) {
        const { id, data } = args;
        const user = db.users.find((user) => {
            return user.id === id;
        });

        if(!user) {
            throw new Error('No user found');
        }

        if(typeof data.email === 'string') {
            const emailTaken = db.users.some((user) => {
                user.email === data.email;
            });
            if(emailTaken) {
                throw new Error('Email is already taken.');
            }

            user.email = data.email;
        }

        if(typeof data.firstName === 'string') {
            user.firstName = data.firstName;
        }

        if(typeof data.lastName === 'string') {
            user.lastName = data.lastName;
        }

        if(typeof data.age !== 'undefined') {
            user.age = data.age;
        }

        return user;
    },

    async disableUser(parent, args, { db }, info) {
        const result = await AuthService.disableCognitoUser(args.email)
                            .then((result) => {

                                // Update User Account Status here

                                return result;
                            });
        if(result) {
            return true;
        } else {
            return false;
        }
    },

    async deleteUser(parent, args, {db}, info) {
        const result = await AuthService.deleteCognitoUser(args.email)
                            .then((result) => {
                                // Delete Service User here

                                return result;
                            });
        if(result) {
            return true;
        } else {
            return false;
        }
    },

    // deleteUser(parent, args, { db }, info) {
    //     const userIndex = db.users.findIndex((user) => {
    //         return user.id === args.id;
    //     })

    //     if(userIndex === -1) {
    //         throw new Error('User does not exist.');
    //     }

    //     const deletedUsers = db.users.splice(userIndex, 1);

    //     db.posts = db.posts.filter((post) => {
    //         const match = post.author === args.id;

    //         if(match) {
    //             db.comments = db.comments.filter((comment) => {
    //                 return comment.post !== post.id;
    //             })
    //         }

    //         return !match;
    //     });

    //     db.comments = db.comments.filter((comment) => {
    //         return comment.author !== args.id;
    //     });

    //     return deletedUsers[0];
    // },

    createPost(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some((user) => {
            return user.id === args.data.author;
        });

        if(!userExists) {
            throw new Error('User not Found');
        }

        const post = {
            id: uuidv4(),
            ...args.data

            // title: args.title,
            // body: args.body,
            // published: args.published,
            // author: args.author,
        };

        db.posts.push(post);
        if(post.published) {
            pubsub.publish(`POST`, { 
                post: {
                    mutation: 'CREATED',
                    data: post,
                }
            });
        }

        return post;    
    },

    updatePost(parent, args, { db, pubsub }, info) {
        const { id, data } = args;
        const post = db.posts.find((post) => {
            return post.id === id;
        });
        const originalPost = { ...post };

        if(!post) {
            throw new Error('Post not found.');
        }

        if(typeof data.title === 'string') {
           post.title = data.title; 
        }
        if(typeof data.body === 'string') {
            post.body = data.body; 
        }
        if(typeof data.published === 'boolean') {
            post.published = data.published; 

            if(originalPost.published && !post.published) {
                // deleted
                pubsub.publish('POST', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost,
                    }
                });
            } else if (!originalPost.published && post.published) {
                // created
                pubsub.publish('POST', {
                    post: {
                        mutation: 'CREATED',
                        data: post,
                    }
                });
            }
        } else if(post.published) {
            // updated
            pubsub.publish('POST', {
                post: {
                    mutation: 'UPDATED',
                    data: post,
                }
            });
        }

        return post;
    },

    deletePost(parent, args, { db, pubsub }, info) {
        const postIndex = db.posts.findIndex((post) => {
            return post.id === args.id;
        });

        if(postIndex === -1) {
            throw new Error('Post does not exist');
        }

        const [post] = db.posts.splice(postIndex, 1);

        db.comments = db.comments.filter((comment) => {
            return comment.post !== args.id;
        });

        if(post.published) {
            pubsub.publish('POST', {
                post: {
                    mutation: "DELETED",
                    data: post,
                }
            });
        }

        return post;
    },

    createComment(parent, args, { db, pubsub }, info) {
        const postExists = db.posts.some((post) => {
            return post.id === args.data.post && post.published;
        });
        const userExists = db.users.some((user) => {
            return user.id === args.data.author;
        });

        if(!postExists) {
            throw new Error('Post does not exist.');
        }

        if(!userExists) {
            throw new Error('User does not exist');
        }

        const comment = {
            id: uuidv4(),
            ...args.data
            // body: args.body,
            // published: args.published,
            // author: args.author,
            // post: args.post,
        }

        db.comments.push(comment);
        pubsub.publish(`COMMENT ${args.data.post}`, { 
            comment: {
                mutation: 'CREATED',
                data: comment,
            }
         });

        return comment;
    },
    
    updateComment(parent, args, { db, pubsub }, info) {
        const { id, data } = args;
        const comment = db.comments.find((comment) => {
            return comment.id === id;
        });

        if(!comment) {
            throw new Error('Comment not found.');
        }

        typeof data.body === 'string'? comment.body = data.body: '';
        typeof data.published === 'boolean'? comment.published = data.published: '';

        pubsub.publish(`COMMENT ${comment.post}`, {
            comment: {
                mutation: 'UPDATE',
                data: comment,
            }
        })

        return comment;
    },

    deleteComment(parent, args, { db, pubsub }, info) {
        const commentIndex = db.comments.findIndex((comment) => {
            return comment.id === args.id;
        });

        if(commentIndex === -1){
            throw new Error('Comment does not exist.');
        }

        const [comment] = db.comments.splice(commentIndex, 1);
        console.log('MARKER');
        console.log(comment.id);

        pubsub.publish(`COMMENT ${comment.post}`, {
            comment: {
                mutation: 'DELETE',
                data: comment,
            }
        });

        return comment;
    }
};

export { Mutation as default };