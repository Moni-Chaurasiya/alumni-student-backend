const cloudinary = require('cloudinary').v2;

const uploadFileOnCloudinary = async (file, folder, height, quality) => {
  try {
    if (!file || !folder) {
      return null;
    }

    const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
    const sanitizedFileName = fileNameWithoutExtension.replace(/\s+/g, '_'); 
    const options = {
      folder,
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto', 
      type: 'upload',
    };
    if (file.mimetype === 'application/pdf') {
       options.public_id= sanitizedFileName;
    }
    if (height) {
      options.height = height;
    }
    if (quality) {
      options.quality = quality;
    }

    const result= await cloudinary.uploader.upload(file.tempFilePath, options);
    return result

  } catch (error) {
    console.log('Error while Uploading file on cloudinary', error);
    process.exit(1);
  }
};

module.exports = uploadFileOnCloudinary;
