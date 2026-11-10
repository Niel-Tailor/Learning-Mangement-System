from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from courses.models import Course, Enrollment

DEMO_PASSWORD = "test123$"

TEACHERS = [
    ("teacher1", "Ada", "Lovelace"),
    ("teacher2", "Alan", "Turing"),
]

STUDENTS = [
    ("student1", "Sam", "Patel"),
    ("student2", "Priya", "Shah"),
    ("student3", "Tom", "Evans"),
]

COURSES = [
    ("Python Basics", "Variables, loops and functions.", "teacher1"),
    ("Web Development with Django", "Models, views and REST APIs.", "teacher1"),
    ("Intro to Algorithms", "Sorting, searching and Big O notation.", "teacher2"),
]

# (student, course title, completed)
ENROLLMENTS = [
    ("student1", "Python Basics", True),
    ("student1", "Web Development with Django", False),
    ("student2", "Python Basics", False),
    ("student3", "Intro to Algorithms", False),
]


class Command(BaseCommand):
    help = "Fill the database with demo teachers, students, courses and enrollments."

    @transaction.atomic
    def handle(self, *args, **options):
        users = {}
        for username, first, last in TEACHERS:
            users[username] = self.make_user(username, first, last, "teacher")
        for username, first, last in STUDENTS:
            users[username] = self.make_user(username, first, last, "student")

        courses = {}
        for title, description, teacher in COURSES:
            course, _ = Course.objects.get_or_create(
                title=title,
                defaults={"description": description, "teacher": users[teacher]},
            )
            courses[title] = course

        for student, title, completed in ENROLLMENTS:
            Enrollment.objects.update_or_create(
                student=users[student],
                course=courses[title],
                defaults={"completed": completed},
            )

        self.stdout.write(self.style.SUCCESS(
            f"Demo data ready: {len(TEACHERS)} teachers, {len(STUDENTS)} students, "
            f"{len(COURSES)} courses. Demo password: {DEMO_PASSWORD}"
        ))

    def make_user(self, username, first_name, last_name, role):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "email": f"{username}@example.com",
                "role": role,
            },
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        return user