fetch('http://localhost:8081/api/menu')
  .then(res => res.json())
  .then(data => {
    console.log(data);
  })
  .catch(err => console.error('Fetch error:', err));