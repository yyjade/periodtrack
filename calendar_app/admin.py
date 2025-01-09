from django.contrib import admin
from .models import PeriodCycle

@admin.register(PeriodCycle)
class PeriodCycleAdmin(admin.ModelAdmin):
    list_display = ('user', 'cycle_start_date', 'period_length', 'created_at')
    list_filter = ('user', 'cycle_start_date')
    search_fields = ('user__username', 'cycle_start_date')
    ordering = ('-cycle_start_date',)
