window.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logo");
  logo.classList.add("pop");

  const homeBtn = document.getElementById("homeBtn");
  const dineInBtn = document.getElementById("dineInBtn");

  // เมื่อกดปุ่ม "กลับบ้าน"
  homeBtn.addEventListener("click", () => {
    localStorage.setItem("orderType", "takeaway");
    window.location.href = "home.html"; 
  });

  // เมื่อกดปุ่ม "ทานที่ร้าน"
  dineInBtn.addEventListener("click", () => {
    localStorage.setItem("orderType", "dinein");
    window.location.href = "home.html";
  });
});