// Цены на номера
const roomPrices = {
    'standard': 2000,
    'luxe': 10000,
    'family': 20000
};

// ====== БРОНИРОВАНИЕ ======
const bookingForm = document.getElementById('bookingForm');
const roomSelect = document.getElementById('roomSelect');
const nameInput = bookingForm.querySelector('input[type="text"]');
const emailInput = bookingForm.querySelector('input[type="email"]');

let priceDisplay = document.querySelector('.price-display');
if (!priceDisplay) {
    priceDisplay = document.createElement('p');
    priceDisplay.className = 'price-display';
    priceDisplay.style.fontSize = '1.2rem';
    priceDisplay.style.color = '#667eea';
    priceDisplay.style.fontWeight = 'bold';
    priceDisplay.style.marginTop = '1rem';
    bookingForm.insertBefore(priceDisplay, bookingForm.querySelector('button'));
}

roomSelect.addEventListener('change', function() {
    const selectedRoom = this.value;
    if (selectedRoom) {
        const price = roomPrices[selectedRoom];
        priceDisplay.textContent = `Цена: ${price} рублей за ночь`;
    } else {
        priceDisplay.textContent = '';
    }
});

function loadSavedData() {
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    const savedRoom = localStorage.getItem('userRoom');

    if (savedName) nameInput.value = savedName;
    if (savedEmail) emailInput.value = savedEmail;
    if (savedRoom) {
        roomSelect.value = savedRoom;
        roomSelect.dispatchEvent(new Event('change'));
    }
}

bookingForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const roomType = roomSelect.value;

    if (name.length < 3) {
        alert('Имя должно содержать минимум 3 буквы!');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert('Пожалуйста, введите корректный email!');
        return;
    }

    if (!roomType) {
        alert('Пожалуйста, выберите тип номера!');
        return;
    }

    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRoom', roomType);

    const price = roomPrices[roomType];
    alert(`Спасибо, ${name}!\n\nВаше бронирование:\n${roomType} номер - ${price} рублей\n\nПодтверждение отправлено на ${email}`);

    bookingForm.reset();
    priceDisplay.textContent = '';
});

loadSavedData();
roomSelect.dispatchEvent(new Event('change'));

/* ---------- Отзывы с Firebase и фильтрацией ---------- */
const reviewsContainer = document.getElementById('reviews-container');
const reviewForm = document.getElementById('review-form');
const reviewNameInput = document.getElementById('review-name');
const reviewTextInput = document.getElementById('review-text');

// Массив отзывов теперь будет наполняться из Firebase
let reviews = [];
let currentFilter = 'all';

// Функция отрисовки звёзд
function renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += (i <= rating) ? '★' : '☆';
    }
    return starsHTML;
}

// Рендеринг отзывов с учётом фильтра (эта функция осталась почти без изменений)
function renderReviews() {
    let filtered = reviews;
    if (currentFilter !== 'all') {
        filtered = reviews.filter(review => review.rating == currentFilter);
    }

    reviewsContainer.innerHTML = '';

    if (filtered.length === 0) {
        reviewsContainer.innerHTML = '<p>Нет отзывов, соответствующих фильтру.</p>';
        return;
    }

    filtered.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';

        const header = document.createElement('h4');
        header.innerHTML = `${review.name} <small>${review.date}</small>`;

        const starsDiv = document.createElement('div');
        starsDiv.className = 'stars-display';
        starsDiv.innerHTML = renderStars(review.rating);

        const text = document.createElement('p');
        text.textContent = review.text;

        card.appendChild(header);
        card.appendChild(starsDiv);
        card.appendChild(text);
        reviewsContainer.appendChild(card);
    });
}

// Создание кнопок фильтра (без изменений)
function createFilterButtons() {
    if (document.querySelector('.reviews-filters')) return;

    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'reviews-filters';

    const filters = [
        { label: 'Все', value: 'all' },
        { label: '5 звёзд', value: '5' },
        { label: '4 звезды', value: '4' },
        { label: '3 звезды', value: '3' },
        { label: '2 звезды', value: '2' },
        { label: '1 звезда', value: '1' }
    ];

    filters.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = f.label;
        btn.dataset.filter = f.value;
        if (f.value === currentFilter) btn.classList.add('active');
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderReviews();
        });
        filtersDiv.appendChild(btn);
    });

    reviewsContainer.parentNode.insertBefore(filtersDiv, reviewsContainer);
}

// ========== НОВОЕ: работа с Firebase ==========

// Отправка отзыва
reviewForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = reviewNameInput.value.trim();
    const text = reviewTextInput.value.trim();
    const ratingInput = document.querySelector('input[name="rating"]:checked');

    if (name.length < 2) {
        alert('Имя должно быть не короче 2 символов');
        return;
    }
    if (text.length < 10) {
        alert('Отзыв должен содержать хотя бы 10 символов');
        return;
    }
    if (!ratingInput) {
        alert('Пожалуйста, поставьте оценку!');
        return;
    }

    const newReview = {
        name: name,
        text: text,
        rating: parseInt(ratingInput.value),
        date: new Date().toLocaleString('ru-RU')
    };

    // Отправляем в Firebase (путь 'reviews')
    const db = window.firebaseDB;
    if (!db) {
        alert('Ошибка подключения к базе данных. Попробуйте позже.');
        return;
    }
    const reviewsRef = ref(db, 'reviews');
    push(reviewsRef, newReview)
        .then(() => {
            reviewForm.reset();
            // Массив reviews обновится автоматически через onValue
        })
        .catch(error => {
            console.error('Ошибка отправки:', error);
            alert('Не удалось отправить отзыв.');
        });
});

// Слушатель изменений в базе — автоматически обновляет отзывы
function startListening() {
    const db = window.firebaseDB;
    if (!db) {
        console.warn('Firebase не инициализирована, отзывы не будут загружены.');
        return;
    }

    const reviewsRef = ref(db, 'reviews');
    onValue(reviewsRef, (snapshot) => {
        const data = snapshot.val();
        // Преобразуем объект Firebase в массив
        reviews = [];
        if (data) {
            reviews = Object.values(data);  // все отзывы как массив
            // Сортируем по дате (новые сверху) — если хочешь, можно раскомментировать
            // reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        renderReviews();
    });
}

// Запуск при загрузке страницы
createFilterButtons();
startListening();
/* ---------- Модальное окно галереи ---------- */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const modalClose = document.querySelector('.modal-close');

// Находим все кнопки "Подробнее"
const detailButtons = document.querySelectorAll('.details-btn');

// Вешаем обработчик на каждую кнопку
detailButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Находим родительскую карточку
        const card = this.closest('.room-card');
        
        // Извлекаем данные
        const title = card.querySelector('h3').textContent;
        const description = card.querySelector('p').textContent;   // первый <p> — описание
        const price = card.querySelector('.price').textContent;
        
        // Заполняем модальное окно
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalPrice.textContent = 'Цена: ' + price;
        
        // Показываем окно
        modal.style.display = 'block';
    });
});

// Закрытие по клику на крестик
modalClose.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Закрытие по клику вне содержимого окна
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Закрытие по клавише Escape (бонус)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});