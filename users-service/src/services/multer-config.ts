import multer from "multer";
const path = require("path");

const imageMimeTypes = ["image/jpeg", "image/png"];

const imageStorage = multer.diskStorage({
    destination(req, file, callback) {
        if(imageMimeTypes.includes(file.mimetype)) {
            callback(null, path.join(__dirname, "../temp"));
        }
        else {
            callback(new Error("Invalid image"), "")
        }
    },
    filename(req, file, callback) {
        callback(null, Math.floor((Math.random()*100)) + "_" + file.originalname);
    },

})

export default multer({storage: imageStorage});