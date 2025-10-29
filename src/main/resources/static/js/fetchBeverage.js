const menuList = document.querySelector('.menu-list');

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
          <img src="${item.image}" alt="${item.name}">
          <div class="add-btn" data-action="add">+</div>
        </div>
        <p>${item.name}</p>
        <p class="price">${item.price} บาท</p>
      `;

      menuList.appendChild(div);
    });
  })
  .catch(err => console.error('Fetch error:', err));
