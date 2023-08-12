// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const axios = require('axios');
// Create express app
const app = express();
// Use body parser
app.use(bodyParser.json());
// Create comments object
const commentsByPostId = {};
// Create route for getting comments for a post
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});
// Create route for creating comments for a post
app.post('/posts/:id/comments', async (req, res) => {
    // Create comment id
    const commentId = randomBytes(4).toString('hex');
    // Get content and save to comments object
    const { content } = req.body;
    const comments = commentsByPostId[req.params.id] || [];
    comments.push({ id: commentId, content, status: 'pending' });
    commentsByPostId[req.params.id] = comments;
    // Send event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: { id: commentId, content, postId: req.params.id, status: 'pending' },
    });
    // Send response
    res.status(201).send(comments);
});
// Create route for receiving events
app.post('/events', async (req, res) => {
    console.log('Event received:', req.body.type);
    const { type, data } = req.body;
    if (type === 'CommentModerated') {
        const { id, postId, status, content } = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => comment.id === id);
        comment.status = status;
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: { id, postId, status, content },
        });
    }
    res.send({});
});
// Listen on port 4001
app.listen(4001, () => {
    console.log('Listening on port 4001');
});