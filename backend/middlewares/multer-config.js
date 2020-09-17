const multer = require("multer");

const MIME_TYPES = {
    "image/jpg" : "jpg",
    "image/jpeg" : "jpg",
    "image/png" : "png",
    "image/webp" : "webp"
};

const storage = multer.diskStorage({
    destination : (req, file, callback) => {
        callback(null, "images");
    },
    filename : (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        if(extension === undefined){
            console.log("MIME_TYPE non pris en charge.");
        }
        else{
            callback(null, name + Date.now() + "." + extension);
        };
    }
});

module.exports = multer({storage}).single("image");