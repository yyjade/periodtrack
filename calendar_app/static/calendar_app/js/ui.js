class UIManager {
    constructor() {
        this.quotes = [
            "You are stronger than you know 💪",
            "Take care of yourself today 🌸", 
            "Listen to your body 🧘‍♀️",
            "You've got this! ✨",
            "Be kind to yourself today 💝",
            "Every day is a fresh start 🌅",
            "Your feelings are valid 💕",
            "Take it one day at a time 🌿",
            "Remember to breathe deeply 🍃",
            "You are doing great! 🌟",
            "Trust your journey 🚶‍♀️",
            "Embrace your strength 💫",
            "You are enough 🌸",
            "Stay positive, stay fighting 💪",
            "Your body, your rhythm 🎵"
        ];
        this.initializeQuotes();
        this.initializeWellnessTips();
        this.initializeCarousel();
        this.startAutoScroll();
        this.initializeTarot();
    }

    initializeQuotes() {
        const quoteElement = document.getElementById('dailyQuote');
        
        const displayNewQuote = () => {
            const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
            quoteElement.classList.remove('animate__animated', 'animate__fadeIn');
            void quoteElement.offsetWidth; // Trigger reflow
            quoteElement.textContent = randomQuote;
            quoteElement.classList.add('animate__animated', 'animate__fadeIn');
        };

        displayNewQuote(); // Initial quote
        
        // Change quote every minute
        setInterval(displayNewQuote, 60000);
    }

    initializeMusicPlayer() {
        const music = document.getElementById('bgMusic');
        const musicBtn = document.getElementById('toggleMusic');
        let isPlaying = false;

        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                music.pause();
                musicBtn.textContent = '🎵 Play Music';
            } else {
                music.play();
                musicBtn.textContent = '🎵 Pause Music';
            }
            isPlaying = !isPlaying;
        });
    }

    initializeWellnessTips() {
        const tips = document.querySelectorAll('.tip');
        tips.forEach(tip => {
            tip.addEventListener('click', () => this.handleTipClick(tip));
        });
    }

    initializeCarousel() {
        const carousel = document.querySelector('.tips-carousel');
        const tips = carousel.querySelectorAll('.tip');
        const prevBtn = document.getElementById('prevTip');
        const nextBtn = document.getElementById('nextTip');
        const tipWidth = 324;
        let currentScroll = 0;
        
        tips.forEach(tip => tip.addEventListener('click', () => tip.classList.toggle('expanded')));
        
        const updateButtons = () => {
            prevBtn.disabled = currentScroll <= 0;
            nextBtn.disabled = currentScroll >= (tips.length - 1) * tipWidth;
        };
        
        const scrollTo = (delta) => {
            currentScroll = Math.max(0, Math.min((tips.length - 1) * tipWidth, currentScroll + delta));
            carousel.scrollTo({
                left: currentScroll,
                behavior: 'smooth'
            });
            updateButtons();
        };
        
        prevBtn.addEventListener('click', () => scrollTo(-tipWidth));
        nextBtn.addEventListener('click', () => scrollTo(tipWidth));
        carousel.addEventListener('scroll', () => {
            currentScroll = carousel.scrollLeft;
            updateButtons();
        });

        const modal = document.getElementById('tipModal');
        const modalContent = modal.querySelector('.modal-body');
        const closeBtn = modal.querySelector('.close-modal');
        
        const tipContent = {
            exercise: {
                title: "Exercise During Your Period",
                icon: "🏃‍♀️",
                description: "Exercise can help reduce cramps and bloating, improve mood, and promote better sleep. Listen to your body and choose activities that feel comfortable.",
                sections: [
                    {
                        title: "Recommended Exercises",
                        content: `
                            <img src="static/calendar_app/imgs/yoga-poses.jpg" alt="Yoga poses" class="modal-image">
                            <ul>
                                <li>Gentle yoga flows</li>
                                <li>Walking in nature</li>
                                <li>Swimming</li>
                                <li>Light stretching</li>
                                <li>Pilates</li>
                            </ul>
                        `
                    },
                    {
                        title: "Benefits",
                        content: `
                            <img src="static/calendar_app/imgs/exercise-benefits.jpg" alt="Exercise benefits" class="modal-image">
                            <ul>
                                <li>Reduces cramps</li>
                                <li>Boosts mood</li>
                                <li>Better sleep</li>
                                <li>Less stress</li>
                            </ul>
                        `
                    },
                    {
                        title: "Tips & Precautions",
                        content: `
                            <img src="static/calendar_app/imgs/exercise-tips.jpg" alt="Exercise tips" class="modal-image">
                            <ul>
                                <li>Listen to your body</li>
                                <li>Stay hydrated</li>
                                <li>Wear comfortable clothing</li>
                                <li>Don't overexert yourself</li>
                            </ul>
                        `
                    }
                ]
            },
            nutrition: {
                title: "Nutrition During Your Period",
                icon: "🥗",
                description: "A balanced diet can help manage period symptoms and improve overall well-being. Focus on foods rich in nutrients and hydration.",
                sections: [
                    {
                        title: "Recommended Foods",
                        content: `
                            <img src="static/calendar_app/imgs/healthy-foods.jpg" alt="Healthy foods" class="modal-image">
                            <ul>
                                <li>Dark leafy greens rich in iron</li>
                                <li>Foods high in omega-3 fatty acids</li>
                                <li>Complex carbohydrates</li>
                                <li>Lean proteins</li>
                                <li>Water-rich fruits and vegetables</li>
                            </ul>
                        `
                    },
                    {
                        title: "Foods to Avoid",
                        content: `
                            <img src="static/calendar_app/imgs/avoid-foods.jpg" alt="Foods to avoid" class="modal-image">
                            <ul>
                                <li>Caffeine and alcohol</li>
                                <li>Salty and processed foods</li>
                                <li>Sugary snacks</li>
                                <li>Fatty foods</li>
                            </ul>
                        `
                    },
                    {
                        title: "Hydration Tips",
                        content: `
                            <img src="static/calendar_app/imgs/hydration.jpg" alt="Hydration tips" class="modal-image">
                            <ul>
                                <li>Drink plenty of water</li>
                                <li>Try herbal teas</li>
                                <li>Eat water-rich foods</li>
                                <li>Monitor urine color</li>
                            </ul>
                        `
                    }
                ]
            },
            'self-care': {
                title: "Self-Care During Your Period",
                icon: "🧘‍♀️", 
                description: "Self-care is essential for managing period symptoms and promoting overall well-being. Prioritize relaxation and comfort.",
                sections: [
                    {
                        title: "Relaxation Techniques",
                        content: `
                            <img src="static/calendar_app/imgs/relaxation.jpg" alt="Relaxation techniques" class="modal-image">
                            <ul>
                                <li>Deep breathing exercises</li>
                                <li>Meditation</li>
                                <li>Warm baths</li>
                                <li>Aromatherapy</li>
                                <li>Gentle massage</li>
                            </ul>
                        `
                    },
                    {
                        title: "Emotional Wellbeing",
                        content: `
                            <img src="static/calendar_app/imgs/emotional-care.jpg" alt="Emotional wellbeing" class="modal-image">
                            <ul>
                                <li>Journal your feelings</li>
                                <li>Practice mindfulness</li>
                                <li>Connect with loved ones</li>
                                <li>Engage in hobbies</li>
                            </ul>
                        `
                    },
                    {
                        title: "Physical Comfort",
                        content: `
                            <img src="static/calendar_app/imgs/comfort.jpg" alt="Physical comfort" class="modal-image">
                            <ul>
                                <li>Use heating pads</li>
                                <li>Wear comfortable clothing</li>
                                <li>Practice good hygiene</li>
                                <li>Take warm showers</li>
                            </ul>
                        `
                    }
                ]
            },
            rest: {
                title: "Rest and Recovery During Your Period",
                icon: "💤",
                description: "Rest and recovery are crucial for managing period symptoms and promoting overall well-being. Prioritize relaxation and comfort.",
                sections: [
                    {
                        title: "Sleep Hygiene",
                        content: `
                            <img src="static/calendar_app/imgs/sleep.jpg" alt="Sleep hygiene" class="modal-image">
                            <ul>
                                <li>Maintain a regular sleep schedule</li>
                                <li>Create a relaxing bedtime routine</li>
                                <li>Optimize your sleep environment</li>
                                <li>Limit screen time before bed</li>
                            </ul>
                        `
                    },
                    {
                        title: "Energy Management",
                        content: `
                            <img src="static/calendar_app/imgs/energy.jpg" alt="Energy management" class="modal-image">
                            <ul>
                                <li>Take regular breaks</li>
                                <li>Practice power napping</li>
                                <li>Balance activity and rest</li>
                                <li>Listen to your body's needs</li>
                            </ul>
                        `
                    },
                    {
                        title: "Recovery Activities",
                        content: `
                            <img src="static/calendar_app/imgs/recovery.jpg" alt="Recovery activities" class="modal-image">
                            <ul>
                                <li>Light stretching</li>
                                <li>Gentle walking</li>
                                <li>Reading or listening to music</li>
                                <li>Restorative yoga</li>
                            </ul>
                        `
                    }
                ]
            }
        };

        tips.forEach(tip => {
            tip.addEventListener('click', () => {
                const tipId = tip.getAttribute('data-tip-id');
                const content = tipContent[tipId];
                
                if (content?.sections) {
                    modalContent.innerHTML = `
                        <div class="modal-section">
                            <div class="modal-header">
                                <span class="modal-icon">${content.icon}</span>
                                <h2 class="modal-title">${content.title}</h2>
                                <p class="modal-description" id="typingDescription"></p>
                            </div>
                            <div class="modal-content-grid">
                                ${content.sections.map((section, index) => `
                                    <div class="content-item hidden" data-index="${index}">
                                        <h3>${section.title}</h3>
                                        ${section.content}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    this.startModalSequence(content);
                }
            });
        });

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }

    startAutoScroll() {
        const carousel = document.querySelector('.tips-carousel');
        const tips = carousel.querySelectorAll('.tip');
        const tipWidth = 324;
        let currentIndex = 0;

        const scrollToNextTip = () => {
            currentIndex = (currentIndex + 1) % tips.length;
            carousel.scrollTo({
                left: currentIndex * tipWidth,
                behavior: 'smooth'
            });
        };

        this.autoScrollInterval = setInterval(scrollToNextTip, 5000);

        const pauseScroll = () => clearInterval(this.autoScrollInterval);
        const resumeScroll = () => {
            this.autoScrollInterval = setInterval(scrollToNextTip, 5000);
        };

        carousel.addEventListener('mouseenter', pauseScroll);
        carousel.addEventListener('mouseleave', resumeScroll);
        carousel.addEventListener('touchstart', pauseScroll);
        carousel.addEventListener('touchend', resumeScroll);
    }

    async startModalSequence(content) {
        const descriptionElement = document.getElementById('typingDescription');
        
        await this.typeDescription(descriptionElement, content.description);
        
        const contentItems = document.querySelectorAll('.content-item');
        contentItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.remove('hidden');
            item.classList.add('fade-in');
        });
    }

    typeDescription(element, text, index = 0) {
        return new Promise(resolve => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                setTimeout(() => this.typeDescription(element, text, index + 1)
                    .then(resolve), 20);
            } else {
                resolve();
            }
        });
    }

    showSection(section) {
        return new Promise(resolve => {
            section.classList.remove('hidden');
            section.classList.add('slide-in');
            section.addEventListener('animationend', resolve, { once: true });
        });
    }

    handleTipClick(tip) {
        tip.classList.toggle('expanded');
    }

    initializeTarot() {
        const cardSymbols = {
            major: '🌟',
            wands: '🔥',
            cups: '💧',
            swords: '💨',
            pentacles: '🌍'
        };

        const formatMeanings = (meanings) => {
            if (!meanings) return [];
            return meanings.split(',')
                .map(meaning => meaning.trim())
                .filter(meaning => meaning.length > 0)
                .map(meaning => meaning.charAt(0).toUpperCase() + meaning.slice(1))
                .slice(0, 4);
        };

        const updateTarotContent = (card) => {
            const symbol = cardSymbols[card.type] || '🌟';
            document.getElementById('tarotSymbol').textContent = symbol;
            document.getElementById('tarotTitle').textContent = card.name;
            document.getElementById('tarotValue').textContent = card.type === 'major' 
                ? `Major Arcana - ${card.value}` 
                : `${card.value} of ${card.suit}`;

            document.getElementById('tarotMeaning').textContent = card.desc;

            const uprightMeanings = formatMeanings(card.meaning_up);
            const reversedMeanings = formatMeanings(card.meaning_rev);
            
            document.getElementById('suggestions').innerHTML = `
                <li style="--i: 0">✨ Upright: ${card.meaning_up}</li>
                <li style="--i: 1">✨ Reversed: ${card.meaning_rev}</li>
                <li style="--i: 2">✨ Card Type: ${card.type}</li>
                <li style="--i: 3">✨ Value: ${card.value_int}</li>
            `;
        };

        const fetchDailyTarot = async () => {
            try {
                const response = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
                if (!response.ok) throw new Error('Failed to fetch card');
                
                const data = await response.json();
                updateTarotContent(data.cards[0]);
            } catch (error) {
                console.error('Error fetching tarot card:', error);
                document.getElementById('tarotTitle').textContent = 'Daily Tarot Unavailable';
                document.getElementById('tarotMeaning').textContent = 
                    'Unable to read the cards at this moment. Please check back later.';
            }
        };

        // Fetch tarot on page load
        fetchDailyTarot();
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UIManager();
});