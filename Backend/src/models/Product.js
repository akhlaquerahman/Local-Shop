const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  compareAtPrice: { type: Number },
  discount: { type: Number },
  imageUrl: { type: String },
  category: { type: String },
  subCategory: { type: String },
  brand: { type: String },
  sku: { type: String },
  stock: { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 10 },
  weight: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'DRAFT'], default: 'ACTIVE' },
  images: [{ type: String }],
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shopName: { type: String },
  isFeatured: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  cartAdds: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Product', ProductSchema);

