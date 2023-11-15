$(document).ready(() => {
  var urlQuery = new URLSearchParams(window.location.search);

  // Get the category (c), the filter (f), and the page number (p) of the posts based on the url. If there is no url parameter, then just assign default searchKeyues.
  let category = urlQuery.get("c");
  let filter = urlQuery.get("f") || "date";
  let page = urlQuery.get("p") || 0;
  let endPage;

  // START OF POSTS MANAGEMENT CODE
  const postData = {}; // Hashmap for post data sorted by date
  const postLikesData = {}; // Hashmap for post data sorted by likes

  // Shows the loading containers when the content is loading
  const showLoading = () => {
    $("main .loading-container").show();
  };

  // Hides the loading containers when the content is done loading
  const hideLoading = () => {
    $("main .loading-container").hide();
  };

  // Generates a string HTML that will be converted to an actual element later on
  const generatePost = (postData) => {
    return `
    <div class="container" id="${postData._id}">
    <header class="food-img">
      <a href="/food.html?p=${postData._id}">
        <img src="${postData.post_img}" alt="Food pic" />
      </a>
    </header>
    <footer class="food-details">
      <div class="food-details-container">
        <div class="food-tags"> 
            ${generateTags(postData.categories)}
        </div>
        <p class="like-count">${postData.likes}</p>
        <span class="material-symbols-outlined">
          favorite
        </span>
      </div>
    </footer>
  </div>
    `;
  };

  // Appends generated HTML of each post to the post container that contains the posts
  const appendPosts = (posts) => {
    for (let i = 0; i < posts.length; ++i) {
      const post = $(generatePost(posts[i]));
      $("main").append(post);
    }
  };

  // Performs an AJAX request in which fetches the API route for posts to return post data
  const getPosts = () => {
    showLoading();
    $.ajax({
      method: "GET",
      url: `/api/posts?p=${page}&f=${filter}&${category && `c=${category}`}`,
      cache: true,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        hideLoading();
        if (data.length < 5) endPage = page;
        if (filter == "date") {
          postData[page] = data;
        } else postLikesData[page] = data;
        appendPosts(data);
      },
      error: ({ responseJSON }) => {
        hideLoading();
        // Show the status popup saying that the login/signup has failed
        $(".status-popup").addClass("popup-active");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active");
        }, 2000);
      },
    });
  };

  // Removes all the current post elements in the post container
  const resetPosts = () => {
    $("main").find(".container").remove();
  };

  // Get the initial post data on page load.
  getPosts();

  // When the user changes the filter sort,
  $(".post-filter").change(function () {
    resetPosts(); // It will reset the posts first

    filter = $(this).searchKey();
    page = 0;

    // Then finds out which filter it is
    if (filter === "date") {
      if (postData[0]) {
        // If the initial post data sorted by date is found in the hash map, then load that pre-processed data
        const data = postData[0];
        appendPosts(data);
      } else getPosts(); // Else, fetch the server for posts
    } else if (filter === "likes") {
      if (postLikesData[0]) {
        // If the initial post data sorted by likes is found in the hash map, then load that pre-processed data
        const data = postLikesData[0];
        appendPosts(data);
      } else getPosts(); // Else, fetch the server for posts
    }
  });

  // When the user clicks next page,
  $(".next-page").click(function () {
    if (endPage != page) {
      // It checks first if the page isn't the last page (as far as the cache goes)
      page += 1;
      resetPosts(); // Then it resets the posts

      // It will then check if there is already a pre-processed data for the current page. If there is, then render that instead. If there is none, fetch the server for posts.
      if (filter == "date") {
        if (postData[page] == null) {
          getPosts();
        } else {
          const data = postData[page];
          appendPosts(data);
        }
      } else {
        if (postLikesData[page] == null) {
          getPosts();
        } else {
          const data = postLikesData[page];
          appendPosts(data);
        }
      }
    }
  });

  // When the user clicks previous page,
  $(".prev-page").click(function () {
    if (page != 0) {
      // It checks first if the page is not the first page
      page -= 1;
      resetPosts(); // Then it resets the posts

      // It will then check if there is already a pre-processed data for the current page. If there is, then render that instead. If there is none, fetch the server for posts.
      if (filter == "date") {
        if (postData[page] == null) {
          getPosts();
        } else {
          const data = postData[page];
          appendPosts(data);
        }
      } else {
        if (postLikesData[page] == null) {
          getPosts();
        } else {
          const data = postLikesData[page];
          appendPosts(data);
        }
      }
    }
  });
  // END OF POSTS MANAGEMENT CODE

  // START OF CATEGORY MANAGEMENT CODE

  const categoryData = {}; // Hashmap for category data
  let catPage = urlQuery.get("cp") || 0; // Get the category page number url parameter. If none, set to 0
  let endCatPage;

  // Shows the loading categories when the categories are loading
  const showLoadingTag = () => {
    $(".tag-list .loading-tag").show();
  };

  // Hides the loading categories when the categories are loading
  const hideLoadingTag = () => {
    $(".tag-list .loading-tag").hide();
  };

  // Generates the tag HTML needed for posts and for the tag-list container to use later on
  const generateTags = (tags) => {
    let tagsHTML = "";

    for (let i = 0; i < tags.length; ++i) {
      tagsHTML += `<a href="/index.html?c=${tags[i]}"><button class="tag-post">${tags[i]}</button></a>`;
    }

    return tagsHTML;
  };

  // Appends the tag HTML for each category to the tag-list container
  const appendTags = (tags) => {
    for (let i = 0; i < tags.length; ++i) {
      const focusedTag = category == tags[i].name ? "tag-focused" : "";
      const tag = $(
        `<a href="/index.html?c=${tags[i].name}"><button class='tag ${focusedTag}'>${tags[i].name}</button> </a>`
      );
      $(".tag-list").append(tag);
    }
  };

  // Removes all tags inside the tag-list container
  const resetCategories = () => {
    $(".tag-list").find(".tag").remove();
  };

  // Performs an AJAX request in which fetches the API route for categories to return category data
  const getCategories = () => {
    showLoadingTag();
    $.ajax({
      method: "GET",
      url: `/api/categories?cp=${catPage}`,
      cache: true,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        hideLoadingTag();
        if (data.length < 5) endCatPage = catPage;
        categoryData[catPage] = data;
        appendTags(data);
      },
      error: ({ responseJSON }) => {
        hideLoading();
        // Show the status popup saying that the login/signup has failed
        $(".status-popup").addClass("popup-active");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active");
        }, 2000);
      },
    });
  };

  // Get the initial category data on page load.
  getCategories();

  // When the user clicks next page on category,
  $(".next-cats").click(function () {
    if (endCatPage != catPage) {
      // It checks first if it's not the last page (as far as the cache goes)
      catPage += 1;
      resetCategories(); // Then it resets the posts

      // It will then check if there is already a pre-processed data for the current page. If there is, then render that instead. If there is none, fetch the server for categories.
      if (categoryData[catPage] == null) {
        getCategories();
      } else {
        const data = categoryData[catPage];
        appendTags(data);
      }
    }
  });

  // When the user clicks previous page on category,
  $(".prev-cats").click(function () {
    if (catPage != 0) {
      // It checks first if it's not the first page
      catPage -= 1;
      resetCategories(); // Then it resets the tags

      // It will then check if there is already a pre-processed data for the current page. If there is, then render that instead. If there is none, fetch the server for categories.
      if (categoryData[catPage] == null) {
        getCategories();
      } else {
        const data = categoryData[catPage];
        appendTags(data);
      }
    }
  });

  // END OF CATEGORY MANAGEMENT CODE

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

  var searchKey;
  $("input[name='search-bar']").on("keyup", function() {
    searchKey = $(this).val();
    if (searchKey.trim() !== "") {
      $.ajax({
        url: `/api/searchCategories?k=${searchKey}`,
        type: "GET",
        success: function(response) {
          $(".search-results").empty();
          response.forEach(function(category) {
            $(".search-results").append($(`<div><a href="/index.html?p=0&f=date&c=${category.name}">${category.name}</a></div>`));
          });
        },
        error: function() {
          $(".search-results").empty();
          $(".search-results").append($("<div>").text("Error occured."));
        }
      });
    } else {
      $(".search-results").empty();
    }
  });

 $(".search").submit(function (event) {
  event.preventDefault();
  window.location.href = `/index.html?p=0&f=date&c=${searchKey}`
})

});
