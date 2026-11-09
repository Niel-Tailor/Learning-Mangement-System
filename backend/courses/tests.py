from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Course, Enrollment

PASSWORD = "test123$"


class CourseTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username="teacher1", password=PASSWORD, role="teacher")
        self.other_teacher = User.objects.create_user(username="teacher2", password=PASSWORD, role="teacher")
        self.student = User.objects.create_user(username="student1", password=PASSWORD, role="student")
        self.admin = User.objects.create_superuser("admin", "admin@example.com", PASSWORD)
        self.course = Course.objects.create(title="Python Basics", teacher=self.teacher)
        self.detail_url = reverse("course-detail", args=[self.course.id])

    # Viewing
    def test_logged_out_cannot_list_courses(self):
        response = self.client.get(reverse("course-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_list_courses(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(reverse("course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["teacher_name"], "teacher1")

    # Creating
    def test_teacher_can_create_course_and_becomes_its_teacher(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(reverse("course-list"), {"title": "Django"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.get(title="Django").teacher, self.teacher)

    def test_admin_can_create_course(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(reverse("course-list"), {"title": "Admin Course"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse("course-list"), {"title": "Nope"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Editing and deleting
    def test_teacher_can_edit_own_course(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.patch(self.detail_url, {"title": "Python 101"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, "Python 101")

    def test_other_teacher_cannot_edit_course(self):
        self.client.force_authenticate(user=self.other_teacher)
        response = self.client.patch(self.detail_url, {"title": "Stolen"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_any_course(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.exists())

    # Enrolling
    def test_student_can_enroll(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse("course-enroll", args=[self.course.id]))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.get(self.detail_url)
        self.assertTrue(response.data["is_enrolled"])
        self.assertEqual(response.data["enrollment_count"], 1)

    def test_cannot_enroll_twice(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse("course-enroll", args=[self.course.id]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_teacher_cannot_enroll(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(reverse("course-enroll", args=[self.course.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_can_unenroll(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse("course-unenroll", args=[self.course.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Enrollment.objects.exists())


class EnrollmentTests(APITestCase):
    def setUp(self):
        teacher = User.objects.create_user(username="teacher1", password=PASSWORD, role="teacher")
        self.student = User.objects.create_user(username="student1", password=PASSWORD, role="student")
        other_student = User.objects.create_user(username="student2", password=PASSWORD, role="student")
        course = Course.objects.create(title="Python Basics", teacher=teacher)
        self.enrollment = Enrollment.objects.create(student=self.student, course=course)
        Enrollment.objects.create(student=other_student, course=course)
        self.client.force_authenticate(user=self.student)

    def test_students_only_see_their_own_enrollments(self):
        response = self.client.get(reverse("enrollment-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.enrollment.id)

    def test_student_can_mark_course_complete(self):
        url = reverse("enrollment-detail", args=[self.enrollment.id])
        response = self.client.patch(url, {"completed": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.enrollment.refresh_from_db()
        self.assertTrue(self.enrollment.completed)