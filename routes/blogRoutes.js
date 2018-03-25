const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.json(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id
    });

    res.json(blogs);
  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content, imageUrl } = req.body;

    const blog = new Blog({
      imageUrl,
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.json(blog);
    } catch (err) {
      res.json(400, err);
    }
  });

  app.put('/api/blogs/:id', requireLogin, cleanCache, async (req, res) => {
    try {
      const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });

      res.json(blog);
    } catch (err) {
      res.json(400, err);
    }
  });

  app.delete('/api/blogs/:id', requireLogin, cleanCache, async (req, res) => {
    try {
      const blog = await Blog.findByIdAndRemove(req.params.id);

      res.json(blog);
    } catch (err) {
      res.json(400, err);
    }
  });
};
