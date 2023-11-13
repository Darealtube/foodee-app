$(document).ready(function () {
    $("#foodForm").submit(function (event) {
        event.preventDefault();

        const postData = {
            post_img: $("#input-file").val(),
            caption: $("#description").val(),
            location: $("#location").val(),
            categories: $("#category").val().split(',').map(category => category.trim()),
            user: $("#author").val().name()
        }

        $.ajax({
            method: "POST",
            url: "/api/posts",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (data, status) => {
                $(".status-popup").addClass("popup-active");
                $("#status-message").text("Your post was created! Redirecting to homepage...");
                setTimeout(() => {
                    window.location.href = "/index.html";
                    $(".status-popup").removeClass("popup-active");
                }, 2000);
            },
            error: ({responseJSON}) => {
                $(".status-popup").addClass("popup-active");
                $("#status-message").text(responseJSON.error);
                setTimeout(() => {
                $(".status-popup").removeClass("popup-active");
                }, 2000);
            },
        });
    });
});