document.addEventListener('DOMContentLoaded', () => {
  const slidesWrapper = document.querySelector('.slides');
  const slides = document.querySelectorAll('.recommend-card');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  const intervalTime = 5000;
  let slideInterval;

  let startX = 0;
  let endX = 0;

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

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      resetSlideInterval();
    });
  });

  slidesWrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  slidesWrapper.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  });

  // ====== ปุ่ม EatButton ======
  const eatButton = document.getElementById('eatButton');
  const btnText = eatButton.querySelector('.btn-text');

  let orderType = localStorage.getItem("orderTypeId");

  // ถ้ายังไม่มีค่า → ตั้ง Default = ทานที่ร้าน (1)
  if (!orderType) {
    orderType = "1";
    localStorage.setItem("orderTypeId", "1");
  }

  // อัปเดต UI ตามค่าที่มี
  if (orderType === "1") {
    eatButton.classList.remove("takeaway");
    btnText.textContent = "ทานที่ร้าน";
  } else {
    eatButton.classList.add("takeaway");
    btnText.textContent = "กลับบ้าน";
  }

  // ⭐ ปุ่ม toggle — ต้องอยู่ในนี้
  eatButton.addEventListener('click', () => {
    const isDineInNow = !eatButton.classList.toggle('takeaway');

    if (isDineInNow) {
      btnText.textContent = 'ทานที่ร้าน';
      localStorage.setItem("orderTypeId", "1");
    } else {
      btnText.textContent = 'กลับบ้าน';
      localStorage.setItem("orderTypeId", "2");
    }
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
