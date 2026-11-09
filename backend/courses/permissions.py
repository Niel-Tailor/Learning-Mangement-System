from rest_framework.permissions import BasePermission , SAFE_METHODS

class CoursePermission(BasePermission):
    """"Anyone logged in can view courses
    Teachers and admin can create them
    Only the course's teacher or an admin can edit or delete one"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ["teacher", "admin"]

    def has_object_permission(self, request, view, course):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == "admin" or course.teacher == request.user


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "student"