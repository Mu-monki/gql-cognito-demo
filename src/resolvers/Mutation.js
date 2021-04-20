
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../service/auth';
import { prisma } from '../prisma';
import { USER_OPTIONS } from '../constants/users';

const Mutation = {

    async createUser(parent, args, { db }, info) {
        let user;
        let cognitoUser;

        const { tempPassword, ...userData } = args.data;
        const emailTaken = db.users.some((user) => {
            return user.email === args.data.email;
        });

        if(emailTaken) {
            throw new Error('Email Taken.');
        }

        cognitoUser = await AuthService.createCognitoUser(args.data.email, args.data.tempPassword, args.data)
                        .then(async (res) => {
                            console.log('creating cognito user..', JSON.stringify(res, null, 4));
                            console.log('userdata', userData);
                            console.log('temp password', tempPassword);

                            user = {
                                id: uuidv4(),
                                ...userData
                            }
                        })
                        .catch(error => {
                            console.log('creation failed', error);
                        });
        
        // // Save Service User via Prisma
        console.log('data for prisma', userData);
        return prisma.mutation.createUser({
            data: {
                ...userData
            }
        }, '{ id, firstName, middleName, lastName, email, accountStatus, contact, contactVerified, address, gender }')
        .then(res => {
            console.log('res', res);
            return res;
        })
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
        console.log('disable user called');
        const result = await AuthService.disableCognitoUser(args.email)
                            .then((result) => {

                                // Find User Account Status here
                                prisma.query.user({
                                    where: {
                                        email: args.email
                                    }
                                })
                                .then(data => {
                                    // Update User Account Status here
                                    prisma.mutation.updateUser({
                                        where: {
                                            email: args.email
                                        },
                                        data: {
                                            accountStatus: USER_OPTIONS.ACCOUNT_STATUSES.DISABLED
                                        }
                                    });
                                });
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

                                // Find User Objects in Prisma
                                const user = prisma.query.user({
                                    where: {
                                        email:args.email
                                    }
                                }).then(data => {
                                    console.log('user found', data);
                                    // Delete Service User here
                                    prisma.mutation.deleteUser(data.id)
                                        .catch(err => {
                                            console.log('something went wrong', err);
                                        });
                                    return true;
                                }).catch(err => {
                                    console.log('error', err)
                                });

                                return result;
                            });
        if(result) {
            return true;
        } else {
            return false;
        }
    },

    async setCognitoGroup(email, role) {
        return AuthService.setCognitoGroup(email, role);
    },

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