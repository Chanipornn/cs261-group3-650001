const NEXT_PAGE = 'Home.html';


const EXTRA_DELAY_AFTER_ANIM_MS = 800;

document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  if (!logo) return;


  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      logo.classList.add('pop');
    });
  });

  function goNextAfterDelay() {
    setTimeout(() => {
      // เปลี่ยนหน้าอัตโนมัติ
      window.location.href = NEXT_PAGE;
    }, EXTRA_DELAY_AFTER_ANIM_MS);
  }

  // ถ้า prefer-reduced-motion เปิดอยู่ ให้ข้าม animationend และไปหน้าเลย (หรือหลัง delay)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {

    goNextAfterDelay();
    return;
  }

  // ถ้าผลิตแอนิเมชัน: ฟัง event
  logo.addEventListener('animationend', () => {
    // เมื่อแอนิเมชันจบ ให้รอเล็กน้อยแล้วไปหน้าใหม่
    goNextAfterDelay();
  });


  setTimeout(() => {

    if (!document.hidden) {
      window.location.href = NEXT_PAGE;
    }
  }, 2500);
});
