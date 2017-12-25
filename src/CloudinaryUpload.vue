<template>
    <section class="cloudinary-upload">
        <div class="cloudinary-upload__wrapper">
            <div v-for="file in list" :key="file.name">
                <img 
                    class="cloudinary-upload__thumb cloudinary-upload__thumb--uploaded"
                    :src="getSrc(file)" 
                    :alt="getAlt(file)"
                    @click="switchDetails($event, file)"
                >
            </div>
            <label class="cloudinary-upload__addFiles">
                <input 
                    type="file" 
                    name="photos" 
                    multiple 
                    ref="fileInput" 
                    @change="showPreview" 
                >
            </label>    
        </div>
        <button @click.prevent="startUpload">submit</button>
        <transition name="fade">
            <section 
                class="cloudinary-upload__img-details" 
                :style="{ top: this.detailsTop }"
                v-if="activeFile"
            >
                <img 
                    class="cloudinary-upload__img-details-thumb"
                    :src="getSrc(activeFile)" 
                    :alt="getAlt(activeFile)"
                >
                <div 
                    class="cloudinary-upload__img-details-info"
                >
                    <input class="cloudinary-upload__input" :value="activeFile.public_id">
                    <button class="cloudinary-upload__button" @click="deleteItem">Удалить</button>
                </div>
            </section>
        </transition>
    </section>
</template>

<script>
    import { buildCloudinaryURL, parseCloudinaryURL, onLoadEnd } from './utils'
    import axios from 'axios'

    export default {
        data: () => ({
            list: null,
            detailsTop: null,
            activeFile: null
        }),
        props: {
            cloudName: String,
            presetName: String
        },
        computed: {
            CLOUDINARY_RETRIEVE_URL () {
                return `http://res.cloudinary.com/${this.cloudName}/image/upload`
            },
            CLOUDINARY_UPLOAD_URL () {
                return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`
            }
        },
        methods: {
            getSrc (file) {
                return `${this.CLOUDINARY_RETRIEVE_URL}/${file.public_id}.${file.format}`
            },
            getAlt (file) { return 'Татуировка в Рязани' },
            showPreview () {
                const files = Array.from(this.$refs.fileInput.files)

                files.forEach((file) => {
                    const reader = new FileReader()

                    reader.onloadend = e => onLoadEnd(e, file.name)
    
                    reader.readAsDataURL(file)
                })
            },
            startUpload () {
                // Upload a file to Cloudinary
                let formData,
                    image
                const files = Array.from(this.$refs.fileInput.files)

                function xhrComplete (ev) {
                    let response

                    // Check the request is complete
                    if (+ev.target.readyState !== 4) {
                        return
                    }

                    // Handle the result of the upload
                    if (parseInt(ev.target.status, 10) === 200) {
                        // Unpack the response (from JSON)
                        response = JSON.parse(ev.target.responseText)

                        // Store the image details
                        image = {
                            angle: 0,
                            height: parseInt(response.height, 10),
                            maxWidth: parseInt(response.width, 10),
                            width: parseInt(response.width, 10)
                        }

                        // Apply a draft size to the image for editing
                        image.filename = parseCloudinaryURL(response.url, this.CLOUDINARY_RETRIEVE_URL)
                        image.url = buildCloudinaryURL(
                            image.filename,
                            [{ c: 'fit', h: 600, w: 600 }],
                            this.CLOUDINARY_RETRIEVE_URL
                        )

                        // Populate the dialog
                        console.log(image)
                    } else {
                        // The request failed, notify the user
                        console.error('hell no!')
                    }
                }

                files.forEach((file) => {
                    // Build the form data to post to the server
                    formData = new FormData()
                    formData.append('file', file)
                    formData.append('upload_preset', this.presetName)
                    formData.append('public_id', `${file.name}`)

                    const currentProgressBar = document.querySelector(`[data-name="${file.name}"]`).nextElementSibling

                    // Make the request
                    const xhr = new XMLHttpRequest()
                    xhr.addEventListener('progress', (ev) => {
                        currentProgressBar.style.width = `${(ev.loaded / ev.total) * 100}%`
                    })
                    xhr.addEventListener('readystatechange', xhrComplete)
                    xhr.open('POST', this.CLOUDINARY_UPLOAD_URL)
                    xhr.send(formData)
                })
            },
            switchDetails (event, file) {
                let isLevelTheSame
                const isItCurrentFile = this.activeFile &&
                    this.activeFile.public_id === file.public_id
                const img = event.target
                if (!isItCurrentFile && this.activeFile) {
                    const { bottom } = img.getBoundingClientRect()
                    const prevImg = document.querySelector(`[src="${this.getSrc(this.activeFile)}"]`)
                    isLevelTheSame = bottom === prevImg.getBoundingClientRect().bottom
                    const delay = isLevelTheSame ? 300 : 0
                    setTimeout(() => prevImg.classList.remove('active'), delay)
                }
                img.classList.toggle('active')
                if (!isLevelTheSame) { this.activeFile = null }
                setTimeout(() => {
                    const { bottom } = img.getBoundingClientRect()
                    this.detailsTop = `${bottom + 5}px`
                    this.activeFile = isItCurrentFile ? null : file
                }, 300)
            },
            deleteItem() {
                axios.post('/api/delete', {
                    files: [this.activeFile.public_id]
                })
                .catch(function (error) {
                    console.log(error);
                }); 
            }
        },
        mounted () {
            window.onresize = () => {
                const img = document.querySelector('.active')
                if (img) {
                    const { bottom } = img.getBoundingClientRect()
                    this.detailsTop = `${bottom + 5}px`
                }
            }
            const xhr = new XMLHttpRequest()
            xhr.addEventListener('readystatechange', (ev) => {
                if (ev.target.readyState !== 4) { return }
                const response = JSON.parse(ev.target.responseText)
                this.list = response.resources
            })
            xhr.open('GET', 'http://res.cloudinary.com/drwukl5fv/image/list/uploaded.json?tags=true')
            xhr.send()
        }
    }
</script>

<style lang="scss">
    .cloudinary-upload {
        margin: 20px;
        position: relative;

        &__wrapper {
            display: flex;
            flex-wrap: wrap;
            margin: 0 10px 20px 0;  
            border-bottom: 1px solid gray;   
        }

        &__thumb {
            height: 100px;
            background-color: #fff;
            opacity: .4;
            transition: all .3s;

            &.active {
                margin-bottom: 350px !important;
            }

            &--uploaded {
                margin: 0 10px 10px 0;
                opacity: 1;
            }
        }

        &__img-details {
            height: 300px;
            position: absolute;
            padding: 20px 0;
            left: 0;
            right: 0;
            display: flex;
            flex-wrap: wrap;
            overflow: auto;
            background-color: gray;

            &-thumb {
                height: 260px;
                margin: 0 50px 0 20px;
            }

        }

        &__addFiles {
            background-color: gray;
            width: 100px;
            height: 100px;

            input {
                display: none;
            }
        }

        &__upload-wrapper {
            position: relative;
            margin: 0 10px 10px 0;
        }

        &__progress-bar {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            transition: all .3s;
        }
    }

    .progress-bar {
        background-color: green;
        height: 10px;
        width: 0;
        transition: all .3s;
    }

    .fade-enter-active, .fade-leave-active {
        transition: all .2s
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
        height: 0;
        opacity: 0;
    }
</style>