const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

const uploadDir = '/images/';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./public${uploadDir}`)
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
});

exports.upload = multer({
    limits: { fileSize: 2500000 },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            req.fileValidationError = 'Forbidden Extension';
            return cb(null, false, req.fileValidationError)
            // return cb(new Error('Please upload a JPG/JPEG/PNG File'));

        }
        cb(undefined, true)
    },
    storage: storage,
    dest: uploadDir
});
