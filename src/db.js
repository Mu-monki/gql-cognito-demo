let users = [
// {
//     id: '1234',
//     firstName: 'Francis',
//     lastName: 'Garcia',
//     email: 'francis@email.com',
// }, {
//     id: '2345',
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john@email.com',
// }, {
//     id: '3456',
//     firstName: 'James',
//     lastName: 'Bond',
//     email: 'james@email.com',
// }
];

let posts = [{
    id: '54321',
    title: 'Sample Post 2',
    body: 'Sample Post Body 2',
    published: true,
    author: '1234'
}, {
    id: '65432',
    title: 'Sample Post 11',
    body: 'Sample Post Body 11',
    published: true,
    author: '2345'
}, {
    id: '76543',
    title: 'Sample Post 21',
    body: 'Sample Post Body 21',
    published: true,
    author: '3456'
}, {
    id: '87654',
    title: 'Sample Post 112',
    body: 'Sample Post Body 112',
    published: true,
    author: '1234'
}];

let comments = [{
    id: '1',
    body: 'This is a comment 1',
    author: '1234',
    post: '54321',
    published: true,
}, {
    id: '2',
    body: 'This is a comment 2',
    author: '1234',
    post: '54321',
    published: true,
}, {
    id: '3',
    body: 'This is a comment 3',
    author: '2345',
    post: '54321',
    published: true,
}];


const db = {
    users,
    posts,
    comments
};

export { db as default };