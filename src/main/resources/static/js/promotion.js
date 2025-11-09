document.addEventListener('DOMContentLoaded', () => {
  // ฟังก์ชันสำหรับปุ่ม "ทานที่ร้าน/กลับบ้าน"
  const eatButton = document.getElementById('eatButton');
  if (eatButton) {
    const btnText = eatButton.querySelector('.btn-text');
    
    eatButton.addEventListener('click', () => {
      eatButton.classList.toggle('takeaway');
      btnText.textContent = eatButton.classList.contains('takeaway')
        ? 'กลับบ้าน'
        : 'ทานที่ร้าน';
    });
  }

  // ฟังก์ชันสำหรับปุ่ม "เก็บ" แต่ละอัน
  const claimButtons = document.querySelectorAll('.claim-btn');
  
  claimButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!this.classList.contains('claimed')) {
        // เพิ่มเอฟเฟกต์กระเด้ง
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 100);
        
        // เปลี่ยนสถานะ
        this.classList.add('claimed');
        this.innerHTML = '✓ เก็บแล้ว';
        
        // สร้างอนิเมชันเช็คมาร์ค
        createCheckAnimation(this);
        
        // ตรวจสอบว่าโค้ดในหมวดนี้เก็บครบหรือยัง
        checkSectionComplete(this);
      }
    });
  });

  // ฟังก์ชันสร้างอนิเมชันเช็คมาร์ค
  function createCheckAnimation(button) {
    const card = button.closest('.promo-item');
    card.style.transition = 'all 0.3s ease';
    card.style.backgroundColor = '#e8f5e9';
    
    setTimeout(() => {
      card.style.backgroundColor = 'white';
    }, 500);
  }

  // ฟังก์ชันสำหรับปุ่ม "เก็บโค้ดทั้งหมด"
  const collectAllButtons = document.querySelectorAll('.collect-all-btn');
  
  collectAllButtons.forEach(collectBtn => {
    collectBtn.addEventListener('click', function() {
      // หา promo-list ที่อยู่ก่อนหน้าปุ่มนี้
      let currentElement = this.previousElementSibling;
      
      // วนหา promo-list ที่ใกล้ที่สุด
      while (currentElement) {
        if (currentElement.classList.contains('promo-list')) {
          break;
        }
        currentElement = currentElement.previousElementSibling;
      }
      
      if (currentElement && currentElement.classList.contains('promo-list')) {
        const buttonsInSection = currentElement.querySelectorAll('.claim-btn:not(.claimed)');
        
        // เก็บทุกโค้ดในหมวดพร้อมดีเลย์
        buttonsInSection.forEach((btn, index) => {
          setTimeout(() => {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
              btn.style.transform = 'scale(1)';
              btn.classList.add('claimed');
              btn.innerHTML = '✓ เก็บแล้ว';
              createCheckAnimation(btn);
            }, 100);
          }, index * 150); // ดีเลย์แต่ละอัน 150ms
        });
        
        // เปลี่ยนสีปุ่ม "เก็บโค้ดทั้งหมด" หลังจากเก็บครบ
        setTimeout(() => {
          this.classList.add('all-claimed');
          this.innerHTML = '🎉 เก็บครบแล้ว';
          this.disabled = true;
          
          // เอฟเฟกต์ฉลอง
          this.style.transform = 'scale(1.05)';
          setTimeout(() => {
            this.style.transform = 'scale(1)';
          }, 200);
        }, buttonsInSection.length * 150 + 200);
      }
    });
  });

  // ฟังก์ชันตรวจสอบว่าโค้ดในหมวดเก็บครบหรือยัง
  function checkSectionComplete(clickedButton) {
    // หาหมวดที่ปุ่มนี้อยู่
    const promoList = clickedButton.closest('.promo-list');
    const allButtons = promoList.querySelectorAll('.claim-btn');
    const claimedButtons = promoList.querySelectorAll('.claim-btn.claimed');
    
    // ถ้าเก็บครบทุกอัน
    if (allButtons.length === claimedButtons.length) {
      // หาปุ่ม "เก็บโค้ดทั้งหมด" ที่อยู่หลัง promo-list นี้
      let nextElement = promoList.nextElementSibling;
      
      while (nextElement) {
        if (nextElement.classList.contains('collect-all-btn')) {
          if (!nextElement.classList.contains('all-claimed')) {
            nextElement.classList.add('all-claimed');
            nextElement.innerHTML = '🎉 เก็บครบแล้ว';
            nextElement.disabled = true;
            
            // เอฟเฟกต์ฉลอง
            nextElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
              nextElement.style.transform = 'scale(1)';
            }, 200);
          }
          break;
        }
        nextElement = nextElement.nextElementSibling;
      }
    }
  }

  // ฟังก์ชันสำหรับปุ่มย้อนกลับ
  const backButton = document.querySelector('.back-btn');
  
  if (backButton) {
    backButton.addEventListener('click', () => {
      // ใช้ history.back() เพื่อกลับไปหน้าก่อนหน้า
      window.history.back();
    });
  }
});