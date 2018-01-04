class CloudinaryStorage {
    constructor(cloudinary) {
        this.cloudinary = cloudinary
    }

    _handleFile(req, file, cb) {
        console.log(req.body);
        const params = { 
            context: {alt: req.body.alt},
            tags: req.body.tags
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