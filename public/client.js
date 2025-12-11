// Элементы DOM
const memeImage = document.getElementById('memeImage');
const memeCaption = document.getElementById('memeCaption');
const memePlaceholder = document.getElementById('memePlaceholder');
const captionContainer = document.getElementById('captionContainer');
const generateBtn = document.getElementById('generateBtn');
const serverStatus = document.getElementById('serverStatus');
const memeInfo = document.getElementById('memeInfo');
const totalImages = document.getElementById('totalImages');
const totalCaptions = document.getElementById('totalCaptions');

// Состояние
let isLoading = false;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkServerStatus();
    loadServerInfo();
    generateMeme(); // Загрузить первый мем
});

// Проверка статуса сервера
async function checkServerStatus() {
    try {
        const response = await fetch('/api/info');
        if (response.ok) {
            serverStatus.innerHTML = '<i class="bi bi-check-circle me-1"></i>Сервер онлайн';
            serverStatus.className = 'bg-dark text-success text-center py-2';
        }
    } catch (error) {
        serverStatus.innerHTML = '<i class="bi bi-x-circle me-1"></i>Сервер недоступен';
        serverStatus.className = 'bg-dark text-danger text-center py-2';
    }
}

// Загрузка информации о сервере
async function loadServerInfo() {
    try {
        const response = await fetch('/api/info');
        if (!response.ok) throw new Error('Ошибка сервера');

        const data = await response.json();

        if (data.success) {
            totalImages.textContent = data.totalImages;
            totalCaptions.textContent = data.totalCaptions;
        }
    } catch (error) {
        console.error('Ошибка загрузки информации:', error);
    }
}

// Основная функция генерации мема
async function generateMeme() {
    if (isLoading) return;

    isLoading = true;

    // Показать состояние загрузки
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Загрузка...';

    // Скрыть предыдущий мем, показать заглушку
    memeImage.classList.add('d-none');
    captionContainer.classList.add('d-none');
    memePlaceholder.classList.remove('d-none');
    memeInfo.textContent = 'Загрузка данных с сервера...';

    try {
        const response = await fetch('/api/meme');
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Ошибка сервера');
        }

        // Обновить информацию
        memeInfo.textContent = ` ${result.info.totalImages} изображений, ${result.info.totalCaptions} подписей`;

        // Обновить счетчики
        totalImages.textContent = result.info.totalImages;
        totalCaptions.textContent = result.info.totalCaptions;

        // Загрузить изображение
        await loadMemeImage(result.imageUrl, result.caption);

    } catch (error) {
        console.error('Ошибка при загрузке мема:', error);

        memeInfo.textContent = 'Ошибка загрузки мема';
        memePlaceholder.innerHTML = `
            <i class="bi bi-exclamation-triangle"></i>
            <p>${error.message}</p>
        `;
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="bi bi-shuffle me-2"></i>Сгенерировать новый мем';
        isLoading = false;
    }
}

// Загрузка и отображение изображения мема
function loadMemeImage(imageUrl, caption) {
    return new Promise((resolve, reject) => {
        memeImage.onload = () => {
            memePlaceholder.classList.add('d-none');

            memeImage.classList.remove('d-none');
            memeImage.classList.add('fade-in');

            memeCaption.textContent = caption;
            captionContainer.classList.remove('d-none');

            setTimeout(() => {
                memeImage.classList.remove('fade-in');
            }, 300);

            resolve();
        };

        memeImage.onerror = () => {
            reject(new Error('Не удалось загрузить изображение'));
        };

        memeImage.src = imageUrl;
    });
}

// Экспорт функции в глобальную область видимости
window.generateMeme = generateMeme;
