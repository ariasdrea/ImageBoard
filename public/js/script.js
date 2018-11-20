// DO NOT USE ARROW FUNCTIONS

// In your Javascript you will have to create a Vue instance and when it mounts make an ajax request to get the data for the images.
// Once you have it, your HTML template should loop through them and render each one.

(function() {
    new Vue({
        el: "#main",
        data: {
            images: [],
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
                //resp is res.json(results) in index.js
                // console.log("resp.data.rows:", resp.data.rows);
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer; //self.images injects images in empty array above
            });
        }, //mounted function ends
        methods: {
            handleFileChange: function(e) {
                console.log("handle file change running!", e.target.files[0]);
                this.form.file = e.target.files[0];
            },
            uploadFile: function(e) {
                e.preventDefault(); //prevents refresh from form
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
$(document).ready(function() {
    let intropage = $("#intro");
    let enter = $("#enter-button");

    let uploadText = $("#uploadText");
    let sideBar = $(".side-bar");
    let cross = $(".cross");

    enter.on("click", function() {
        intropage.fadeOut("slow");
    });

    uploadText.on("click", function() {
        sideBar.addClass("appear");
    });

    cross.on("click", function() {
        sideBar.removeClass("appear");
    });
})();
