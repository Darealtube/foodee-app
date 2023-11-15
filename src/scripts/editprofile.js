$(document).ready(() => {
  var loggedInUser;
  const profileForm = new FormData();
  const loadData = (loggedInUser) => {
    $(".profile-img").attr("src", loggedInUser.pfp);
    $(".profile-name").text(loggedInUser.name);
    $(".header-img").attr("src", loggedInUser.header);
    $("#bio").val(loggedInUser.bio);
    $("#location-input").val(loggedInUser.address);

    profileForm.append("pfp", loggedInUser.pfp);
    profileForm.append("header", loggedInUser.header);
    profileForm.append("address", loggedInUser.address);
    profileForm.append("bio", loggedInUser.bio);
  };

  const getSession = () => {
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
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
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
    window.location.href = newUrl;
  });
});
