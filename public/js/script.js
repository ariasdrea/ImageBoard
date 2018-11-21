// DO NOT USE ARROW FUNCTIONS

// In your Javascript you will have to create a Vue instance and when it mounts make an ajax request to get the data for the images.
// Once you have it, your HTML template should loop through them and render each one.

(function() {
    Vue.component("some-component", {
        template: "#my-template",
        props: ["imageId"],
        data: function() {
            return {
                title: "",
                description: "",
                url: "",
                username: ""
            };
        },

        mounted: function() {
            var self = this;

            axios.get("/getImageInfo/" + this.imageId).then(function(resp) {
                console.log("resp.data:", resp.data);
                self.title = resp.data.title;
                self.description = resp.data.description;
                self.url = resp.data.url;
                console.log("self.url:", self.url);
                self.username = resp.data.username;
            });
        },

        methods: {
            handleClick: function() {
                console.log("clicked!!!!!!!");
            },

            closeComponent: function() {
                this.$emit("close-component");
            }

            // ADD FUNCTION (NEW DB QUERY THAT WILL GET COMMENTS, PUT THEM IN DATA, RENDER THEM USING FOR LOOP)
        }
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            imageId: 0,
            showComponent: false,
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            }
        },
        mounted: function() {
            var self = this;
            axios.get("/images").then(function(resp) {
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer;
            });
        }, //mounted function ends

        methods: {
            toggleComponent: function(e) {
                var idOfImageThatWasClicked = e.target.id;
                this.imageId = idOfImageThatWasClicked;
                this.showComponent = true;
            },

            closingTheComponent: function() {
                this.showComponent = false;
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

// EVENT LISTENERS
// $(document).ready(function() {
//     let intropage = $("#intro");
//     let enter = $("#enter-button");
//
//     let uploadText = $("#uploadText");
//     let sideBar = $(".side-bar");
//     let cross = $(".cross");
//
//     enter.on("click", function() {
//         intropage.fadeOut("slow");
//     });
//
//     uploadText.on("click", function() {
//         sideBar.addClass("appear");
//     });
//
//     cross.on("click", function() {
//         sideBar.removeClass("appear");
//     });
//
// })();

// comments
// 2 input fieds will be in the component script.
