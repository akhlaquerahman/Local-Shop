const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CUSTOMER', 'SELLER', 'DELIVERY_PARTNER', 'SUPER_ADMIN'], required: true },
  status: { type: String, enum: ['ACTIVE', 'PENDING_VERIFICATION', 'PENDING_KYC', 'SUSPENDED'], required: true },
  kycStatus: { type: String, enum: ['VERIFIED', 'PENDING', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
  bankStatus: { type: String, enum: ['VERIFIED', 'PENDING', 'FAILED', 'INVALID'], default: 'PENDING' },
  isVerified: { type: Boolean, default: false },
  referralCode: String,
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shopName: String,
  businessType: String,
  gstNumber: String,
  vehicleType: String,
  dob: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  avatarUrl: { type: String },
  serviceAreas: [{
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincodes: [{ type: String }],
    radiusKm: { type: Number, min: 1, max: 50, default: 5 },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  }]
}, { timestamps: true });

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
