import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const Query = {
    users(parent, args, { db }, info) {
        if(args.query) {
            return db.users.filter((user) => {
                return user.firstName.toLowerCase().includes(args.query.toLowerCase());
            });
        } else {
            return prisma.query.users(null, '{ id, firstName, middleName, lastName, email, accountStatus, contact, contactVerified, address, gender }')
                .then(data => {
                    console.log('prisma', data)
                    return data;
                });
        }
    },

    checkUserToken(parent, args, { db }, info) {    
        const token = args.token;

        console.log(token);
    },

    posts(parent, args, { db }, info) {
        if(args.query) {
            return db.posts.filter((post) => {
                if(post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())) {
                    return post;
                }
            });
        } else {
            return db.posts;
        }
    },

    comments(parent, args, { db }, info) {
        return db.comments;
    },

    onlyForAdmin(parent, args, ctx, info) {
        return 'This is only for ADMINS';
    },

    onlyForTeamLeaders(parent, args, ctx, info) {
        return 'This is only for TEAM LEADERS';
    },

    onlyForRosterManagers(parent, args, ctx, info) {
        return 'This is only for ROSTER MANAGERS';
    },

    onlyForSupportWorkers(parent, args, ctx, info) {
        return 'This is only for SUPPORT WORKERS';
    },
}

export { Query as default };