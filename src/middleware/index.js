const stream = require('stream')
const cloudinary = require('cloudinary')
const router = require('express').Router()
const multer = require('multer')

module.exports = (name, key, secret) => {
    cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: secret
    })
    
    var storage = require('./cloudinaryStorage')({ cloudinary })
    const upload = multer({ storage })

    router.get('/api/getResourses', async (req, res) => {
        cloudinary.v2.api.resources({ tags: true, context: true, prefix: req.query.folder && `${req.query.folder}/`, type: 'upload' }, (error, result) => {
            if (error) res.status(500).send(error);
            console.log(result);
            if (result) {
                result.resources = result.resources.map(item => {
                    item.isUploaded = true
                    item.id = item.public_id
                    item.alt = item.context && item.context.custom && item.context.custom.alt 
                    return item
                })
            }
            res.json(result)
        });
    })

    router.post('/api/upload', upload.single('photo'), async (req, res) => {
        req.file.isUploaded = true
        req.file.id = req.file.public_id
        req.file.alt = req.file.context && req.file.context.custom && req.file.context.custom.alt 
        res.json(req.file)
    })

    router.post('/api/delete', async (req, res) => {
        cloudinary.v2.api.delete_resources(req.body.files,
            (error, result) => {
                console.log(result)
                console.log(error)
                res.send(result)
            });
    })

    return router
}
