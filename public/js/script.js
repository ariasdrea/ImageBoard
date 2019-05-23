//Putting all of our code in an IFFE to prevent our variables to become global.
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
        }, //data ends (comma is very important!)

        watch: {
            imageId: function() {
                console.log("this.imageId:", this.imageId);
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
        //mounted is called a 'lifecycle method'
        mounted: function() {
            //Where we make AXIOS requests to get data from the server that we want to render onscreen when user visits site
            let self = this; //this refers to the vue instance
            //RESP is the response from the server
            //data is the property of RESP that contains the info we requested from the server
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

    //majority of our Vue code will go in this obj.
    new Vue({
        //refers to element in index.html with id: main to connect to
        el: "#main",
        data: {
            showUp: "",
            images: [],
            morePics: true,
            imageId: location.hash.slice(1) || 0,
            // where the input field data will be held.
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            },
            totalImages: ""
        }, //data ends

        mounted: function() {
            //this refers to the vue instance
            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });

            axios.get("/images").then(function(resp) {
                // console.log("resp.data in get images:", resp.data);
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer;
                // console.log("self.images in mounted:", self.images);
            });
        }, //mounted ends

        methods: {
            //every single function that runs in response to an even is written here
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

                //Get all images from the database and access the property rowCount to get the total # of images in db.
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
                var idOfImageThatWasClicked = e.target.id;
                this.imageId = idOfImageThatWasClicked;
            },

            closingTheComponent: function() {
                this.imageId = false;
            },

            //runs every time you select a file and click open
            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },

            uploadFile: function(e) {
                //the default behavior of the button is to submit and therefore, the page refreshes - need to preventdefault (don't make post request when you click it!)
                e.preventDefault();
                var self = this; //is this needed?!!!!!
                //need to use FormData API to process the file
                //We need to add all the file's info to formData by appending it to the variable (.append is specific to formData - needs to be passed a key:value pair)
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
                        var uploadedImage = resp.data[0];
                        self.images.unshift(uploadedImage);
                    })
                    .catch(function(err) {
                        return err;
                    });
            } //uploadFile ends
        } //mounted ends
    });
})();
