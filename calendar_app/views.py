from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import PeriodCycle
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from django.middleware.csrf import get_token

@login_required(login_url='calendar_app:login')
def index(request):
    return render(request, 'calendar_app/index.html')

@login_required
def get_period_data(request):
    periods = PeriodCycle.objects.filter(user=request.user).values('id', 'cycle_start_date', 'period_length')
    return JsonResponse({'periods': list(periods)})

@login_required
@csrf_exempt
def update_period(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        cycle_start_date = datetime.strptime(data['cycle_start_date'], '%Y-%m-%d').date()
        period_length = data['period_length']
        period_id = data.get('period_id')
        
        if period_id:
            try:
                period = PeriodCycle.objects.get(id=period_id, user=request.user)
                period.period_length = period_length
                period.save()
            except PeriodCycle.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Period not found'}, status=404)
        else:
            PeriodCycle.objects.create(
                user=request.user,
                cycle_start_date=cycle_start_date,
                period_length=period_length
            )
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)

@login_required
@csrf_exempt
def delete_period(request, period_id):
    if request.method == 'DELETE':
        try:
            period = PeriodCycle.objects.get(id=period_id, user=request.user)
            period.delete()
            return JsonResponse({'status': 'success'})
        except PeriodCycle.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Period not found'}, status=404)
    return JsonResponse({'status': 'error'}, status=400)

def login_view(request):
    if request.user.is_authenticated:
        return redirect('calendar_app:index')
        
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Generate CSRF token before redirect
            get_token(request)
            return redirect('calendar_app:index')
        else:
            messages.error(request, 'Invalid username or password.')
            
    return render(request, 'calendar_app/login.html')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('calendar_app:index')
        
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('calendar_app:index')
        else:
            for error in form.errors.values():
                messages.error(request, error)
    
    return render(request, 'calendar_app/register.html')

def logout_view(request):
    logout(request)
    return redirect('calendar_app:login')

@login_required
@csrf_exempt
def mark_period_day(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        action = data.get('action')  # 'start' or 'end'
        today = datetime.now().date()
        
        if action == 'start':
            # Create new period cycle starting today
            PeriodCycle.objects.create(
                user=request.user,
                cycle_start_date=today,
                period_length=1  # Initial length of 1 day
            )
            return JsonResponse({'status': 'success', 'message': 'Period start marked'})
            
        elif action == 'end':
            # Find the most recent period cycle
            try:
                latest_period = PeriodCycle.objects.filter(
                    user=request.user,
                    cycle_start_date__lte=today
                ).latest('cycle_start_date')
                
                # Calculate period length
                period_length = (today - latest_period.cycle_start_date).days + 1
                latest_period.period_length = period_length
                latest_period.save()
                
                return JsonResponse({'status': 'success', 'message': 'Period end marked'})
            except PeriodCycle.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No active period found to end'
                }, status=400)
                
    return JsonResponse({'status': 'error'}, status=400)
