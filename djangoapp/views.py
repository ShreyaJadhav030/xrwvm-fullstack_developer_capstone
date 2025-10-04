from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json
import logging

# Logger setup
logger = logging.getLogger(__name__)

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        logger.error("Invalid JSON in login request.")
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get('userName')
    password = data.get('password')

    logger.info(f"Login attempt for user: {username}")

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        logger.info(f"User {username} authenticated successfully.")
        return JsonResponse({
            "userName": username,
            "status": "Authenticated"
        })
    else:
        logger.warning(f"Failed login for user: {username}")
        return JsonResponse({
            "status": "Unauthorized",
            "message": "Invalid credentials"
        }, status=401)


@csrf_exempt
def logout_user(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        logger.error("Invalid JSON in registration request.")
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get('userName')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')

    if User.objects.filter(username=username).exists():
        logger.warning(f"Username already exists: {username}")
        return JsonResponse({"userName": username, "error": "Username already registered"}, status=400)

    if User.objects.filter(email=email).exists():
        logger.warning(f"Email already exists: {email}")
        return JsonResponse({"email": email, "error": "Email already registered"}, status=400)

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        password=password,
        email=email
    )

    login(request, user)
    logger.info(f"New user registered: {username}")
    return JsonResponse({"userName": username, "status": "Authenticated"})
