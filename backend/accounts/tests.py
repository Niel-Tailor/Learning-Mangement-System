from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import User

PASSWORD = "Test123$"


class AuthTests(APITestCase):
    def test_register_creates_user_and_returns_token(self):
        response = self.client.post(
            reverse("register"),
            {"username": "student1", "email": "s1@example.com",
             "password": PASSWORD, "role": "student"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        user = User.objects.get(username="student1")
        self.assertEqual(user.role, "student")
        self.assertTrue(user.check_password(PASSWORD))  # stored hashed, not plain

    def test_cannot_register_as_admin(self):
        response = self.client.post(
            reverse("register"),
            {"username": "sneaky", "password": PASSWORD, "role": "admin"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="sneaky").exists())

    def test_login_with_correct_password(self):
        User.objects.create_user(username="student1", password=PASSWORD, role="student")
        response = self.client.post(
            reverse("login"), {"username": "student1", "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_login_with_wrong_password(self):
        User.objects.create_user(username="student1", password=PASSWORD, role="student")
        response = self.client.post(
            reverse("login"), {"username": "student1", "password": "wrong"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_login(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        user = User.objects.create_user(username="student1", password=PASSWORD, role="student")
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "student1")

    def test_logout_deletes_token(self):
        user = User.objects.create_user(username="student1", password=PASSWORD, role="student")
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.post(reverse("logout"))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Token.objects.filter(user=user).exists())


class UserAdminTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("admin", "admin@example.com", PASSWORD)
        self.student = User.objects.create_user(username="student1", password=PASSWORD, role="student")

    def test_superuser_is_forced_to_admin_role(self):
        self.assertEqual(self.admin.role, "admin")

    def test_admin_can_list_users(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_student_cannot_list_users(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)