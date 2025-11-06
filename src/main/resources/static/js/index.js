
  // รอให้ DOM โหลดครบก่อน
  document.addEventListener("DOMContentLoaded", () => {
    const homeBtn = document.getElementById("homeBtn");
    const dineInBtn = document.getElementById("dineInBtn");

	homeBtn.addEventListener("click", () => {
	  window.location.href = "discoverTakeHome.html";
	});

	dineInBtn.addEventListener("click", () => {
	  window.location.href = "discover.html";
	});

  });

  window.addEventListener("DOMContentLoaded", () => {
    const logo = document.getElementById("logo");
    const buttons = document.querySelector(".button-group");

    // โลโก้เด้งขึ้น
    logo.classList.add("pop");

    // แสดงปุ่มหลังโลโก้เด้งเสร็จ (ดีเลย์ 900ms)
    setTimeout(() => {
      buttons.classList.add("show");
    }, 900);
  });
