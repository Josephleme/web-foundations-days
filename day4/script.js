const noteText = document.getElementById('note-text');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

function updateCounts() {
    const text = noteText.value;
    const totalChars = text.length;

    charCount.textContent = `${totalChars} / 200 characters`;

    const trimmedText = text.trim();
    const totalWords = trimmedText === "" ? 0 : trimmedText.split(/\s+/).length;
    wordCount.textContent = `${totalWords} words`;

    if (totalChars > 200) {
        charCount.classList.remove('warning');
        charCount.classList.add('over');
    } else if (totalChars > 180) {
        charCount.classList.remove('over');
        charCount.classList.add('warning');
    } else {
        charCount.classList.remove('warning', 'over');
    }
}

function clearAll() {
    noteText.value = '';
    localStorage.removeItem('noteDraft');
    updateCounts();
}

noteText.addEventListener('input', () => {
    updateCounts();
    localStorage.setItem('noteDraft', noteText.value);
});

clearBtn.addEventListener('click', clearAll);

noteText.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        clearAll();
    }
});

themeToggle.addEventListener('click', () => {
    const isDarkNow = document.body.classList.toggle('dark');
    
    if (isDarkNow) {
        themeToggle.textContent = 'Light mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = 'Dark mode';
        localStorage.setItem('theme', 'light');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const savedDraft = localStorage.getItem('noteDraft');
    if (savedDraft !== null) {
        noteText.value = savedDraft;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = 'Light mode';
    } else {
        document.body.classList.remove('dark');
        themeToggle.textContent = 'Dark mode';
    }

    updateCounts();
});
