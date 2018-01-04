const stream = require('stream')
const cloudinary = require('cloudinary')
const router = require('express').Router()
const multer = require('multer')

module.exports = (name, key) => {
    cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: 'kUsBB8J7G8HGYGLRq_UJVvw40Z0'
    })
    
    var storage = require('./cloudinaryStorage')({ cloudinary })
    const upload = multer({ storage })

    router.get('/api/getResourses', async (req, res) => {
        cloudinary.v2.api.resources({ tags: true }, (error, result) => res.json(result));
    })

    router.post('/api/upload', upload.single('photo'), async (req, res) => {
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
