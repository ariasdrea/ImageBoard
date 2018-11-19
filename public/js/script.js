// VUE CODE

// In your Javascript you will have to create a Vue instance and when it mounts make an ajax request to get the data for the images. Once you have it, your HTML template should loop through them and render each one.

(function() {
    new Vue({
        el: "#main",
        data: {
            images: []
        },
        mounted: function() {
            var self = this;
            axios.get("/images").then(function(resp) {
                //resp is res.json(results) in index.js
                // console.log("resp.data.rows:", resp.data.rows);
                var imagesFromServer = resp.data.rows;
                self.images = imagesFromServer;
                //self.images injects images in empty array above
            });
        }
    });
})();
