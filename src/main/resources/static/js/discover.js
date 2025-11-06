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

	const eatButton = document.getElementById('eatButton');
	const btnText = eatButton.querySelector('.btn-text');

	eatButton.addEventListener('click', () => {
	  eatButton.classList.toggle('takeaway');
	  btnText.textContent = eatButton.classList.contains('takeaway')
	    ? 'กลับบ้าน'
	    : 'ทานที่ร้าน';
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
  

  
