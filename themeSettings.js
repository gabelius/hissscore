import { ThemeEngine } from './themeEngine.js';

class ThemeSettings {
    constructor() {
        this.dialog = document.getElementById('themeEditor');
        if (!this.dialog) {
            console.error('Theme editor dialog not found');
            return;
        }
        this.setupEventListeners();
        this.loadThemes();
    }

    setupEventListeners() {
        document.getElementById('newThemeBtn').onclick = () => this.openThemeEditor();
        this.dialog.querySelector('.cancel-btn').onclick = () => this.dialog.close();
        this.dialog.querySelector('form').onsubmit = (e) => this.saveTheme(e);
        
        // Live preview
        const inputs = this.dialog.querySelectorAll('input[type="color"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    loadThemes() {
        // Load built-in themes
        const builtInGrid = document.getElementById('builtInThemes');
        Object.entries(ThemeEngine.themes).forEach(([name, theme]) => {
            builtInGrid.appendChild(this.createThemeCard(name, theme, false));
        });

        // Load custom themes
        const customGrid = document.getElementById('customThemes');
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
        Object.entries(customThemes).forEach(([name, theme]) => {
            customGrid.appendChild(this.createThemeCard(name, theme, true));
        });
    }

    createThemeCard(name, theme, isCustom) {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.innerHTML = `
            <div class="theme-preview" style="background: ${theme['--primary-bg']}">
                <div style="background: ${theme['--primary-accent']}; height: 30%"></div>
            </div>
            <h3>${name}</h3>
            ${isCustom ? '<button class="delete-btn">🗑️</button>' : ''}
        `;

        card.onclick = () => ThemeEngine.applyTheme(name);
        
        if (isCustom) {
            card.querySelector('.delete-btn').onclick = (e) => {
                e.stopPropagation();
                this.deleteCustomTheme(name);
            };
        }

        return card;
    }

    openThemeEditor(existingTheme = null) {
        const form = this.dialog.querySelector('form');
        if (existingTheme) {
            form.elements.themeName.value = existingTheme.name;
            // Fill in existing colors
        } else {
            form.reset();
        }
        this.dialog.showModal();
    }

    saveTheme(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const theme = {
            '--primary-bg': formData.get('primaryBg'),
            '--secondary-bg': formData.get('secondaryBg'),
            '--primary-accent': formData.get('primaryAccent'),
            '--secondary-accent': formData.get('secondaryAccent'),
            '--text-color': formData.get('textColor')
        };

        const name = formData.get('themeName');
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
        customThemes[name] = theme;
        localStorage.setItem('customThemes', JSON.stringify(customThemes));

        this.dialog.close();
        this.loadThemes(); // Refresh theme list
    }

    deleteCustomTheme(name) {
        if (confirm(`Delete theme "${name}"?`)) {
            const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
            delete customThemes[name];
            localStorage.setItem('customThemes', JSON.stringify(customThemes));
            this.loadThemes(); // Refresh theme list
        }
    }

    updatePreview() {
        const preview = document.getElementById('themePreview');
        const formData = new FormData(this.dialog.querySelector('form'));
        
        Object.entries({
            '--primary-bg': formData.get('primaryBg'),
            '--primary-accent': formData.get('primaryAccent'),
            '--text-color': formData.get('textColor')
        }).forEach(([key, value]) => {
            preview.style.setProperty(key, value);
        });
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new ThemeSettings();
    ThemeEngine.init(); // Initialize theme engine
});
