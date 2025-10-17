fetch('http://localhost:8081/api/menu')
  .then(res => res.json())
  .then(data => {
    console.log(data); // แสดงผลข้อมูลที่ได้จาก API
  })
  .catch(err => console.error('Fetch error:', err));
