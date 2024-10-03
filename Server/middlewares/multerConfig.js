const multer = require('multer');
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/video_proof');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null,`${Date.now()}.${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only video files with .mp4, .mov, .avi, or .mkv extensions are allowed!"));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
 });

module.exports = upload;