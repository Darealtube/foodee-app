$(document).ready(function () {
  $(".author-img").hide();

  const appBar = (loggedInUser) => {
    if (!loggedInUser) {
      return `
      <a href="./login.html"><button class="loginBtn">LOG IN</button></a>`;
    }

    $(".add-button").show();
    return `
    <div class="pfp">
      <a href='profile.html?u=${loggedInUser.name}'>
        <img
          src="${loggedInUser.pfp}"
          width="32px"
          height="32px"
          alt="PFP"
        />
      </a>
    </div>
    <button class="loginBtn logout">LOG OUT</button>
  `;
  };

  const loadData = (loggedInUser) => {
    $(".author-img").attr("src", loggedInUser.pfp);
    $(".author-img").show();
    $(".author-name").text(loggedInUser.name);
    $(".appbar-nav").append(appBar(loggedInUser));
  };

  $(".add-button").hide();
  $.ajax({
    method: "GET",
    url: `/api/session`,
    cache: true,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => loadData(data),
    error: () => loadData(data),
  });

  // CREATE POST [in createpost.html]
  $("#foodForm").submit(function (event) {
    event.preventDefault();

    const postForm = new FormData();

    postForm.append("title", $(".title-input").val());
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

    $(".status-popup")
      .removeClass("popup-active")
      .removeClass("error")
      .removeClass("success"); // Reset the status message display
    $(".status-popup").addClass("popup-active");
    $("#status-message").text("Creating post...");

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

  var searchKey;
  $("input[name='search-bar']").on("keyup", function () {
    searchKey = $(this).val();
    if (searchKey.trim() !== "") {
      $.ajax({
        url: `/api/searchCategories?k=${searchKey}`,
        type: "GET",
        success: function (response) {
          $(".search-results").empty();
          response.forEach(function (category) {
            $(".search-results").append(
              $(
                `<div><a href="/index.html?p=0&f=date&c=${category.name}">${category.name}</a></div>`
              )
            );
          });
        },
        error: function () {
          $(".search-results").empty();
          $(".search-results").append($("<div>").text("Error occured."));
        },
      });
    } else {
      $(".search-results").empty();
    }
  });

  $(".search").submit(function (event) {
    event.preventDefault();
    window.location.href = `/index.html?p=0&f=date&c=${searchKey}`;
  });
});
