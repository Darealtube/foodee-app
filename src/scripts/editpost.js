$(document).ready(function () {
  var urlQuery = new URLSearchParams(window.location.search);
  const postId = urlQuery.get("p");

  const postForm = new FormData();

  $(".author-img").hide();
  const loadData = (loggedInUser) => {
    $(".author-img").attr("src", loggedInUser.pfp);
    $(".author-img").show();
    $(".author-name").text(loggedInUser.name);
  };

  const loadPostData = (post) => {
    postForm.append("post", postId);
    postForm.append("title", post.title);
    postForm.append("post_img", post.post_img);
    postForm.append("caption", post.description);
    postForm.append("location", post.location);
    postForm.append("categories", post.categories);

    $(".food-img img").attr("src", post.post_img);
    $(".title-input").val(post.title);
    $("#description").val(post.caption);
    $("#location").val(post.location);
    $("#category").val(post.categories.join(", "));
  };

  $.ajax({
    method: "GET",
    url: `/api/session`,
    cache: true,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => loadData(data),
    error: () => loadData(data),
  });

  const getPostData = () => {
    $.ajax({
      method: "GET",
      url: `/api/posts/${postId}`,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => loadPostData(data),
      error: ({ responseJSON }) => {
        $(".status-popup")
          .removeClass("popup-active")
          .removeClass("error")
          .removeClass("success"); // Reset the status message display
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
          window.location.href = `/food.html?p=${postId}`;
        }, 2000);
      },
    });
  };

  getPostData();

  // CREATE POST [in createpost.html]
  $("#foodForm").submit(function (event) {
    event.preventDefault();

    postForm.set("title", $(".title-input").val());
    if ($("#input-file").get(0).files[0])
      postForm.set("post_img", $("#input-file").get(0).files[0]);
    postForm.set("caption", $("#description").val());
    postForm.set("location", $("#location").val());
    postForm.set(
      "categories",
      $("#category")
        .val()
        .split(",")
        .map((category) => category.trim())
    );

    $(".status-popup")
      .removeClass("popup-active")
      .removeClass("error")
      .removeClass("success"); // Reset the status message display
    $(".status-popup").addClass("popup-active");
    $("#status-message").text("Editing post...");

    $.ajax({
      method: "PUT",
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
        $("#status-message").text("Editing Success! Redirecting to homepage...");
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
