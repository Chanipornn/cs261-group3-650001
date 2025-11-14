document.addEventListener('DOMContentLoaded', () => {
  const slidesWrapper = document.querySelector('.slides');
  const slides = document.querySelectorAll('.recommend-card');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  const intervalTime = 5000;
  let slideInterval;

  let startX = 0;
  let endX = 0;

  const eatButton = document.getElementById('eatButton');
  const btnText = eatButton.querySelector('.btn-text');

  // ตั้งค่าเริ่มต้น
  eatButton.classList.add('takeaway');
  btnText.textContent = 'กลับบ้าน';
  localStorage.setItem("orderTypeId", "2");

  // เมื่อกดปุ่ม
  eatButton.addEventListener('click', () => {
    const isTakeAway = eatButton.classList.toggle('takeaway');

    if (isTakeAway) {
      btnText.textContent = 'กลับบ้าน';
      localStorage.setItem("orderTypeId", "2");
    } else {
      btnText.textContent = 'ทานที่ร้าน';
      localStorage.setItem("orderTypeId", "1");
    }
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

