$(document).ready(() => {
  var urlQuery = new URLSearchParams(window.location.search);
  const postData = {}; // Hashmap for post data sorted by date
  const postLikesData = {}; // Hashmap for post data sorted by likes

  var user = urlQuery.get("p");
  let filter = urlQuery.get("f") || "date";
  let page = 0;
  let endPage;

  const getUserInfo = () => {
    $.ajax({
      method: "GET",
      url: `/api/profile?p=${user}`,
      dataType: "json",
      success: (userData) => {
        // Updates HTML elements with the user information
        $(".profile-name").text(userData.name);
        $(".bio-text").text(userData.bio);
        $("#location").text(userData.address);
        $(".profile-img").attr("src", userData.pfp);
        $(".backdrop-img").attr("src", userData.header);
      },
      error: (error) => {
        // Error handling
        console.error("Error fetching user information:", error);
      },
    });
  };

  const getUserPosts = (user, page, filter) => {
    $.ajax({
      method: "GET",
      url: `/api/posts/${user}?p=${page}&f=${filter}`,
      dataType: "json",
      success: (data) => {
        if (data.length < 2) endPage = page;
        if (filter == "date") {
          postData[page] = data;
        } else postLikesData[page] = data;
        appendPosts(data);
      },
      error: (error) => {
        // Handle errors, such as displaying an error message
        console.error("Error fetching posts:", error);
      },
    });
  };

  const generatePost = (postData) => {
    const isLiked = likedPosts.has(postData._id);
    const postLikes = isLiked ? postData.likes + 1 : postData.likes;
    return `
      <div class="container" id="${postData._id}">
      <header class="food-img">
        <a href="/food?=${postData._id}">
          <img src="${postData.post_img}" alt="Food pic" />
        </a>
      </header>
      <footer class="food-details">
        <div class="food-details-container">
          <div class="food-tags"> 
              ${generateTags(postData.categories)}
          </div>
          <p class="like-count">${postLikes}</p>
          <div class="material-symbols-outlined like ${
            isLiked ? "liked" : ""
          }">favorite</div>
        </div>
      </footer>
    </div>
      `;
  };

  const appendPosts = (posts) => {
    for (let i = 0; i < posts.length; ++i) {
      const post = $(generatePost(posts[i]));
      $(".container").append(post);
    }
  };

  getUserInfo();
  getUserPosts(user, page, filter);

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
