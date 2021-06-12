from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

# app_name = 'network'
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # my urls
    path('createpost/', views.create_post, name='create_post'),

    # API
    path(
        'api/v1/posts/start=<int:start>&end=<int:end>',
        views.posts, name='posts'),

    # path('api/v1/posts/<int:post_id>', views.post, name="post"),
    path('api/v1/profile', views.profile, name="profile"),
    path('api/v1/profile/<int:profile_id>', views.profile, name='profiles'),
    path('api/v1/u-posts/<int:user_id>', views.user_posts, name='user_posts'),
    path(
        'api/v1/u-follow-count/<int:user_id>',
        views.follow_count, name='follow_count'),

    path('api/v1/follow/<int:user_id>', views.follow, name='follow'),
    path(
        'api/v1/followed-posts',
        views.followed_posts, name='followed-posts'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
