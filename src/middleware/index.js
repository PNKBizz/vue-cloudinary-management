const cloudinary = require('cloudinary')
const router = require('express').Router()
const upload = require('multer')()

module.exports = (name, key) => {
    cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: 'kUsBB8J7G8HGYGLRq_UJVvw40Z0'
    })

    router.post('/api/upload', upload.array('photos'), async (req, res) => {
        const array = req.files.map((file, i) => {
            const tmpPath = file.path
            return cloudinary.v2.uploader.upload(
                tmpPath, { use_filename: true },
                (error, result) => {
                    console.log(result)
                    console.log(error)
                }
            )
        })
        await Promise.all(array)
        res.send('Success')
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
