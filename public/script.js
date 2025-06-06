// --- public/script.js (Updated for Server Interaction) ---

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENT SELECTORS (remain the same) --- //
  const postsContainer = document.getElementById("posts-container");
  const addPostBtn = document.getElementById("add-post-btn");
  const postModal = document.getElementById("post-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const postForm = document.getElementById("post-form");
  const modalTitle = document.getElementById("modal-title");
  const postIdInput = document.getElementById("post-id");
  const postTitleInput = document.getElementById("post-title");
  const postAuthorInput = document.getElementById("post-author");
  const postDateInput = document.getElementById("post-date");
  const postSummaryInput = document.getElementById("post-summary");
  const postContentInput = document.getElementById("post-content");
  const confirmModal = document.getElementById("confirm-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");

  // --- STATE MANAGEMENT --- //
  let currentPostIdToDelete = null;

  // --- API Communication --- //

  /**
   * Fetches all posts from the server and renders them.
   */
  async function fetchAndRenderPosts() {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts.");

      const data = await response.json();
      renderPosts(data.posts);
    } catch (error) {
      console.error("Error:", error);
      postsContainer.innerHTML =
        '<p class="text-red-500 col-span-full text-center">Failed to load posts. Is the server running?</p>';
    }
  }

  /**
   * Renders an array of posts to the DOM.
   * @param {Array} posts - The array of post objects to render.
   */
  function renderPosts(posts) {
    postsContainer.innerHTML = "";
    if (posts.length === 0) {
      postsContainer.innerHTML =
        '<p class="text-gray-500 col-span-full text-center">No blog posts yet. Click "Add New Post" to create one!</p>';
      return;
    }

    posts.forEach((post) => {
      const postElement = document.createElement("article");
      postElement.className =
        "overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:shadow-lg";
      postElement.dataset.id = post.id;
      postElement.innerHTML = `
                <div class="p-4 sm:p-6">
                    <time datetime="${post.date}" class="block text-xs text-gray-500">${post.date}</time>
                    <h3 class="mt-0.5 text-lg font-medium text-gray-900">${post.title}</h3>
                    <p class="mt-1 text-xs text-gray-500">By ${post.author}</p>
                    <p class="mt-2 line-clamp-3 text-sm/relaxed text-gray-500 post-summary">${post.summary}</p>
                    <div class="mt-4 text-sm/relaxed text-gray-700 hidden post-content">${post.content}</div>
                    <a href="#" class="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 read-more-btn">
                        Read More <span aria-hidden="true" class="block transition-all group-hover:ms-0.5">→</span>
                    </a>
                    <div class="mt-4 flex gap-2 post-actions">
                        <button class="edit-btn rounded bg-yellow-400 px-4 py-2 text-xs font-medium text-white hover:bg-yellow-500">Edit</button>
                        <button class="delete-btn rounded bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700">Delete</button>
                    </div>
                </div>
            `;
      postsContainer.appendChild(postElement);
    });
  }

  /**
   * Handles the form submission for creating or updating a post.
   */
  async function handleFormSubmit(event) {
    event.preventDefault();
    const postId = postIdInput.value;
    const isEditing = !!postId;

    const postData = {
      title: postTitleInput.value.trim(),
      author: postAuthorInput.value.trim(),
      date: postDateInput.value,
      summary: postSummaryInput.value.trim(),
      content: postContentInput.value.trim(),
    };

    const url = isEditing ? `/api/posts/${postId}` : "/api/posts";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok)
        throw new Error(`Failed to ${isEditing ? "update" : "create"} post.`);

      closePostModal();
      fetchAndRenderPosts(); // Refresh the list of posts
    } catch (error) {
      console.error("Error submitting post:", error);
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Handles the confirmed deletion of a post.
   */
  async function handleDelete() {
    if (!currentPostIdToDelete) return;

    try {
      const response = await fetch(`/api/posts/${currentPostIdToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post.");

      closeConfirmModal();
      fetchAndRenderPosts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(`Error: ${error.message}`);
    }
  }

  // --- MODAL & FORM HANDLING (UI Logic, mostly unchanged) --- //

  function openPostModal(post = null) {
    postForm.reset();
    if (post) {
      modalTitle.textContent = "Edit Post";
      postIdInput.value = post.id; // Crucial for editing
      postTitleInput.value = post.title;
      postAuthorInput.value = post.author;
      postDateInput.value = post.date;
      postSummaryInput.value = post.summary;
      postContentInput.value = post.content;
    } else {
      modalTitle.textContent = "Add a New Post";
      postIdInput.value = ""; // Ensure ID is clear for new posts
      postDateInput.valueAsDate = new Date();
    }
    postModal.classList.remove("hidden");
  }

  function closePostModal() {
    postModal.classList.add("hidden");
  }

  function openConfirmModal(postId) {
    currentPostIdToDelete = postId;
    confirmModal.classList.remove("hidden");
  }

  function closeConfirmModal() {
    confirmModal.classList.add("hidden");
    currentPostIdToDelete = null;
  }

  // --- EVENT LISTENERS --- //

  addPostBtn.addEventListener("click", () => openPostModal());
  closeModalBtn.addEventListener("click", closePostModal);
  cancelBtn.addEventListener("click", closePostModal);
  postForm.addEventListener("submit", handleFormSubmit);
  confirmDeleteBtn.addEventListener("click", handleDelete);
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);

  postsContainer.addEventListener("click", async (event) => {
    const target = event.target;
    const postElement = target.closest("article");
    if (!postElement) return;

    const postId = postElement.dataset.id;

    if (target.closest(".edit-btn")) {
      // Fetch the full post data from the article itself to pre-fill the form
      const post = {
        id: postId,
        title: postElement.querySelector("h3").textContent,
        author: postElement
          .querySelector(".text-xs.text-gray-500")
          .textContent.replace("By ", ""),
        date: postElement.querySelector("time").getAttribute("datetime"),
        summary: postElement.querySelector(".post-summary").textContent,
        content: postElement.querySelector(".post-content").textContent,
      };
      openPostModal(post);
    }

    if (target.closest(".delete-btn")) {
      openConfirmModal(postId);
    }

    if (target.closest(".read-more-btn")) {
      event.preventDefault();
      const content = postElement.querySelector(".post-content");
      content.classList.toggle("hidden");
    }
  });

  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("hidden");
  });

  // --- INITIALIZATION --- //
  fetchAndRenderPosts();
});
