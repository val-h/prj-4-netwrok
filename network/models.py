from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    followers = models.ManyToManyField(
        'User',
        blank=True,
        related_name='following')
    pfp = models.ImageField(
        upload_to='media',
        default='media/open_SUS.png',
        blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "created_at": self.created_at,
            "username": self.username,
            "is_staff": self.is_staff,
            "is_active": self.is_active,
            "pfp": self.pfp.url
        }

    def follow_serialize(self):
        followers = self.followers.count()
        following = self.following.count()

        return {
            "user_id": self.id,
            "followers": followers,
            "following": following,
        }


class Post(models.Model):
    id = models.AutoField(primary_key=True)
    op = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    image = models.ImageField(upload_to='media', blank=True)
    likes = models.ManyToManyField(
        User,
        blank=True,
        related_name='liked_posts')

    def serialize(self):
        likes = [like.id for like in self.likes.all()]
        return {
            "id": self.id,
            "op": self.op.serialize(),
            "content": self.content,
            "image": self.image.url,
            "created_at": self.created_at,
            "likes": likes,
        }


# Still not implemented, for later
class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user,
            "created_at": self.created_at,
            "post_id": self.post.id,
        }
