// DO NOT USE ARROW FUNCTIONS

// In your Javascript you will have to create a Vue instance and when it mounts make an ajax request to get the data for the images.
// Once you have it, your HTML template should loop through them and render each one.

(function() {
    Vue.component("some-component", {
        //configuration for component
        template: "#my-template",
        props: ["imageId"],
        data: function() {
            return {
                heading: "catnip's first vue component <3"
            };
        },

        mounted: function() {
            console.log("THIS of vue component", this);

            // make an axios request to the server to get info about the image that was clicked on. server will take that id and give it to the database and the db will give us the info about the image that was clicked on. url, title, description, username
            //write a db query - using select.
            //server will send it back to vue as a response (res.json)
            //take response from server and put it in the data in the component. once it's there, just render it.
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
            firstName: "Andrea Arias",
            images: [],
            //id of image that was clicked on
            imageId: 0,
            showComponent: false,
            // tell component to only show up if it is true
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
            toggleComponent: function() {
                this.showComponent = true;
                // console.log(image of id that was clicked on)
                // get this logic first
                //set the value of image id up top to the id of the image.
                this.ImageId = idOfImageThatWasClicked;
                // idOfImageThatWasClicked -
            },

            closingTheComponent: function() {
                this.showComponent = false;
            },

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


comments
2 input fieds will be in the component script.
