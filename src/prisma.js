import { Prisma } from 'prisma-binding';
import { config } from './config';

export const prisma = new Prisma({
    typeDefs: config.prisma.TYPEDEFS,
    endpoint: config.prisma.ENDPOINT,
});

// prisma.query.users(null, '{ id, firstName, lastName, email }')
//     .then((data) => {
//         console.log('users', data);
//     })
//     .catch((err) => {
//         console.log('error', err);
//     });

// prisma.mutation.updatePost({
//     where: {
//         id: ""
//     },
//     data: {

//     }
// });