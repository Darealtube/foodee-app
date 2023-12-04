$(document).ready(() => {
  var loggedInUser;
  const profileForm = new FormData();

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

  const loadData = (user) => {
    loggedInUser = user;
    $(".profile-img").attr("src", user.pfp);
    $(".profile-name").text(user.name);
    $(".header-img").attr("src", user.header);
    $("#bio").val(user.bio);
    $("#location-input").val(user.address);

    profileForm.append("pfp", user.pfp);
    profileForm.append("header", user.header);
    profileForm.append("address", user.address);
    profileForm.append("bio", user.bio);

    $(".appbar-nav").append(appBar(user));
  };

  const getSession = () => {
    $(".add-button").hide();
    $.ajax({
      method: "GET",
      url: `/api/session`,
      cache: true,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => loadData(data),
      error: () => loadData(null),
    });
  };

  getSession();

  // CREATE POST [in createpost.html]
  $("#done").click(function (event) {
    event.preventDefault();

    profileForm.set("bio", $("#bio").val());
    profileForm.set("address", $(".location-input").val());
    if ($("#header-input").get(0).files[0])
      profileForm.set("header", $("#header-input").get(0).files[0]);
    if ($("#pfp-input").get(0).files[0])
      profileForm.set("pfp", $("#pfp-input").get(0).files[0]);

    $(".status-popup")
      .removeClass("popup-active")
      .removeClass("error")
      .removeClass("success"); // Reset the status message display
    $(".status-popup").addClass("popup-active");
    $("#status-message").text("Editing user...");

    $.ajax({
      method: "PUT",
      url: "/api/profile",
      data: profileForm,
      contentType: false, // Let jQuery handle the contentType
      processData: false,
      success: (data) => {
        $(".status-popup")
          .removeClass("popup-active")
          .removeClass("error")
          .removeClass("success"); // Reset the status message display
        $(".status-popup").addClass("popup-active").addClass("success");
        $("#status-message").text(
          "Editing Success! Redirecting to homepage..."
        );
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
        $("#status-message").text(data.responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
        console.log(data.responseJSON.error);
        $(".profile-img").val("");
        $(".header-img").val("");
        $("#bio").val("");
        $("#location-input").val("");
      },
    });
  });

  // FOR PFP
  $(".attach-pfp").click(function () {
    $("#pfp-input").trigger("click");
  });

  $("#pfp-input").change(function () {
    const files = $(this).get(0).files;

    if (files.length > 0) {
      var photo = files[0];
      const reader = new FileReader();
      reader.onloadend = function () {
        const photoData = reader.result;
        $(".profile-img").attr("src", photoData);
      };
      reader.readAsDataURL(photo);
    }
  });

  // FOR HEADER
  $(".attach-header").click(function () {
    $("#header-input").trigger("click");
  });

  $("#header-input").change(function () {
    const files = $(this).get(0).files;

    if (files.length > 0) {
      var photo = files[0];
      const reader = new FileReader();
      reader.onloadend = function () {
        const photoData = reader.result;
        $(".header-img").attr("src", photoData);
      };
      reader.readAsDataURL(photo);
    }
  });

  $("#cancel").click(function () {
    const newUrl = `/profile.html?u=${loggedInUser.name}`;
    $(this).attr("href", newUrl);
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
