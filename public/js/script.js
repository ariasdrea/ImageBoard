// DO NOT USE ARROW FUNCTIONS
(function() {
    Vue.component("some-component", {
        template: "#my-template",
        props: ["imageId"],
        data: function() {
            return {
                title: "",
                description: "",
                url: "",
                username: "",
                form: {
                    comment: "",
                    modalUser: ""
                },
                comments: []
            };
        },

        watch: {
            imageId: function() {
                console.log('this.imageId:', this.imageId);
                var self = this;
                axios
                    .get("/get-image-info/" + this.imageId)
                    .then(function(resp) {
                        console.log('resp:', resp);
                        self.title = resp.data[0].title;
                        self.description = resp.data[0].description;
                        self.url = resp.data[0].url;
                        self.username = resp.data[0].username;
                    });
            }
        },

        mounted: function() {
            let self = this;

            axios
                .get("/get-image-info/" + this.imageId)
                .then(function(resp) {
                    self.title = resp.data[0].title;
                    self.description = resp.data[0].description;
                    self.url = resp.data[0].url;
                    self.username = resp.data[0].username;
                })
                .then(function() {
                    axios
                        .get("/get-comments/" + self.imageId)
                        .then(function(resp) {
                            self.comments = resp.data;
                        });
                })
                .catch(function(err) {
                    console.log("ERR IN AXIOS GETIMAGEINFO:", err);
                });
        },

        methods: {
            closeComponent: function() {
                this.$emit("close-component");
            },

            insertComment: function(e) {
                e.preventDefault();
                let self = this;
                axios
                    .post("/insert-comment/" + this.imageId, self.form)
                    .then(function(resp) {
                        self.comments.unshift(resp.data.rows[0]);
                    })
                    .catch(function(err) {
                        console.log("error when submitting comments:", err);
                    });
            }
        }
    });

    new Vue({
        el: "#intro-page",
        data: {
            show: true
        }
    });

    new Vue({
        el: "#main",
        data: {
            showUp: "",
            images: [],
            morePics: true,
            imageId: location.hash.slice(1) || 0,
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            }
        },
        mounted: function() {
            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);

            });

            axios.get("/images").then(function(resp) {
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer;
            });
        },

        methods: {
            show: function() {
                if (this.showUp == "appear") {
                    this.showUp = "";
                } else {
                    this.showUp = "appear";
                }
            },

            getMoreImages: function() {
                var self = this;
                var lastId = this.images[this.images.length - 1].id;

                if (lastId == 2) {
                    self.morePics = false;
                }

                axios.get("/get-more-images/" + lastId).then(function(resp) {
                    self.images.push.apply(self.images, resp.data);
                });
            },

            toggleComponent: function(e) {
                var idOfImageThatWasClicked = e.target.id;
                this.imageId = idOfImageThatWasClicked;
            },

            closingTheComponent: function() {
                this.imageId = false;
            },

            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },

            uploadFile: function(e) {
                e.preventDefault();
                var self = this;

                var formData = new FormData();
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                formData.append("file", this.form.file);

                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        var uploadedImage = resp.data[0];
                        self.images.unshift(uploadedImage);
                    })
                    .catch(function(err) {
                        return err;
                    });
            }
        }
    });
})();
