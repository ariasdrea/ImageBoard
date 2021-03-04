(function () {
    Vue.component("image-modal", {
        template: "#my-template",
        props: ["imageId"],
        data: function () {
            return {
                title: "",
                description: "",
                url: "",
                username: "",
                comment: "",
                modalUser: "",
                comments: [],
                exists: true,
                prevId: null,
                nextId: null
            };
        },

        watch: {
            imageId: function () {
                var self = this;
                console.log("WATCHER RUNS");

                axios
                    .get("/get-image-info/" + this.imageId)
                    .then(function (resp) {
                        if (!resp.data.length) {
                            self.$emit("close-component");
                        } else {
                            self.title = resp.data[0].title;
                            self.description = resp.data[0].description;
                            self.url = resp.data[0].url;
                            self.username = resp.data[0].username;
                            self.nextId = resp.data[0].nextId;
                            self.prevId = resp.data[0].prevId;
                        }
                    });

                axios
                    .get("/get-comments/" + this.imageId)
                    .then(function (resp) {
                        self.comments = resp.data;

                        !self.comments.length
                            ? (self.exists = false)
                            : (self.exists = true);
                    });
            }
        },

        mounted: function () {
            let self = this;

            axios
                .get("/get-image-info/" + this.imageId)
                .then(function (resp) {
                    self.title = resp.data[0].title;
                    self.description = resp.data[0].description;
                    self.url = resp.data[0].url;
                    self.username = resp.data[0].username;
                    self.prevId = resp.data[0].prevId;
                    self.nextId = resp.data[0].nextId;
                })
                .catch(function (err) {
                    console.log("err in get-img-info:", err);
                });

            axios
                .get("/get-comments/" + self.imageId)
                .then(function (resp) {
                    self.comments = resp.data;

                    if (!self.comments.length) {
                        self.exists = false;
                    }
                })
                .catch(function (err) {
                    console.log("err in axios get-comments: ", err);
                });
        },

        methods: {
            closeComponent: function () {
                this.$emit("close-component");
            },
            insertComment: function () {
                let self = this;

                axios
                    .post("/insert-comment/" + this.imageId, {
                        comment: this.comment,
                        modalUser: this.modalUser
                    })
                    .then(function (resp) {
                        self.comments.unshift(resp.data);

                        self.comment = "";
                        self.modalUser = "";

                        if (self.comments) {
                            self.exists = true;
                        }
                    })
                    .catch(function (err) {
                        console.log("err in method insertComment:", err);
                    });
            },
            deleteImage: function (e) {
                e.preventDefault();
                let self = this;
                axios
                    .post("/delete-image/" + this.imageId)
                    .then(function () {
                        self.$emit("close-component");
                        self.$emit("update-images");
                    })
                    .catch(function (err) {
                        console.log("err in method deleteImage: ", err);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            showUp: "",
            images: [],
            morePics: true,
            imageId: location.hash.slice(1) || 0,
            title: "",
            description: "",
            username: "",
            file: null,
            tags: [],
            startingPoint: "",
            errInUpload: "",
            notificationVisible: false,
            newImgs: []
        },
        mounted: function () {
            var self = this;

            window.addEventListener("hashchange", function () {
                self.imageId = location.hash.slice(1);
            });

            axios.get("/images").then(function (resp) {
                self.images = resp.data.rows;

                for (let i = 0; i < resp.data.length; i++) {
                    if (resp.data[i].id === resp.data[i].lowestId) {
                        self.morePics = false;
                    }
                }

                if (!resp.data.rowCount) {
                    self.morePics = false;
                    self.startingPoint = true;
                }
            });

            setInterval(function () {
                axios
                    .get(`/check-for-new-image/${self.images[0].id}`)
                    .then(function (resp) {
                        if (resp.data.length) {
                            self.notificationVisible = true;
                            self.newImgs = resp.data;
                        }
                    });
            }, 8000);
        },
        methods: {
            show: function () {
                if (this.showUp == "appear") {
                    this.showUp = "";
                } else {
                    this.showUp = "appear";
                }
            },
            getMoreImages: function () {
                var self = this;
                var lastId = this.images[this.images.length - 1].id;

                axios.get("/get-more-images/" + lastId).then(function (resp) {
                    self.images.push.apply(self.images, resp.data);

                    for (let i = 0; i < resp.data.length; i++) {
                        if (resp.data[i].id === resp.data[i].lowestId) {
                            self.morePics = false;
                        }
                    }
                });
            },
            handleFileChange: function (e) {
                this.file = e.target.files[0];
            },
            uploadFile: function () {
                var self = this;

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                formData.append("tags", this.tags);

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        if (resp.data.err) {
                            self.errInUpload = true;
                        } else {
                            var uploadedImage = resp.data[0];
                            self.images.unshift(uploadedImage);
                            self.startingPoint = false;
                            self.errInUpload = false;

                            self.title = "";
                            self.description = "";
                            self.username = "";
                            document.querySelector('input[type="file"]').value =
                                "";
                        }
                    })
                    .catch(function (err) {
                        return err;
                    });
            },
            closingTheComponent: function () {
                this.imageId = null;
                history.replaceState(null, null, " ");
            },
            updateImagesAfterDelete: function () {
                var self = this;

                axios.get("/getLastThreeImgs").then(function (resp) {
                    self.images = resp.data;

                    axios.get("/getAllImages").then(function (resp) {
                        self.totalImages = resp.data.rowCount;
                        if (self.images == 0) {
                            self.startingPoint = true;
                        } else if (self.images.length === self.totalImages) {
                            self.morePics = false;
                        }
                    });
                });
            },
            showNewImg: function () {
                for (let i = 0; i < this.newImgs.length; i++) {
                    this.images.unshift(this.newImgs[i]);
                    this.notificationVisible = false;
                }
            }
        }
    });
})();
