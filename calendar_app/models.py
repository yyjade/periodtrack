from django.db import models
from django.contrib.auth.models import User

class PeriodCycle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cycle_start_date = models.DateField()
    period_length = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-cycle_start_date']

    def __str__(self):
        return f"{self.user.username}'s period - {self.cycle_start_date}"
