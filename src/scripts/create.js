$(document).ready(function () {
/*   var loggedInUser = null;

  $.ajax({
    method: "GET",
    url: `/api/session`,
    cache: true,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => (loggedInUser = data),
    error: () => (loggedInUser = null),
  }); */

  // CREATE POST [in createpost.html]
  $("#foodForm").submit(function (event) {
    event.preventDefault();

    const postForm = new FormData();

    postForm.append("post_img", $("#input-file").get(0).files[0]);
    postForm.append("caption", $("#description").val());
    postForm.append("location", $("#location").val());
    postForm.append(
      "categories",
      $("#category")
        .val()
        .split(",")
        .map((category) => category.trim())
    );

    $.ajax({
      method: "POST",
      url: "/api/posts",
      data: postForm,
      contentType: false, // Let jQuery handle the contentType
      processData: false,
      success: (data) => {
        $(".status-popup")
          .removeClass("popup-active")
          .removeClass("error")
          .removeClass("success"); // Reset the status message display
        $(".status-popup").addClass("popup-active").addClass("success");
        $("#status-message").text("Login Success! Redirecting to homepage...");
        setTimeout(() => {
          window.location.href = "/index.html";
          $(".status-popup").removeClass("popup-active").removeClass("success");
        }, 2000);
      },
      error: (data) => {
        $(".status-popup")
          .removeClass("popup-active")
          .removeClass("error")
          .removeClass("success"); // Reset the status message display
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
      },
    });
  });

  $(".attach-photo").click(function () {
    $("#input-file").trigger("click");
  });

  $("#input-file").change(function () {
    const files = $(this).get(0).files;

    if (files.length > 0) {
      var photo = files[0];
      const reader = new FileReader();
      reader.onloadend = function () {
        const photoData = reader.result;
        $(".food-img img").attr("src", photoData);
      };
      reader.readAsDataURL(photo);
    }
  });
});
