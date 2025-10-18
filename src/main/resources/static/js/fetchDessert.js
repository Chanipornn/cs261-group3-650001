const menuList = document.querySelector('.menu-list');

// แปลงชื่ออังกฤษ → ไทย
function translateName(name) {
  const map = {
    nuggets: "นักเก็ต",
    chicken_pop: "ไก่ป๊อป",
    french_fries: "เฟรนช์ฟรายส์",
    cheese_ball: "ชีสบอล",
    fried_sausage: "ไส้กรอกทอด",
    mashed_potato_cheese_bake: "มันบดอบชีส",
    fried_chicken_wings: "ปีกไก่ทอด",
    gyoza: "เกี๊ยวซ่า",
    toast: "ปังปิ้ง",
    ice_cream: "ไอศกรีม",
    lava_cake: "เค้กลาวา",
    soft_cake: "เค้กหน้านิ่ม",
    bua_loy: "บัวลอย",
    pa_tong_go: "ปาท่องโก๋"
  };
  return map[name] || name;
}

fetch('http://localhost:8081/api/menu')
  .then(res => res.json())
  .then(data => {
    const desserts = data.filter(item => item.categoryId === 3); // category_id = 3

    menuList.innerHTML = ''; // เคลียร์ก่อน

    desserts.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('menu-item');
      div.dataset.id = item.id;

      const nameTH = translateName(item.name);

      div.innerHTML = `
        <div class="image-box">
          <img src="${item.image}" alt="${nameTH}">
          <div class="add-btn" data-action="add">+</div>
        </div>
        <p>${nameTH}</p>
        <p class="price">${item.price} บาท</p>
      `;

      menuList.appendChild(div);
    });

    console.log('✅ Loaded dessert menu:', desserts.length);
  })
  .catch(err => console.error('❌ Fetch error:', err));
