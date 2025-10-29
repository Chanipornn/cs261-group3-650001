const menuList = document.querySelector('.menu-list');

fetch('http://localhost:8081/api/menu')
  .then(res => res.json())
  .then(data => {
    menuList.innerHTML = ''; 

    for (const item of data) {
      if (item.name === 'water') break;
      if (item.categoryId !== 1) continue; 
     
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
    }
  })
  .catch(err => console.error('Fetch error:', err));
