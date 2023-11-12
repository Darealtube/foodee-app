$(document).ready(() => {
  var urlQuery = new URLSearchParams(window.location.search);
  const postData = {}; // Hashmap for post data sorted by date
  const postLikesData = {}; // Hashmap for post data sorted by likes

  // Get the category (c), the filter (f), and the page number (p) of the posts based on the url. If there is no url parameter, then just assign default values.
  let category = urlQuery.get("c");
  let filter = urlQuery.get("f") || "date";
  let page = urlQuery.get("p") || 0;
  let endPage;

  const likedPosts = new Set();

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

    filter = $(this).val();
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

  // Likes
  const likePost = (postId, operation) => {
    const apiRoute =
      operation === "like" ? "/api/posts/like" : "/api/posts/dislike";
    $.ajax({
      method: "PUT",
      url: apiRoute,
      cache: true,
      data: JSON.stringify({ post: postId, operation }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
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

  $("main").on("click", ".container .like", function () {
    const postId = $(this).closest(".container").attr("id");
    const postLikes = $(`#${postId} .like-count`).text();

    if (!likedPosts.has(postId)) {
      likedPosts.add(postId);
      $(this).css("color", "red");
      $(`#${postId} .like-count`).text(parseInt(postLikes) + 1);
      likePost(postId, "like");
    } else {
      likedPosts.delete(postId);
      $(this).css("color", "#f6f4e8");
      $(`#${postId} .like-count`).text(parseInt(postLikes) - 1);
      likePost(postId, "dislike");
    }
  });
});
