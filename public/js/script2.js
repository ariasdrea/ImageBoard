$(document).ready(function() {
    var intropage = $("#intro");
    var enter = $("#enter-button");

    enter.on("click", function() {
        intropage.fadeOut();
    });
})();

//
// $(document).ready(function() {
//     var modal = $('#modal');
//     var blur = $('#blur');
//     var cancel = $('.modalx');
//
//     setTimeout(function(){
//         modal.fadeIn();
//         blur.fadeIn();
//     }, 1000);
//
//
//     cancel.on('click', function(){
//         modal.fadeOut();
//         blur.fadeOut();
//     });
//
//
// })();
