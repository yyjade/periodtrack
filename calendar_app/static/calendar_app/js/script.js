class PeriodCalendar {
    constructor() {
        this.selectedDate = new Date();
        this.periodDates = [];
        this.ovulationDates = [];
        this.predictionDates = [];
        this.isSaving = false;
        
        // Store CSRF token from cookie
        this.csrfToken = this.getCSRFToken();
        
        // Initialize DOM elements first
        this.initializeCalendar();
        
        // Then load data and render
        this.loadPeriodData().then(() => {
            this.calculateNextPeriod();
            this.calculateOvulationDays();
            this.bindEvents();
            this.renderCalendar();
        });
        this.bindPeriodButtons();
    }

    getCSRFToken() {
        // First try to get from cookie
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        
        // If not in cookie, try to get from form
        if (!cookieValue) {
            const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
            if (tokenElement) {
                cookieValue = tokenElement.value;
            }
        }
        
        return cookieValue;
    }

    initializeCalendar() {
        const initializeElements = () => {
            this.monthYearDisplay = document.getElementById('monthYearDisplay');
            this.calendarGrid = document.getElementById('calendarGrid');

            if (!this.monthYearDisplay || !this.calendarGrid) {
                console.log('Calendar elements not found, retrying...');
                setTimeout(initializeElements, 100);
                return;
            }
        };

        initializeElements();
    }

    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
        document.getElementById('today').addEventListener('click', () => this.goToToday());
    }

    calculateNextPeriod() {
        if (this.periodDates.length >= 2) {
            const sortedPeriods = [...this.periodDates].sort((a, b) => 
                new Date(b.start) - new Date(a.start)
            );

            let totalDays = 0;
            for (let i = 0; i < sortedPeriods.length - 1; i++) {
                const currentStart = new Date(sortedPeriods[i].start);
                const nextStart = new Date(sortedPeriods[i + 1].start);
                totalDays += Math.abs((currentStart - nextStart) / (1000 * 60 * 60 * 24));
            }
            const avgCycleLength = Math.round(totalDays / (sortedPeriods.length - 1));

            const lastPeriod = sortedPeriods[0];
            const lastStart = new Date(lastPeriod.start);
            const lastEnd = new Date(lastPeriod.end);
            const periodLength = Math.abs((lastEnd - lastStart) / (1000 * 60 * 60 * 24)) + 1;

            const nextStart = new Date(lastStart);
            nextStart.setDate(nextStart.getDate() + avgCycleLength);
            const nextEnd = new Date(nextStart);
            nextEnd.setDate(nextEnd.getDate() + periodLength - 1);

            this.predictionDates = [{
                start: nextStart,
                end: nextEnd
            }];
        }
    }

    calculateOvulationDays() {
        if (this.periodDates.length > 0) {
            const sortedPeriods = [...this.periodDates].sort((a, b) => 
                new Date(b.start) - new Date(a.start)
            );

            this.ovulationDates = sortedPeriods.map(period => {
                const periodStart = new Date(period.start);
                const ovulationDate = new Date(periodStart);
                ovulationDate.setDate(periodStart.getDate() + 14);
                
                const ovulationWindow = {
                    start: new Date(ovulationDate),
                    end: new Date(ovulationDate)
                };
                ovulationWindow.start.setDate(ovulationDate.getDate() - 2);
                ovulationWindow.end.setDate(ovulationDate.getDate() + 2);
                
                return ovulationWindow;
            });
        }
    }

    async loadPeriodData() {
        try {
            const response = await fetch('/api/periods/');
            const data = await response.json();
            
            if (data?.periods?.length) {
                this.periodDates = data.periods.map(period => {
                    const startDate = new Date(period.cycle_start_date);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + period.period_length - 1);
                    
                    return {
                        id: period.id,
                        start: startDate,
                        end: endDate
                    };
                });

                if (this.periodDates.length >= 2) {
                    let totalDays = 0;
                    for (let i = 1; i < this.periodDates.length; i++) {
                        totalDays += (this.periodDates[i].start.getTime() - 
                                    this.periodDates[i-1].start.getTime()) / 
                                    (1000 * 60 * 60 * 24);
                    }
                    this.averageCycleLength = Math.round(totalDays / (this.periodDates.length - 1));
                }

                this.calculateNextPeriod();
                this.calculateOvulationDays();
                this.renderCalendar();
            }
        } catch (error) {
            console.error('Error loading period data:', error);
            this.periodDates = [];
            
            Toastify({
                text: "Failed to load period data. Please try again later.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ef4444, #dc2626)",
                }
            }).showToast();
        }
    }

    async savePeriodData(startDate, periodLength, periodId = null) {
        if (this.isSaving) return;
        
        this.isSaving = true;
        try {
            if (!this.csrfToken) {
                throw new Error('CSRF token not found');
            }

            const formattedStartDate = startDate.toISOString().split('T')[0];
            const payload = {
                cycle_start_date: formattedStartDate,
                period_length: parseInt(periodLength)
            };

            if (periodId) {
                payload.period_id = periodId;
            }
            
            const response = await fetch('/api/periods/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify(payload),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save period data');
            }

            await this.loadPeriodData();
            
            Toastify({
                text: "Period data saved successfully!",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #22c55e, #16a34a)",
                }
            }).showToast();

        } catch (error) {
            console.error('Error saving period data:', error);
            Toastify({
                text: error.message || "Failed to save period data. Please try again.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ef4444, #dc2626)",
                }
            }).showToast();
        } finally {
            this.isSaving = false;
        }
    }

    async deletePeriodData(periodId) {
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch(`/api/periods/${periodId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken.value
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete period data');
            }

            await this.loadPeriodData();
            
            Toastify({
                text: "Period data deleted successfully!",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #22c55e, #16a34a)",
                }
            }).showToast();

        } catch (error) {
            console.error('Error deleting period data:', error);
            Toastify({
                text: error.message || "Failed to delete period data. Please try again.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ef4444, #dc2626)",
                }
            }).showToast();
        }
    }

    renderCalendar() {
        if (!this.calendarGrid || !this.monthYearDisplay) {
            console.log('Calendar elements not ready for rendering');
            return;
        }

        this.calendarGrid.innerHTML = '';
        
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        weekDays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'weekday';
            dayElement.textContent = day;
            this.calendarGrid.appendChild(dayElement);
        });

        const days = this.generateCalendarDays();
        days.forEach(day => {
            const dayElement = this.createDayElement(day);
            this.calendarGrid.appendChild(dayElement);
        });

        this.updateMonthYearDisplay();
    }

    generateCalendarDays() {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let firstDayOfWeek = firstDay.getDay() || 7;
        
        const days = [];
        
        for (let i = 1; i < firstDayOfWeek; i++) {
            days.push({ 
                date: new Date(year, month, 1 - (firstDayOfWeek - i)),
                isCurrentMonth: false 
            });
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push({
                date: new Date(year, month, day),
                isCurrentMonth: true
            });
        }
        
        return days;
    }

    createDayElement(dayInfo) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const today = new Date();
        const isToday = this.isSameDay(dayInfo.date, today);
        
        if (isToday) {
            dayElement.classList.add('day-today');
        }
        
        if (!dayInfo.isCurrentMonth) {
            dayElement.classList.add('day-other-month');
        }
        
        const dateClasses = {
            'day-period': [this.isPeriodDay, 'Period Day'],
            'day-prediction': [this.isPredictedPeriodDay, 'Predicted Period Day'],
            'day-ovulation': [this.isOvulationDay, 'Ovulation Window']
        };

        Object.entries(dateClasses).forEach(([className, [checkFn, title]]) => {
            if (checkFn.call(this, dayInfo.date)) {
                dayElement.classList.add(className);
                dayElement.setAttribute('title', title);
            }
        });
        
        dayElement.textContent = dayInfo.date.getDate();
        dayElement.addEventListener('click', (event) => this.selectDate(dayInfo.date, event));
        dayElement.setAttribute('data-date', dayInfo.date.toISOString());
        
        return dayElement;
    }

    navigateMonth(delta) {
        this.selectedDate = new Date(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + delta,
            1
        );
        this.renderCalendar();
    }

    goToToday() {
        this.selectedDate = new Date();
        this.renderCalendar();
    }

    updateMonthYearDisplay() {
        this.monthYearDisplay.textContent = this.selectedDate.toLocaleDateString(undefined, { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    checkDateInRange(date, ranges) {
        return ranges.some(period => {
            const start = new Date(period.start);
            const end = new Date(period.end);
            return (date >= start && date <= end) || 
                   this.isSameDay(date, start) || 
                   this.isSameDay(date, end);
        });
    }

    isPeriodDay(date) {
        return this.checkDateInRange(date, this.periodDates);
    }

    isPredictedPeriodDay(date) {
        return this.checkDateInRange(date, this.predictionDates);
    }

    isOvulationDay(date) {
        return this.checkDateInRange(date, this.ovulationDates);
    }

    selectDate(date, event) {
        this.selectedDate = date;
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        this.updateDateDisplay();
    }

    updateDateDisplay() {
        console.log('Selected date:', this.selectedDate);
    }

    initializeTooltips() {
        tippy('.calendar-day', {
            content: (reference) => {
                const date = new Date(reference.getAttribute('data-date'));
                let content = date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                if (this.isPeriodDay(date)) content += '<br>Period Day';
                if (this.isOvulationDay(date)) content += '<br>Ovulation Window';
                return content;
            },
            allowHTML: true,
            theme: 'light',
            animation: 'scale',
            delay: [200, 0]
        });
    }

    bindPeriodButtons() {
        document.getElementById('markStart').addEventListener('click', () => this.markPeriodDay('start'));
        document.getElementById('markEnd').addEventListener('click', () => this.markPeriodDay('end'));
    }

    async markPeriodDay(action) {
        if (this.isSaving) return;
        
        this.isSaving = true;
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch('/api/periods/mark/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken.value
                },
                body: JSON.stringify({ action }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to mark period day');
            }

            const data = await response.json();
            
            // Reload period data and update calendar
            await this.loadPeriodData();
            
            // Show success message
            Toastify({
                text: data.message,
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #22c55e, #16a34a)",
                }
            }).showToast();

            // Trigger confetti animation for positive feedback
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

        } catch (error) {
            console.error('Error marking period day:', error);
            Toastify({
                text: error.message || "Failed to mark period day. Please try again.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ef4444, #dc2626)",
                }
            }).showToast();
        } finally {
            this.isSaving = false;
        }
    }
}

// Move the calendar initialization to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    new PeriodCalendar();
});
