document.addEventListener('DOMContentLoaded', () => {

    // Add window on scroll loading for posts

    // by default, load current posts
    document.querySelector('#all-posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    get_posts();

    // All posts button
    document.querySelector('#all-posts').onclick = () => {
        // Change to the appropriate view
        document.querySelector('#all-posts-view').style.display = 'block';
        document.querySelector('#profile-view').style.display = 'none';

        // clear current view
        document.querySelector('#posts').innerHTML = "";

        // get the posts
        get_posts();
    };

    // Profile button
    document.querySelector('#profile').onclick = () => {
        // Change to the appropriate view
        document.querySelector('#all-posts-view').style.display = 'none';
        document.querySelector('#profile-view').style.display = 'block';

        get_profile();
    };
});

function get_posts() {
    // fetch the posts
    fetch('/api/v1/posts')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.posts.forEach(add_post);
        })
}

function add_post(contents) {
    const post = document.createElement('div');
    post.className = 'post';
    // post.innerHTML = contents['content'];
    post.innerHTML = `
        <h4>
            <img class="post-pfp" src="${contents['op']['pfp']}" alt="Profile Picture"> - 
            ${contents['op']['username']}
        </h4>
        <p class="post-date">${contents['created_at']}</p>
        <p class="post-content">${contents['content']}</p>
        <img class="post-img" src="${contents['image']}" alt="image">
        <p class="post-likes">&#128151; 🤍 ${contents['likes']}</p>
    `;
    document.querySelector('#posts').append(post);
}

function get_profile() {
    fetch('/api/v1/profile')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            profile_view = document.querySelector('#profile-view');
            profile_view.innerHTML = `
            <h1>${data.user['username']}</h1>
            `;
            if (data.user['is_staff']) {
                profile_view.innerHTML += `<div>BIG BOSS</div>`;
            }
            if (data.user['pfp']) {
                profile_view.innerHTML += `<img id="profile-pfp" src="${data.user['pfp']}" alt="Profile Picture">`;
                console.log(data.user['pfp'])
            } else {
                profile_view.innerHTML += 'No profile Picture :<';
            }
        });
}
