document.addEventListener('DOMContentLoaded', () => {
  const slidesWrapper = document.querySelector('.slides');
  const slides = document.querySelectorAll('.recommend-card');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  const intervalTime = 5000;
  let slideInterval;

  let startX = 0;
  let endX = 0;

  // ====== ปุ่ม EatButton ======
  const eatButton = document.getElementById('eatButton');
  const btnText = eatButton.querySelector('.btn-text');

  // เริ่มต้นให้เป็น “กลับบ้าน”
  eatButton.classList.remove('dinein');
  btnText.textContent = 'กลับบ้าน';

  eatButton.addEventListener('click', () => {
    eatButton.classList.toggle('dinein');
    btnText.textContent = eatButton.classList.contains('dinein')
      ? 'ทานที่ร้าน'
      : 'กลับบ้าน';
  });

  // ====== สไลด์แบนเนอร์ ======
  function showSlide(index) {
    slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    currentIndex = index;
  }

  function nextSlide() {
    showSlide((currentIndex + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  }

  function startSlide() {
    slideInterval = setInterval(nextSlide, intervalTime);
  }

  function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlide();
  }

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      resetSlideInterval();
    });
  });

  // Touch events
  slidesWrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  slidesWrapper.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  });

  slidesWrapper.addEventListener('touchend', () => {
    const distance = endX - startX;
    if (distance > 50) {
      prevSlide();
      resetSlideInterval();
    } else if (distance < -50) {
      nextSlide();
      resetSlideInterval();
    }
    startX = 0;
    endX = 0;
  });

  startSlide();
});

