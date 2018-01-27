<template>
    <section class="cloudinary-upload">
        <div class="cloudinary-upload__wrapper">
            <div class="cloudinary-upload__thumb-wrapper" v-for="file in list" :key="file.id" :ref="file.name">
                <div 
                    class="cloudinary-upload__progress-bar"
                    :style="{ backgroundImage: `url(${file.url})` }"
                    v-if="!file.isUploaded"
                ></div>
                <img 
                    :class="['cloudinary-upload__thumb', {'cloudinary-upload__thumb--uploaded': file.isUploaded}]"
                    v-lazy="file.url"
                    :alt="file.alt"
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
                v-if="isActiveFileNotEmpty"
            >
                <img 
                    :src="activeFile.url"
                    class="cloudinary-upload__img-details-thumb"
                    :alt="activeFile.alt"
                >
                <div 
                    class="cloudinary-upload__img-details-info"
                >
                    <label>
                        Public ID
                        <input class="cloudinary-upload__input" v-model="activeFile.public_id">
                    </label>
                    <label>
                        Tags
                        <input class="cloudinary-upload__input" v-model="activeFile.tags">
                    </label>
                    <label>
                        Alt
                        <input class="cloudinary-upload__input" v-model="activeFile.alt">
                    </label>
                    <button class="cloudinary-upload__button" @click="deleteItem">Удалить</button>
                </div>
            </section>
        </transition>
    </section>
</template>

<script>
    import axios from 'axios'
    import lazy from './directives/lazy'

    export default {
        data: () => ({
            list: null,
            detailsTop: null,
            activeFile: {}
        }),
        computed: {
            isActiveFileNotEmpty() { return !!this.activeFile.url }
        },
        methods: {
            showPreview () {
                const files = Array.from(this.$refs.fileInput.files)

                files.forEach((file) => {
                    const reader = new FileReader()

                    reader.onloadend = e => this.list.push({ 
                        url: e.target.result,
                        name: file.name,
                        id: Math.random(),
                        file
                    })
    
                    reader.readAsDataURL(file)
                })
            },
            startUpload () {
                const files = this.list.filter(item => !item.isUploaded)

                files.forEach(file => {
                    let formData = new FormData()
                    formData.append('public_id', this.activeFile.public_id || '')
                    formData.append('alt', this.activeFile.alt || '')
                    formData.append('tags', this.activeFile.tags || '')
                    formData.append('photo', file.file)
                    
                    const currentProgressBar = this.$refs[file.name][0].firstChild

                    axios.post('/api/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress(ev) {
                            currentProgressBar.style.width = `${(ev.loaded / ev.total) * 100}%`
                        }
                    }).then((res) => {
                        this.activeFile = {}
                        this.list = this.list.filter(item => item.isUploaded)
                        this.list.push(res.data)
                    })
                })
            },
            switchDetails (event, file) {
                let isLevelTheSame
                const isItCurrentFile = this.isActiveFileNotEmpty &&
                    this.activeFile.public_id === file.public_id
                const img = event.target
                const target = this.$refs[file.name] ? this.$refs[file.name][0] : img
                if (!isItCurrentFile && this.isActiveFileNotEmpty) {
                    const { bottom } = img.getBoundingClientRect()
                    const prevImg = this.activeFile.isUploaded ? 
                        document.querySelector(`[src="${this.activeFile.url}"]`) :
                        this.$refs[this.activeFile.name] && this.$refs[this.activeFile.name][0]
                    isLevelTheSame = bottom === prevImg.getBoundingClientRect().bottom
                    const delay = isLevelTheSame ? 300 : 0
                    setTimeout(() => prevImg.classList.remove('active'), delay)
                }
                target.classList.toggle('active')
                if (!isLevelTheSame) { this.activeFile = {} }
                setTimeout(() => {
                    const { bottom } = img.getBoundingClientRect()
                    this.detailsTop = `${bottom + 5}px`
                    this.activeFile = isItCurrentFile ? {} : file
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
        directives: { lazy },
        mounted () {
            window.onresize = () => {
                const img = document.querySelector('.active')
                if (img) {
                    const { bottom } = img.getBoundingClientRect()
                    this.detailsTop = `${bottom + 5}px`
                }
            }

            axios.get('/api/getResourses')
                .then(res => this.list = res.data.resources)
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
            width: 100px;
            background-color: #fff;
            opacity: .4;
            transition: all .3s;
            object-fit: cover;

            &.active {
                margin-bottom: 350px !important;
            }

            &-wrapper {
                position: relative;
                width: 100px;
                height: 100%;
                margin: 0 10px 10px 0;

                &.active {
                    margin-bottom: 350px !important;
                }
            }

            &--uploaded {
                opacity: 0;
                transition: .5s opacity;

                &[src] {
                    opacity: 1;
                }
            }
        }

        &__img-details {
            height: 300px;
            position: fixed;
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

            &-info {
                label {
                    display: block;
                }
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
            background-size: cover;
            background-position: center;
            position: absolute;
            z-index: 99;
            top: 0;
            left: 0;
            bottom: 0;
            transition: all .3s;
        }
    }

    .fade-enter-active, .fade-leave-active {
        transition: all .2s
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
        height: 0;
        opacity: 0;
    }
</style>