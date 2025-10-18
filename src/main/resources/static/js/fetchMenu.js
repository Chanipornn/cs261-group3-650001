const menuList = document.querySelector('.menu-list');

const nameMap = {
  rice_plain: "ข้าวสวย",
  kapow_moosub: "ผัดกะเพราหมูสับ",
  kapow_moodeng: "ผัดกะเพราหมูแดง",
  kapow_squid: "ผัดกะเพราปลาหมึก",
  kapow_moogrob: "ผัดกะเพราหมูกรอบ",
  kapow_gai: "ผัดกะเพราไก่",
  kapow_shrimp: "ผัดกะเพรากุ้ง",
  prikgaeng_pork: "พริกแกงหมู",
  prikgaeng_chicken: "พริกแกงไก่",
  prikgaeng_beef: "พริกแกงเนื้อ",
  kana_moogrob: "คะน้าหมูกรอบ",
  khaenang_moogrob: "แกงเขียวหวานหมูกรอบ",
  morning_glory: "ผัดผักบุ้ง",
  mixed_veg: "ผัดผักรวม",
  curry_squid: "แกงกะหรี่ปลาหมึก",
  curry_shrimp: "แกงกะหรี่กุ้ง",
  curry_chicken: "แกงกะหรี่ไก่",
  garlic_pork: "หมูผัดกระเทียม",
  garlic_chicken: "ไก่ผัดกระเทียม",
  oyster_pork: "หมูผัดน้ำมันหอย",
  chilipork_caps: "หมูผัดพริกหยวก",
  chilichicken_caps: "ไก่ผัดพริกหยวก",
  sweet_sour_pork: "หมูผัดเปรี้ยวหวาน",
  sweet_sour_fish: "ปลาผัดเปรี้ยวหวาน",
  kee_mao_pork: "ขี้เมาหมู",
  kee_mao_chicken: "ขี้เมาไก่",
  kee_mao_beef: "ขี้เมาเนื้อ",
  kee_mao_sea: "ขี้เมาทะเล",
  spaghetti_kee_mao: "สปาเก็ตตี้ขี้เมา",
  kai_omelet_rice: "ไข่เจียวข้าว",
  omelet_shrimp: "ไข่เจียวกุ้ง",
  omelet_pork: "ไข่เจียวหมู",
  omelet_crab: "ไข่เจียวปู",
  fried_rice_pork: "ข้าวผัดหมู",
  fried_rice_shrimp: "ข้าวผัดกุ้ง",
  fried_rice_sea: "ข้าวผัดทะเล",
  fried_rice_canned_fish: "ข้าวผัดปลากระป๋อง",
  pad_see_ew_pork: "ผัดซีอิ๊วหมู",
  rad_na_pork: "ราดหน้าหมู",
  pad_thai_shrimp: "ผัดไทยกุ้ง",
  tom_jued_pork: "ต้มจืดหมู",
  suki_water_pork: "สุกี้น้ำหมู",
  suki_water_sea: "สุกี้น้ำทะเล",
  suki_dry_pork: "สุกี้แห้งหมู",
  yum_mu_yo: "ยำหมูยอ",
  yum_woonsen_sea: "ยำวุ้นเส้นทะเล",
  yum_canned_fish: "ยำปลากระป๋อง",
  khao_tom_shrimp: "ข้าวต้มกุ้ง",
  khao_tom_pork: "ข้าวต้มหมู",
  khao_tom_fish: "ข้าวต้มปลา"
  };
fetch('http://localhost:8081/api/menu')
  .then(res => res.json())
  .then(data => {
    menuList.innerHTML = ''; // ล้าง menu-list เก่าก่อน

    // กรองเฉพาะจนถึง item.name === "water"
    for (const item of data) {
      if (item.name === 'water') break; // เจอ water หยุด loop
      if (item.categoryId !== 1) continue; // ข้ามถ้าไม่ใช่หมวดอาหาร
     
      const div = document.createElement('div');
      div.classList.add('menu-item');
      div.dataset.id = item.id;

	  div.innerHTML = `
	    <div class="image-box">
	      <img src="${item.image}" alt="${item.name}">
	      <div class="add-btn" data-action="add">+</div>
	    </div>
	    <p>${nameMap[item.name]}</p>
	    <p class="price">${item.price} บาท</p>
	  `;

      menuList.appendChild(div);
    }
  })
  .catch(err => console.error('Fetch error:', err));
