from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email","first_name", "last_name", "role"]



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,min_length=8)
    #people can sign up as a student or a teacher, Admisn can only be made by other admins
    role = serializers.ChoiceField(choices=["student", "teacher"], default="student")     

    class Meta:
        model = User   
        fields = ["username","email", "first_name", "last_name", "password", "role"]


    def create(self, validated_data):
        # create_user hashes the password before saving.
        return User.objects.create_user(**validated_data)
