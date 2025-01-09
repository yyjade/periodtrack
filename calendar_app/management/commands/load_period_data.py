from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from calendar_app.models import PeriodCycle
import json
import os
from django.conf import settings
from datetime import datetime

class Command(BaseCommand):
    help = 'Load initial period data from JSON file into database'

    def handle(self, *args, **kwargs):
        # Create a test user if it doesn't exist
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com'}
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created test user: testuser'))

        # Load data from JSON file
        json_path = os.path.join(settings.BASE_DIR, 'calendar_app/static/calendar_app/data/data.json')
        with open(json_path, 'r') as f:
            data = json.load(f)

        # Create period cycles
        periods_created = 0
        for period in data['periods']:
            PeriodCycle.objects.get_or_create(
                user=user,
                cycle_start_date=datetime.strptime(period['cycle_start_date'], '%Y-%m-%d').date(),
                period_length=period['period_length']
            )
            periods_created += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {periods_created} period cycles for user {user.username}')
        ) 