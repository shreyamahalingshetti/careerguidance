const url = 'https://jsearch27.p.rapidapi.com/search?query=frontend%20in%20India&page=1&num_pages=1&date_posted=month&country=in';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '30a682dd75msh2aa460797ccdf76p1a2915jsna384e139208',
    'X-RapidAPI-Host': 'jsearch27.p.rapidapi.com'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));
