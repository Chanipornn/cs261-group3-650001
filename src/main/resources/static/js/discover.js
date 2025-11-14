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
  
    // Dot click
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        resetSlideInterval();
      });
    });
  
    // Touch events for swipe
    slidesWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
  
    slidesWrapper.addEventListener('touchmove', (e) => {
      endX = e.touches[0].clientX;
    });

	// ====== ปุ่ม EatButton ======
	const eatButton = document.getElementById('eatButton');
	const btnText = eatButton.querySelector('.btn-text');

	// ตั้งค่าเริ่มต้นเป็น “ทานที่ร้าน” (orderTypeId = 1)
	eatButton.classList.remove('takeaway');
	btnText.textContent = 'ทานที่ร้าน';
	localStorage.setItem("orderTypeId", "1");

	// เมื่อกดปุ่ม → สลับสถานะ
	eatButton.addEventListener('click', () => {
	  const isDineInNow = !eatButton.classList.toggle('takeaway');

	  if (isDineInNow) {
	    // ทานที่ร้าน
	    btnText.textContent = 'ทานที่ร้าน';
	    localStorage.setItem("orderTypeId", "1");
	  } else {
	    // กลับบ้าน
	    btnText.textContent = 'กลับบ้าน';
	    localStorage.setItem("orderTypeId", "2");
	  }
	});

  
    slidesWrapper.addEventListener('touchend', () => {
      const distance = endX - startX;
      if (distance > 50) {
        // swipe right
        prevSlide();
        resetSlideInterval();
      } else if (distance < -50) {
        // swipe left
        nextSlide();
        resetSlideInterval();
      }
      startX = 0;
      endX = 0;
    });
  
    startSlide();
  });
  

  
