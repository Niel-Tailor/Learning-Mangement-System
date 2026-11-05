from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
ROLE_CHOICES = [
    ("student", "Student"),
    ("teacher", "Teacher"),
    ("admin", "Admin"),
]

class User(AbstractUser):
    """A user of the LMS. Every user has one role."""

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")

    def save(self, *args, **kwargs):
        # Users made with `createsuperuser` should be LMS admins.
        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username    