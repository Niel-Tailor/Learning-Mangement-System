from django.contrib import admin

from .models import Course, Enrollment


class EnrollmentInline(admin.TabularInline):
    model = Enrollment
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "teacher", "enrollment_count", "created_at")
    list_filter = ("teacher",)
    search_fields = ("title", "description")
    inlines = [EnrollmentInline]

    @admin.display(description="Enrolled")
    def enrollment_count(self, obj):
        return obj.enrollments.count()


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "completed", "enrolled_at")
    list_filter = ("completed", "course")