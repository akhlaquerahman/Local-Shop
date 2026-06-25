const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_9zSYG6o9CfOQ1H381K9A69/FoOE=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_GRVUtTgoTJWpluAlS+RmavrcS7Q=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/default'
});

exports.uploadService = {
  /**
   * Upload a file buffer to ImageKit
   * @param {Buffer} buffer - The file buffer
   * @param {string} fileName - Original file name or desired name
   * @param {string} folder - Destination folder on ImageKit (e.g. '/kyc')
   * @returns {Promise<Object>} ImageKit upload response containing url and fileId
   */
  uploadFile: async (buffer, fileName, folder = '/') => {
    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer, // can be base64, url, or buffer
          fileName: fileName || `file_${Date.now()}`,
          folder: folder,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
  },

  /**
   * Delete a file from ImageKit
   * @param {string} fileId - The ImageKit file ID
   */
  deleteFile: async (fileId) => {
    return new Promise((resolve, reject) => {
      imagekit.deleteFile(fileId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
};
