class CloudinaryStorage {
    constructor(cloudinary) {
        this.cloudinary = cloudinary
    }

    _handleFile(req, file, cb) {
        console.log(req.body);
        const params = { 
            public_id: req.body.public_id || '',
            context: { alt: req.body.alt || '' },
            tags: req.body.tags || '',
            folder: req.body.folder || ''
        }
        const stream = this.cloudinary.v2.uploader.upload_stream(params, cb)

        file.stream.pipe(stream)
    }

    _removeFile(req, file, cb) {
        console.log('remove');
    }
}

module.exports = function ({ cloudinary } = {}) {
    return new CloudinaryStorage(cloudinary)
}