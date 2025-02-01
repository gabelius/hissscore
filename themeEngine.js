export const ThemeEngine = {
    currentTheme: 'light',
    currentColorScheme: 'rainbow',

    themes: {
        light: {
            '--primary-bg': '#fff3e0',
            '--secondary-bg': '#ffffff',
            '--text-color': '#2d3436',
            '--primary-accent': '#FF6B6B',
            '--secondary-accent': '#4ECDC4',
            '--danger-accent': '#FF7675',
            'background-overlay': 'rgba(0,0,0,0.7)'
        },
        dark: {
            '--primary-bg': '#1a1a1a',
            '--secondary-bg': '#2d2d2d',
            '--text-color': '#e0e0e0',
            '--primary-accent': '#ff7f7f',
            '--secondary-accent': '#66d9e8',
            '--danger-accent': '#ff6b6b',
            'background-overlay': 'rgba(0,0,0,0.85)'
        }
    },

    init() {
        // Load saved preferences
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentColorScheme = localStorage.getItem('colorScheme') || 'rainbow';
        this.applyTheme();
        this.setupListeners();
    },

    setupListeners() {
        // Theme toggle button
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Color scheme selector
        document.getElementById('colorMode').addEventListener('change', (e) => {
            this.setColorScheme(e.target.value);
        });
    },

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        
        // Update button state
        const btn = document.getElementById('themeToggle');
        btn.classList.toggle('active-mode', this.currentTheme === 'dark');
    },

    setColorScheme(scheme) {
        this.currentColorScheme = scheme;
        localStorage.setItem('colorScheme', scheme);
        document.body.className = scheme;
        // Maintain dark theme if active
        if (this.currentTheme === 'dark') {
            document.body.classList.add('night-mode');
        }
    },

    applyTheme() {
        const theme = this.themes[this.currentTheme];
        document.body.classList.toggle('night-mode', this.currentTheme === 'dark');
        
        // Apply CSS variables
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });

        // Update button icon
        document.getElementById('themeToggle').textContent = 
            this.currentTheme === 'light' ? '🌓' : '☀️';
    },

    getSnakeColors(level, colorScheme) {
        if (colorScheme) {
            return GameState.config?.colorSchemes?.[colorScheme] || 
                   this.themes[this.currentTheme].snakeColors;
        }
        return level?.snakeColors || this.themes[this.currentTheme].snakeColors;
    }
};
