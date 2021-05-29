document.addEventListener('DOMContentLoaded', () => {

    // Add window on scroll loading for posts


    // by default, load current posts
    get_posts();

    document.querySelector('#all-posts').onclick = () => {
        // clear current view
        document.querySelector('#posts').innerHTML = "";
        // get the posts
        get_posts();
    };

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
        post.innerHTML = `<h4>${contents['op']['username']}</h4>
        <p>${contents['content']}</p>
        <img src="${contents['image']}" alt="image">
        <p>&#128151; ${contents['likes']}</p>`;
        document.querySelector('#posts').append(post);
    }

});