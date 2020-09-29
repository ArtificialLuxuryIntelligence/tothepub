const baseUrl =
  process.env.MODE === 'dev'
    ? 'http://localhost:5000'
    : 'https://londonboozer.herokuapp.com';
export { baseUrl };
