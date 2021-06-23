from django.test import TestCase, Client

from .models import Post, User


# Create your tests here.
class PostTestCase(TestCase):

    def setUp(self):
        # Load the test Posts
        u1 = User.objects.create(
            username='test',
            password='testpass123',
            email='email@test.com')

        p1 = Post.objects.create(
            op=u1,
            content='test content')

    def test_post_user(self):
        post = Post.objects.get(id=1)
        user = post.op
        self.assertEqual(user.id, 1)

    def test_post_content(self):
        post = Post.objects.get(id=1)
        self.assertEqual(post.content, 'test content')

    def test_user_posts(self):
        user = User.objects.get(id=1)
        user_posts = user.posts.all()
        self.assertEqual(len(user_posts), 1)
        self.assertEqual(user_posts[0].content, 'test content')
