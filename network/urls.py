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
    path('create_post/', views.create_post, name='create_post'),

    # API
    path('api/v1/posts', views.posts, name='posts'),
    path('api/v1/posts/<int:post_id>', views.post, name="post"),
    path('api/v1/profile', views.profile, name="profile"),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
