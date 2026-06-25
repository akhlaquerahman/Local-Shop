const Blog = require('../../models/Blog');

exports.getAllBlogs = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    
    const stats = {
      total: await Blog.countDocuments(),
      published: await Blog.countDocuments({ status: 'PUBLISHED' }),
      drafts: await Blog.countDocuments({ status: 'DRAFT' })
    };

    res.json({ success: true, data: blogs, stats });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const blogData = { ...req.body, author: req.user._id };
    if (blogData.status === 'PUBLISHED' && !blogData.publishedAt) {
      blogData.publishedAt = new Date();
    }
    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (blogData.status === 'PUBLISHED') {
      const existingBlog = await Blog.findById(req.params.id);
      if (existingBlog && existingBlog.status !== 'PUBLISHED') {
        blogData.publishedAt = new Date();
      }
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, blogData, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
