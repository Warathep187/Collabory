import multer from "multer";
const path = require("path");

const imageStorage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, path.join(__dirname, "../temp"));
    },
    filename(req, file, callback) {
        callback(null, Math.floor((Math.random()*100)) + "_" + file.originalname);
    },

})

export default multer({storage: imageStorage});