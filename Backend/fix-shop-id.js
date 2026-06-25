const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'modules', 'seller');

const filesToUpdate = [
  'seller.analytics.controller.js',
  'seller.controller.js',
  'seller.finance.controller.js',
  'seller.marketing.controller.js',
  'seller.reviews.controller.js',
  'seller.settings.controller.js',
  'seller.staff.controller.js'
];

const newGetSellerShopId = `const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};`;

filesToUpdate.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace old getSellerShopId definition
    content = content.replace(
      /const getSellerShopId = async \(userId\) => \{\s*const user = await User\.findById\(userId\);\s*if \(!user \|\| !user\.shopId\) throw new Error\('Seller shop not found'\);\s*return user\.shopId;\s*\};/g,
      newGetSellerShopId
    );

    // Replace getSellerShopId calls
    content = content.replace(/getSellerShopId\(req\.user\.id \|\| req\.user\._id\)/g, 'getSellerShopId(req.user)');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
