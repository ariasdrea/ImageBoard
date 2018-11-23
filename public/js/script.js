// DO NOT USE ARROW FUNCTIONS
(function() {
    // Vue.component("upload-nav", {
    //     template: "#upload-side",
    //     data: function() {
    //         return {
    //             show: true
    //         };
    //     }
    // });
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
                console.log("watcher running!", this.imageId);

                var self = this;
                axios
                    .get("/get-image-info/" + this.imageId)
                    .then(function(resp) {
                        self.title = resp.data.title;
                        self.description = resp.data.description;
                        self.url = resp.data.url;
                        self.username = resp.data.username;
                    });
                ///new image id is this.imageId
                //give imageId to the server which will got to the database with comments, sends it back to vue and we'll render it/put it in a data comonent object. same data flow as the mounted function below. --end of part4
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
                            console.log(resp.data);
                            self.comments = resp.data;
                        });
                })
                .catch(function(err) {
                    console.log("ERR IN AXIOS GETIMAGEINFO:", err);
                });
        },

        methods: {
            // handleClick: function() {
            //     console.log("clicked!!!!!!!");
            // },

            closeComponent: function() {
                this.$emit("close-component");
            },

            insertComment: function(e) {
                e.preventDefault();
                let self = this;
                axios
                    .post("/insert-comment/" + this.imageId, self.form)
                    .then(function(resp) {
                        console.log("resp in show-COMMENTS:", resp);
                        console.log("info", resp.data.rows[0]);
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
        el: "#upload-nav",
        data: {
            show: true
        }
    });

    new Vue({
        el: "#main",
        data: {
            enter: true,
            images: [],
            imageId: location.hash.slice(1) || 0,
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            }
        },
        mounted: function() {
            // BONUS FEATURE 3 - do something in set interval to check for new images
            // setInterval(function(){
            //     console.log('yoooooo');
            // }, 3000);

            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
                //check that the id actually corresponds to an image id. so if you put 100 and we dont have an image 100, then handle that. we don't want to do anything.
            });

            axios.get("/images").then(function(resp) {
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer;
            });
        },

        methods: {
            getMoreImages: function() {
                var self = this;
                var lastId = this.images[this.images.length - 1].id;

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

                axios.post("/upload", formData).then(function(resp) {
                    var uploadedImage = resp.data[0];
                    self.images.unshift(uploadedImage);
                });
            }
        }
    });
})();

// try to do everything the vue way.
// dynamically add class to element
// use vue logic to add class to the element and in css style that element.

$(document).ready(function() {
    let uploadText = $("#uploadText");
    let sideBar = $(".side-bar");
    let cross = $(".cross");

    uploadText.on("click", function() {
        sideBar.addClass("appear");
    });

    cross.on("click", function() {
        sideBar.removeClass("appear");
    });
})();

// comments
// 2 input fieds will be in the component script.
