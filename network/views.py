from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import User, Post
from .forms import PostForm


def index(request):
    form = PostForm()
    return render(request, "network/index.html", context={
        'form': form
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# Standard views
@login_required
def create_post(request):
    if request.method == 'POST':
        # Never forget request.FILES
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            new_post = form.save(commit=False)
            new_post.op = request.user
            new_post.save()
            return redirect('index')


# API
def posts(request, start=1, end=10):
    if request.method == 'GET':
        posts = Post.objects.order_by('-created_at').all()[start:end + 1]
        return JsonResponse({
            "posts": [post.serialize() for post in posts]
        })


@login_required
@csrf_exempt
def post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Exception:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == 'GET':
        return JsonResponse({
            "post": [post.serialize()]
        })
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            print(data.get('content'))
            post.content = data.get("content")
            post.save()
            return JsonResponse({"message": "Post updated"}, status=201)
        except Exception:
            return JsonResponse({"message": "Update failed."}, status=501)

    # Not in use
    elif request.method == 'DELETE':
        # Probably wrong
        del post
        return JsonResponse({"message": "Post deleted."}, status=201)

    else:
        return JsonResponse({"error": "Invalid request method."})


def profile(request, profile_id=None):
    if request.method == 'GET':
        if profile_id is None:
            user = request.user.serialize()
            is_current_user = True
            following = False
        else:
            profile = User.objects.get(id=profile_id)
            user = profile.serialize()
            is_current_user = request.user == profile
            following = request.user in profile.followers.all()

        return JsonResponse({
            "user": user,
            "is_current_user": is_current_user,
            "following": following,
            })
    else:
        return JsonResponse({"error": "Invalid request method."})


def user_posts(request, user_id, start, end):
    user = User.objects.get(id=user_id)
    posts = user.posts.order_by('-created_at').all()[start:end + 1]
    return JsonResponse({
        "posts": [post.serialize() for post in posts]
    })


def follow_count(request, user_id):
    user = User.objects.get(id=user_id)
    if request.method == 'GET':
        return JsonResponse({
            "followers_data": user.follow_serialize()
        })


@login_required
def follow(request, user_id):
    user = User.objects.get(id=user_id)
    if request.user not in user.followers.all():
        print('User followed')
        user.followers.add(request.user)
        user.save()
        return JsonResponse({"message": "Followed successfully."}, status=201)
    else:
        print('User unfollowed')
        user.followers.remove(request.user)
        return JsonResponse(
            {"message": "Unfollowed successfully."},
            status=201)


@login_required
def followed_posts(request, start, end):
    posts = []
    for followed_user in request.user.following.all():
        # fancy oneliner
        posts += [
            post.serialize()
            for post in followed_user.posts.all()]

        # for post in followed_user.posts.order_by('-created_at').all():
        #     posts.append(post.serialize())

    if posts:
        posts.sort(key=lambda post: post['created_at'], reverse=True)
        return JsonResponse({"posts": posts[start:end + 1]}, status=201)
    else:
        return JsonResponse({"message": "No posts"}, status=201)


@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        if request.user not in post.likes.all():
            post.likes.add(request.user)
            post.save()
            return JsonResponse({
                "message": "Successfully liked.",
                "likes": [like.id for like in post.likes.all()]},
                status=201)
        else:
            post.likes.remove(request.user)
            post.save()
            return JsonResponse({
                "message": "Successfully unliked.",
                "likes": [like.id for like in post.likes.all()]},
                status=201)
    except Exception:
        return JsonResponse({"message": "Failed to like."}, status=501)


@login_required
def user_id(request):
    if request.method == 'GET':
        return JsonResponse({"user_id": request.user.id}, status=201)
