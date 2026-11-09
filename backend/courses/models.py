from django.conf import settings
from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="courses")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    """Links a student to the course they have joined"""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)


    class Meta:
        ordering = ["-enrolled_at"]
        # A students can only enroll in a course once
        unique_together = ("student", "course")


    def __str__(self):
        return f"{self.student} - {self.course}"
    