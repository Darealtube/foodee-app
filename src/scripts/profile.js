$(document).ready(() => {
  var urlQuery = new URLSearchParams(window.location.search);
  const postData = []; // Hashmap for post data sorted by date
  const postLikesData = []; // Hashmap for post data sorted by likes
  
  var user = urlQuery.get("p");
  let filter = urlQuery.get("f") || "date";
  let page = urlQuery.get("p") || 0;
  let endPage;

  const likedPosts = new Set();

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
        }
      });
    };


    
    const getUserPosts = (user, page, filter) => {
      $.ajax({
        method: "GET",
        url: `/api/posts/profile/${user}?p=${page}&f=${filter}`,
        dataType: "json",
        success: (data) => {
          console.log(data);
          if (data.length < 2) endPage = page;
          if (filter == "date") {
            postData[page] = data;
          } else postLikesData[page] = data;
          appendPosts(data);
        },
        error: (error) => {
          // Handle errors, such as displaying an error message
          console.error("Error fetching posts:", error);
        }
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
      const container = $(".post-list");
      
      // Clear existing containers
      container.empty();
    
      // Add containers for each post
      for (let i = 0; i < posts.length; ++i) {
        const post = $(generatePost(posts[i]));
        container.append(post);
      }
    
      // Determine the total number of containers (posts + empty containers)
      const numContainers = Math.max(posts.length, posts.length);
    
      // If there are fewer posts than containers, add empty containers for the remaining space
      const numEmptyContainers = Math.max(0, numContainers - posts.length);
      for (let i = 0; i < numEmptyContainers; ++i) {
        container.append('<div class="container"></div>');
      }
    };

    const generateTags = (tags) => {
      let tagsHTML = "";
  
      for (let i = 0; i < tags.length; ++i) {
        tagsHTML += `<a href="/index.html?c=${tags[i]}"><button class="tag-post">${tags[i]}</button></a>`;
      }
  
      return tagsHTML;
    };

  getUserInfo();
  getUserPosts(user, page, filter);
  
  const resetPosts = () => {
    $("main").find(".container").remove();
  };

  $(".post-filters").change(function () {
    resetPosts();
  
    filter = $(this).val();
    page = 0;
  
    // Then finds out which filter it is
    if (filter === "date") {
      if (postData[page]) {
        // If the post data sorted by date is found in the array, then load that pre-processed data
        const data = postData[page];
        appendPosts(data);
      } else {
        getUserPosts(user, page, filter);
      }
    } else if (filter === "likes") {
      if (postLikesData[page]) {
        // If the post data sorted by likes is found in the array, then load that pre-processed data
        const data = postLikesData[page];
        appendPosts(data);
      } else {
        getUserPosts(user, page, filter);
      }
    }
  });

  $(".next-pages").click(function () {
    if (endPage != page) {
      // It checks first if the page isn't the last page (as far as the cache goes)
      page += 1;
      resetPosts(); // Then it resets the posts

      // It will then check if there is already a pre-processed data for the current page. If there is, then render that instead. If there is none, fetch the server for posts.
      if (filter == "date") {
        if (postData[page] == null) {
          getUserPosts(user, page, filter);
        } else {
          const data = postData[page];
          appendPosts(data);
        }
      } else {
        if (postLikesData[page] == null) {
          getUserPosts(user, page, filter);
        } else {
          const data = postLikesData[page];
          appendPosts(data);
        }
      }
    }
  });

  // When the user clicks previous page,
  $(".prev-pages").click(function () {
    if (page != 0) {
      // It checks first if the page is not the first page
      page -= 1;
      resetPosts(); // Then it resets the posts

      // It will then check if there is already a pre-processed data for the current page. If there is, then render that instead. If there is none, fetch the server for posts.
      if (filter == "date") {
        if (postData[page] == null) {
          getUserPosts(user, page, filter);
        } else {
          const data = postData[page];
          appendPosts(data);
        }
      } else {
        if (postLikesData[page] == null) {
          getUserPosts(user, page, filter);
        } else {
          const data = postLikesData[page];
          appendPosts(data);
        }
      }
    }
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
