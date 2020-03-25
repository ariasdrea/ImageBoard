// DO NOT USE ARROW FUNCTIONS
(function() {
    Vue.component("image-modal", {
        template: "#my-template",
        props: ["imageId"], //props has the property of Vue instance data we want this component to have access to.
        data: function() {
            //data in a component is a fn that returns an obj. the fn will ensure that the each instance of the component will have their own data object and not share it.
            return {
                title: "",
                description: "",
                url: "",
                username: "",
                form: {
                    comment: "",
                    modalUser: ""
                },
                comments: [],
                exists: true,
                prevId: null,
                nextId: null
            };
        },

        watch: {
            imageId: function() {
                var self = this;

                axios
                    .get("/get-image-info/" + this.imageId)
                    .then(function(resp) {
                        self.title = resp.data[0].title;
                        self.description = resp.data[0].description;
                        self.url = resp.data[0].url;
                        self.username = resp.data[0].username;
                        self.nextId = resp.data[0].nextId;
                        self.prevId = resp.data[0].prevId;
                    }).then(function() {
                        axios
                            .get("/get-comments/" + self.imageId)
                            .then(function(resp) {
                                self.comments = resp.data;

                                //hides comment box if no comments
                                if (!self.comments.length) {
                                    self.exists = false;
                                } else {
                                    self.exists = true;
                                }
                            });
                    });
            }
        },

        mounted: function () {
            let self = this;

            axios
                .get("/get-image-info/" + this.imageId)
                .then(function(resp) {
                    self.title = resp.data[0].title;
                    self.description = resp.data[0].description;
                    self.url = resp.data[0].url;
                    self.username = resp.data[0].username;
                    self.prevId = resp.data[0].prevId;
                    self.nextId = resp.data[0].nextId;
                }).catch(function(err) {
                    console.log('err in get-img-info:', err);
                });

            axios
                .get("/get-comments/" + self.imageId)
                .then(function(resp) {
                    self.comments = resp.data;

                    //hides comment box if no comments
                    if(!self.comments.length) {
                        self.exists = false;
                    }
                }).catch(function(err) {
                    console.log('err in axios get-comments: ', err);
                });
        },

        methods: {
            closeComponent: function () {
                // close-component refers to fn inside image-modal in html
                this.$emit("close-component");
            },

            insertComment: function(e) {
                e.preventDefault();
                let self = this;
                axios
                    .post("/insert-comment/" + this.imageId, self.form)
                    .then(function(resp) {
                        self.comments.unshift(resp.data);

                        if (self.comments) {
                            self.exists = true;
                        }
                    })
                    .catch(function(err) {
                        console.log("err in method insertComment:", err);
                    });
            },

            deleteImage: function(e) {
                e.preventDefault();
                let self = this;
                axios
                    .post('/delete-image/' + this.imageId)
                    .then(function (resp) {
                        console.log('resp in deleteImage: ', resp);
                        
                        // close-component refers to fn inside image-modal in html
                        self.$emit('close-component');
                        self.$emit('update-images');
                    }).catch(function(err) {
                        console.log('err in method deleteImage: ', err);
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

    ////////////// VUE INSTANCE //////////////
    new Vue({
        //refers to element in index.html with id: main to connect to
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
                file: null,
                tags: []
            },
            totalImages: "",
            startingPoint: ""
        }, // data ends (comma is very important!)

        mounted: function() {
            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });

            axios.get("/images").then(function (resp) {
                self.images = resp.data;

                axios.get('/getAllImages').then(function (resp) {
                    if (!self.images.length || resp.data.rowCount === 3) {
                        self.morePics = false;
                        self.startingPoint = true;
                    }
                });
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

                //Get all images from the db and access the property rowCount to get the total # of images.
                axios.get("/getAllImages").then(function (resp) {                    
                    var totalImagesInDb = resp.data.rowCount;
                    self.totalImages = totalImagesInDb;
                });

                axios.get("/get-more-images/" + lastId).then(function(resp) {
                    self.images.push.apply(self.images, resp.data);

                    if (self.images.length === self.totalImages) {
                        self.morePics = false;
                    }
                });
            },
            //runs every time you select a file and click open
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
                formData.append('tags', this.form.tags);
   
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        var uploadedImage = resp.data[0];
                        self.images.unshift(uploadedImage);
                        self.startingPoint = false;

                        self.form.title = "";
                        self.form.description = "";
                        self.form.username = ""; 
                    })
                    .catch(function(err) {
                        return err;
                    });
            }, //uploadFile ends
            closingTheComponent: function() {
                this.imageId = null;
                history.replaceState(null, null, ' ');
            },

            updateImagesAfterDelete: function () {
                var self = this;

                axios.get('/getLastThreeImgs').then(function (resp) {
                    self.images = resp.data;   

                    axios.get("/getAllImages").then(function (resp) {
                        self.totalImages = resp.data.rowCount;                    
                        // hides the button when we delete & we have the first image onscreen
                        if (self.images == 0) {
                            console.log('in here');
                            self.startingPoint = true;
                        } else if (self.images.length === self.totalImages) {
                            self.morePics = false;
                        } 
                    });
                });
        
               
            }
        } 
    });
})();
