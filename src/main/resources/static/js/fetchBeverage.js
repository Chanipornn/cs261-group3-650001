// fetchBeverage.js
const menuList = document.querySelector('.menu-list');

// แผนที่ชื่ออังกฤษ -> ไทย
const nameMap = {
  water: "น้ำเปล่า",
  pepsi: "เป๊ปซี่",
  strawberry_soda: "สตอเบอรี่โซดา",
  blue_hawaii_soda: "บลูฮาวายโซดา",
  red_syrup_soda: "แดงโซดา",
  peach_tea: "ชาพีช",
  lychee_juice: "ลิ้นจี่",
  lemon_tea: "ชามะนาว",
  apple_tea: "ชาแอปเปิ้ล",
  thai_tea: "ชาไทย",
  green_tea: "ชาเขียว",
  oleang: "โอเลี้ยง",
  ovaltine: "โอวัลติน",
  traditional_coffee: "กาแฟโบราณ"
};

fetch('http://localhost:8081/api/menu')
  .then(res => res.json())
  .then(data => {
    menuList.innerHTML = ''; // ล้าง menu-list เก่าก่อน

    // เฉพาะ categoryId ของเครื่องดื่ม สมมติ categoryId = 2
    const beverages = data.filter(item => item.categoryId === 2);

    beverages.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('menu-item');
      div.dataset.id = item.id;

      div.innerHTML = `
        <div class="image-box">
          <img src="${item.image}" alt="${nameMap[item.name] || item.name}">
          <div class="add-btn" data-action="add">+</div>
        </div>
        <p>${nameMap[item.name] || item.name}</p>
        <p class="price">${item.price} บาท</p>
      `;

      menuList.appendChild(div);
    });
  })
  .catch(err => console.error('Fetch error:', err));
