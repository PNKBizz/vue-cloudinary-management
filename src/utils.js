export function buildCloudinaryURL (filename, transforms, url) {
    // Build a Cloudinary URL from a filename and the list of transforms
    // supplied. Transforms should be specified as objects (e.g {a: 90} becomes
    // 'a_90').
    let i,
        name,
        transform,
        transformArgs,
        transformPaths,
        urlParts

    // Convert the transforms to paths
    transformPaths = []
    for (i = 0; i < transforms.length; i++) {
        transform = transforms[i]

        // Convert each of the object properties to a transform argument
        transformArgs = []
        for (name in transform) {
            if (transform.hasOwnProperty(name)) {
                transformArgs.push(`${name}_${transform[name]}`)
            }
        }

        transformPaths.push(transformArgs.join(','))
    }

    // Build the URL
    urlParts = [url]
    if (transformPaths.length > 0) {
        urlParts.push(transformPaths.join('/'))
    }
    urlParts.push(filename)

    return urlParts.join('/')
}

export function parseCloudinaryURL (url, cloudinaryUrl) {
    // Parse a Cloudinary URL and return the filename and list of transforms
    let filename,
        i,
        j,
        transform,
        transformArgs,
        transforms,
        urlParts

    // Strip the URL down to just the transforms, version (optional) and
    // filename.
    url = url.replace(cloudinaryUrl, '')

    // Split the remaining path into parts
    urlParts = url.split('/')

    // The path starts with a '/' so the first part will be empty and can be
    // discarded.
    urlParts.shift()

    // Extract the filename
    filename = urlParts.pop()

    // Strip any version number from the URL
    if (urlParts.length > 0 && urlParts[urlParts.length - 1].match(/v\d+/)) {
        urlParts.pop()
    }

    // Convert the remaining parts into transforms (e.g `w_90,h_90,c_fit >
    // {w: 90, h: 90, c: 'fit'}`).
    transforms = []
    for (i = 0; i < urlParts.length; i++) {
        transformArgs = urlParts[i].split(',')
        transform = {}
        for (j = 0; j < transformArgs.length; j++) {
            transform[transformArgs[j].split('_')[0]] =
                transformArgs[j].split('_')[1]
        }
        transforms.push(transform)
    }

    return filename
}

export function createSign (params) {
    const paramsToSign = []

        ['public_id', 'timestamp'].forEach((key) => {
            if (params[key]) {
                paramsToSign.push(`${key}=${params[key]}`)
            }
        })

    const shasum = crypto.createHash('sha1')
    shasum.update(paramsToSign.sort().join('&') + params.apiSecret)
    return shasum.digest('hex')
}

export function onLoadEnd (e, name) {
    const previewSection = document.querySelector('.cloudinary-upload__wrapper')
    const wrapper = document.createElement('div')
    const progressBar = document.createElement('div')
    const addBtn = document.querySelector('.cloudinary-upload__addFiles')
    const img = document.createElement('img')
    wrapper.classList.add('cloudinary-upload__upload-wrapper')
    progressBar.classList.add('cloudinary-upload__progress-bar')
    progressBar.style.backgroundImage = `url(${e.target.result})`
    progressBar.style.backgroundSize = 'cover'
    img.setAttribute('src', e.target.result)
    img.setAttribute('data-name', name)
    img.classList.add('cloudinary-upload__thumb')
    wrapper.appendChild(img)
    wrapper.appendChild(progressBar)
    previewSection.insertBefore(wrapper, addBtn)
}
