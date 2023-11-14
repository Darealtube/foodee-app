$(document).ready(function () {
  $("#foodForm").submit(function (event) {
    event.preventDefault();

    const postData = {
      post_img: $("#input-file").val(),
      caption: $("#description").val(),
      location: $("#location").val(),
      categories: $("#category")
        .val()
        .split(",")
        .map((category) => category.trim()),
      user: $("#author").val().name(),
    };

    $.ajax({
      method: "POST",
      url: "/api/posts",
      data: JSON.stringify(postData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data, status) => {
        $(".status-popup").addClass("popup-active");
        $("#status-message").text(
          "Your post was created! Redirecting to homepage..."
        );
        setTimeout(() => {
          window.location.href = "/index.html";
          $(".status-popup").removeClass("popup-active");
        }, 2000);
      },
      error: ({ responseJSON }) => {
        $(".status-popup").addClass("popup-active");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active");
        }, 2000);
      },
    });
  });

  // START OF APPBAR
  const appBar = (loggedInUser) => {
    if (!loggedInUser) {
      return `
      <a href="./login.html"><button class="loginBtn">LOG IN</button></a>`;
    }

    return `
    <div class="pfp">
      <a href='profile.html?p=${loggedInUser.name}'>
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

  $.ajax({
    method: "GET",
    url: `/api/session`,
    cache: true,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => $(".appbar-nav").append(appBar(data)),
    error: () => $(".appbar-nav").append(appBar(null)),
  });

  // END OF APPBAR

  // START OF LOGOUT
  const logout = () => {
    $.ajax({
      url: "/api/logout",
      method: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        // Show the status popup saying that the user has been logged in successfully
        $(".status-popup").addClass("popup-active").addClass("success");
        $("#status-message").text(data.message);
        setTimeout(() => {
          window.location.href = "/index.html";
          $(".status-popup").removeClass("popup-active").removeClass("success");
        }, 2000);
      },
      // Use destructuring to destructure the error parameter to get the responseJSON data
      error: ({ responseJSON }) => {
        // Show the status popup saying that the login/signup has failed
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
      },
    });
  };

  $(".appbar-nav").on("click", ".logout", () => {
    logout();
  });
  // END OF LOGOUT
});
