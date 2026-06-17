/* ==========================================
   БРОНИРОВАНИЕ
   ========================================== */
const roomPrices = {
    standard: 2000,
    luxe: 10000,
    family: 20000
};

// Ищем форму бронирования внутри секции #booking
const bookingSection = document.getElementById('booking');
const bookingForm = bookingSection.querySelector('form');
const bookingNameInput = bookingForm.querySelector('input[placeholder="Ваше имя"]');
const bookingEmailInput = bookingForm.querySelector('input[placeholder="Ваша почта"]');
const roomSelect = bookingForm.querySelector('select');
const checkinInput = bookingForm.querySelectorAll('input[type="date"]')[0];
const checkoutInput = bookingForm.querySelectorAll('input[type="date"]')[1];

// Динамическая цена
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

roomSelect.addEventListener('change', function () {
    const selected = this.value;
    if (selected && roomPrices[selected]) {
        priceDisplay.textContent = `Цена: ${roomPrices[selected]} ₽ за ночь`;
    } else {
        priceDisplay.textContent = '';
    }
});

// Загрузка сохранённых данных
function loadBookingData() {
    const savedName = localStorage.getItem('bookingName');
    const savedEmail = localStorage.getItem('bookingEmail');
    const savedRoom = localStorage.getItem('bookingRoom');
    if (savedName) bookingNameInput.value = savedName;
    if (savedEmail) bookingEmailInput.value = savedEmail;
    if (savedRoom && roomSelect.querySelector(`option[value="${savedRoom}"]`)) {
        roomSelect.value = savedRoom;
        roomSelect.dispatchEvent(new Event('change'));
    }
}
loadBookingData();

// Отправка бронирования
bookingForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = bookingNameInput.value.trim();
    const email = bookingEmailInput.value.trim();
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
        alert('Выберите тип номера!');
        return;
    }

    localStorage.setItem('bookingName', name);
    localStorage.setItem('bookingEmail', email);
    localStorage.setItem('bookingRoom', roomType);

    const price = roomPrices[roomType];
    alert(`Спасибо, ${name}!\n\nВаше бронирование:\n${roomType} номер — ${price} ₽\n\nПодтверждение отправлено на ${email}`);
    bookingForm.reset();
    priceDisplay.textContent = '';
});

/* ==========================================
   ГАЛЕРЕЯ И МОДАЛЬНОЕ ОКНО
   ========================================== */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const modalClose = document.querySelector('.modal-close');
const detailButtons = document.querySelectorAll('.details-btn');

detailButtons.forEach(button => {
    button.addEventListener('click', function () {
        const card = this.closest('.room-card');
        const title = card.querySelector('h3').textContent;
        const description = card.querySelector('p').textContent; // первый <p>
        const price = card.querySelector('.price').textContent;

        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalPrice.textContent = 'Цена: ' + price;
        modal.style.display = 'block';
    });
});

modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click', (event) => {
    if (event.target === modal) modal.style.display = 'none';
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

/* ---------- Отзывы с Firebase (compat) и фильтрацией ---------- */
const reviewsContainer = document.getElementById('reviews-container');
const reviewForm = document.getElementById('review-form');
const reviewNameInput = document.getElementById('review-name');
const reviewTextInput = document.getElementById('review-text');

let reviews = [];
let currentFilter = 'all';

// Звёзды в карточке
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += (i <= rating) ? '★' : '☆';
    }
    return stars;
}

// Отрисовка отзывов с учётом фильтра
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

// Кнопки фильтрации
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
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderReviews();
        });
        filtersDiv.appendChild(btn);
    });

    reviewsContainer.parentNode.insertBefore(filtersDiv, reviewsContainer);
}

// Отправка отзыва (compat‑версия)
reviewForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = reviewNameInput.value.trim();
    const text = reviewTextInput.value.trim();
    const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');

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

    // Проверяем, инициализирована ли база данных
    if (!window.firebaseDB) {
        alert('Ошибка подключения к базе данных. Пожалуйста, обновите страницу.');
        return;
    }

    // Получаем ссылку на узел 'reviews' и добавляем запись
    const reviewsRef = window.firebaseDB.ref('reviews');
    reviewsRef.push(newReview)
        .then(() => {
            reviewForm.reset();
        })
        .catch(error => {
            console.error('Ошибка отправки:', error);
            alert('Не удалось отправить отзыв.');
        });
});

// Слушатель изменений в реальном времени
function startListening() {
    if (!window.firebaseDB) {
        console.warn('Firebase не инициализирована. Отзывы не будут загружены.');
        return;
    }

    const reviewsRef = window.firebaseDB.ref('reviews');
    reviewsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        reviews = [];
        if (data) {
            reviews = Object.values(data);
        }
        renderReviews();
    });
}

// Запуск
createFilterButtons();
startListening();