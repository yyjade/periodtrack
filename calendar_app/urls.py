from django.urls import path
from . import views

app_name = 'calendar_app'

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('api/periods/', views.get_period_data, name='get_period_data'),
    path('api/periods/update/', views.update_period, name='update_period'),
    path('api/periods/<int:period_id>/delete/', views.delete_period, name='delete_period'),
    path('api/periods/mark/', views.mark_period_day, name='mark_period_day'),
]
