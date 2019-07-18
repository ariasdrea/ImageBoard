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
                comments: []
            };
        },

        watch: {
            imageId: function() {
                // console.log("this.imageId:", this.imageId);
                var self = this;
                axios
                    .get("/get-image-info/" + this.imageId)
                    .then(function(resp) {
                        console.log("resp:", resp);
                        self.title = resp.data[0].title;
                        self.description = resp.data[0].description;
                        self.url = resp.data[0].url;
                        self.username = resp.data[0].username;
                    });
            }
        },
        //mounted is a 'lifecycle method' and functions within runs when page loads
        mounted: function() {
            let self = this;
            axios
                .get("/get-image-info/" + this.imageId)
                .then(function(resp) {
                    //resp is the response from server
                    //data is the property of RESP that contains the info we requested from server
                    self.title = resp.data[0].title;
                    self.description = resp.data[0].description;
                    self.url = resp.data[0].url;
                    self.username = resp.data[0].username;
                })
                .then(function() {
                    axios
                        .get("/get-comments/" + self.imageId)
                        .then(function(resp) {
                            // console.log('resp.data:', resp.data);
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
                        self.comments.unshift(resp.data);
                    })
                    .catch(function(err) {
                        console.log("error in method insertComment:", err);
                    });
            },

            deleteImage: function(e) {
                e.preventDefault();
                console.log('delete button in modal clicked!');
                console.log('this.imageId: ', this.imageId);
                // let self = this;
                axios.post('/delete-image/' + this.imageId).then(function(resp) {
                    console.log('resp from post /delete-image', resp);
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

    //majority of our Vue code will go in this obj.
    new Vue({
        //refers to element in index.html with id: main to connect to
        el: "#main",
        data: {
            showUp: "",
            images: [],
            morePics: true,
            imageId: location.hash.slice(1) || 0,
            form: {
                // where the input field data will be held.
                title: "",
                description: "",
                username: "",
                file: null
            },
            totalImages: ""
        }, // data ends (comma is very important!)

        mounted: function() {
            //We make AXIOS requests in 'mounted' to get data from the server that we want to show onscreen when user visits site
            //assigning 'this' to self so that its meaning remains throughout nested fn
            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });

            axios.get("/images").then(function(resp) {
                // console.log("resp.data in get images:", resp.data);
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer;
                // console.log("self.images in mounted:", self.images);

                if(!self.images.length) {
                    self.morePics = false;
                }
            });

        }, //mounted ends

        methods: {
            //every single function that runs in response to an event is written here
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
                axios.get("/getAllImages").then(function(resp) {
                    var totalImagesInDb = resp.data.rowCount;
                    self.totalImages = totalImagesInDb;
                    // console.log("this.totalImages:", this.totalImages);
                });

                axios.get("/get-more-images/" + lastId).then(function(resp) {
                    self.images.push.apply(self.images, resp.data);
                    // console.log("self.images:", self.images);
                    // console.log("self.images.length:", self.images.length); // console logs the array to view length as you put pictures into the id when you hit the more button

                    // makes button disappear when you load all the images from the database
                    if (self.images.length === self.totalImages) {
                        self.morePics = false;
                    }
                });
            },

            toggleComponent: function(e) {
                var idOfClickedImg = e.target.id;
                this.imageId = idOfClickedImg;
            },

            closingTheComponent: function() {
                this.imageId = false;
                history.replaceState(null, null, ' ');
            },

            //runs every time you select a file and click open
            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },

            uploadFile: function(e) {
                //the default behavior of the button is to submit and therefore, the page refreshes - need to preventdefault.
                e.preventDefault();
                var self = this;
                //need to use FormData API to handle the file & add all of the
                //file's info to formData by appending it to the variable
                var formData = new FormData();
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                formData.append("file", this.form.file);
                //if you console.log formData, it will show an empty object.

                //This makes a POST request to our server. 1st arg is route, 2nd arg is the data we're sending as part of the request
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        // console.log(
                        //     "resp.data[0] in post upload",
                        //     resp.data[0]
                        // );
                        var uploadedImage = resp.data[0];
                        self.images.unshift(uploadedImage);
                    })
                    .catch(function(err) {
                        return err;
                    });
            }, //uploadFile ends
        } //mounted ends
    });
})();
