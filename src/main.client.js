import CloudinaryUpload from './CloudinaryUpload.vue'

const install = function (Vue) {
    Vue.component('cloudinary-upload', CloudinaryUpload)
}

CloudinaryUpload.install = install

export default CloudinaryUpload
