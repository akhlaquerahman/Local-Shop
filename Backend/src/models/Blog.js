const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming Admin user
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  views: {
    type: Number,
    default: 0
  },
  // SEO Metadata
  metaTitle: {
    type: String,
    trim: true,
    maxLength: 60
  },
  metaDescription: {
    type: String,
    trim: true,
    maxLength: 160
  },
  keywords: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-generate slug before saving if not provided
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

blogSchema.index({ status: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model('Blog', blogSchema);
