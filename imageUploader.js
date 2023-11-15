const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dxh6exmbu",
  api_key: "481222471517727",
  api_secret: "xBItYhwm79mUGE_Ehk3S5giOHTo",
});

const imageUploader = async (file) => {
  var imageURI = null;
  if (file) {
    const { buffer, mimetype } = file;
    const b64 = Buffer.from(buffer).toString("base64");
    const imageData = "data:" + mimetype + ";base64," + b64;
    imageURI = await cloudinary.uploader.upload(imageData, {
      resource_type: "auto",
      upload_preset: "ml_default",
      folder: "foodee",
    });
  }

  return imageURI?.secure_url;
};

module.exports = imageUploader;
