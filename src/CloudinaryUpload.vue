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
        <button @click.prevent="startUpload" class="cloudinary-upload-button">Upload</button>
        <transition name="fade">
            <section 
                class="cloudinary-upload__img-details"
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
                        <input class="cloudinary-upload-input" v-model="activeFile.public_id">
                    </label>
                    <label>
                        Tags
                        <input class="cloudinary-upload-input" v-model="activeFile.tags">
                    </label>
                    <label>
                        Alt
                        <input class="cloudinary-upload-input" v-model="activeFile.alt">
                    </label>
                    <button class="cloudinary-upload-button" @click="deleteItem">Delete</button>
                    <button class="cloudinary-upload-button" @click="updateItem" v-if="activeFile.isUploaded">Update</button>
                </div>
                <div 
                    class="get get-prev"
                    v-if="activeFileIndex !== 0"
                    @click="activeFile = list[activeFileIndex - 1]"
                >
                    &lt;
                </div>
                <div 
                    class="get get-next"
                    v-if="(activeFileIndex + 1) < list.length"
                    @click="activeFile = list[activeFileIndex + 1]"
                >
                    &gt;
                </div>
                <div class="close-btn" @click="activeFile = {}">X</div>
            </section>
        </transition>
        <div class="overlay" v-if="isActiveFileNotEmpty"></div>
    </section>
</template>

<script>
    import axios from 'axios'
    import lazy from './directives/lazy'

    export default {
        data: () => ({
            list: null,
            activeFile: {}
        }),
        props: {
            folder: {
                type: String,
                default: ''
            }
        },
        computed: {
            isActiveFileNotEmpty() { return !!this.activeFile.url },
            activeFileIndex() { return this.list.indexOf(this.activeFile) }
        },
        methods: {
            getResourses() {
                axios.get(`/api/getResourses?folder=${this.folder}`)
                .then(res => this.list = res.data.resources)
            },
            updateList() {
                this.activeFile = {};
                this.getResourses();
            },
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
                let promiseArray = [];
                const files = this.list.filter(item => !item.isUploaded)

                files.forEach(file => {
                    let formData = new FormData()
                    formData.append('public_id', file.public_id || '')
                    formData.append('alt', file.alt || '')
                    formData.append('tags', file.tags || '')
                    formData.append('folder', this.folder || '')
                    formData.append('photo', file.file)
                    
                    const currentProgressBar = this.$refs[file.name][0].firstChild

                    promiseArray.push(axios.post('/api/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress(ev) {
                            currentProgressBar.style.width = `${(ev.loaded / ev.total) * 100}%`
                        }
                    }));
                });

                Promise.all(promiseArray).then(() => {
                    this.updateList();
                })
            },
            switchDetails (event, file) {
                this.activeFile = file;
            },
            deleteItem() {
                if (this.activeFile.isUploaded) {
                        axios.post('/api/delete', {
                        files: [this.activeFile.public_id]
                    })
                    .then(this.updateList)
                    .catch(function (error) {
                        console.log(error);
                    });
                } else {
                    this.list = this.list.filter(item => item.url !== this.activeFile.url)
                    this.activeFile = {};
                }
            },
            updateItem() {
                console.log('update');
            }
        },
        directives: { lazy },
        watch: {
            folder() {
                this.getResourses();
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

            this.getResourses();
        }
    }
</script>

<style lang="scss">
    .cloudinary-upload {
        margin: 20px;
        position: relative;

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba($color: #000000, $alpha: .7);
            z-index: 0;
        }

        &-input {
            border-color: transparent;
            border-bottom-color: #777;
            background-color: transparent;
            margin: 10px;
            font-size: 15px;
            transition: border-color .3s;

            &:focus {
                border-bottom-color: #fff;
                outline: none;
            }
        }

        &-button {
            border: 1px solid white;
            background-color: gray;
            color: white;
            padding: 10px;
            margin: 20px 10px 0 0;
            cursor: pointer;

            &:hover {
                background-color: #333;
            }
        }

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
            width: 70vw;
            position: fixed;
            padding: 20px 0;
            left: 15vw;
            display: flex;
            flex-wrap: wrap;
            background-color: gray;
            z-index: 1;
            box-shadow: 0 0 10px rgba($color: #000000, $alpha: .7);

            &-thumb {
                height: 260px;
                margin: 0 50px 0 20px;
            }

            &-info {
                label {
                    display: block;
                    color: white;
                }
            }

            .get {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 30px;
                background-color: darkgray;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                font-size: 30px;
                cursor: pointer;
                box-shadow: 0 0 10px rgba($color: #000000, $alpha: .7);

                &-prev {
                    left: -30px;
                }

                &-next {
                    right: -30px;
                }
            }

            .close-btn {
                position: absolute;
                top: 10px;
                right: 15px;
                font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                font-size: 30px;
                color: white;
                cursor: pointer;
                z-index: 3;
            }

        }

        &__addFiles {
            background-color: gray;
            width: 100px;
            height: 100px;
            position: relative;
            cursor: pointer;

            &:after {
                content: '+';
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                font-size: 60px;
            }

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