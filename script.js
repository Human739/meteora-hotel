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

// ====== ОТЗЫВЫ ======
const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');

const defaultReviews = [
    { name: 'Иван Петров', rating: 5, text: 'Отличный отель! Чистота, комфорт, вежливый персонал. Обязательно вернёмся!' },
    { name: 'Мария Сидорова', rating: 4, text: 'Красивый вид на горы, хороший завтрак. Можно улучшить Wi-Fi.' },
    { name: 'Александр Козлов', rating: 5, text: 'Идеальное место для отдыха с семьёй. Рекомендую всем друзьям!' }
];

function loadReviews() {
    const savedReviews = localStorage.getItem('reviews');
    return savedReviews ? JSON.parse(savedReviews) : defaultReviews;
}

function saveReviews(reviews) {
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

function displayReviews() {
    const reviews = loadReviews();
    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color: #999;">Пока нет отзывов. Будьте первым!</p>';
        return;
    }

    reviews.forEach((review) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review';
        reviewDiv.innerHTML = `
            <div class="review-header">
                <span class="review-name">${review.name}</span>
                <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
            </div>
            <p class="review-text">${review.text}</p>
        `;
        reviewsList.appendChild(reviewDiv);
    });
}

reviewForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const inputs = this.querySelectorAll('input, textarea, select');
    const reviewName = inputs[0].value.trim();
    const reviewText = inputs[1].value.trim();
    const reviewRating = inputs[2].value;

    if (reviewName.length < 2) {
        alert('Имя должно содержать минимум 2 буквы!');
        return;
    }

    if (reviewText.length < 10) {
        alert('Отзыв должен быть минимум 10 символов!');
        return;
    }

    if (!reviewRating) {
        alert('Пожалуйста, выберите оценку!');
        return;
    }

    const newReview = {
        name: reviewName,
        rating: parseInt(reviewRating),
        text: reviewText
    };

    const reviews = loadReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);

    displayReviews();
    this.reset();

    alert(`Спасибо за отзыв, ${reviewName}! 🙏`);
});

displayReviews();
