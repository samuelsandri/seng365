import axios from 'axios';

const SERVER_URL = 'http://localhost:4941/api/v1';

let instance = axios.create({
  baseURL: SERVER_URL,
  timeout: 5000,
  headers: {'X-Authorization': localStorage.sessionId}
});

export const apiUser = {
  refreshInstance: () => {
    instance = axios.create({
      baseURL: SERVER_URL,
      timeout: 5000,
      headers: {'X-Authorization': localStorage.sessionId}
    });
  },
  createUser: (name, email, password, city, country) => instance.post('/users/register',{
    name: name,
    email: email,
    password: password,
    city: city,
    country: country,
  }),
  login: (email, password) => instance.post('/users/login', {
    email: email,
    password: password,
  }),
  logout: () => instance.post('/users/logout'),
  getUser: (userId) => instance.get('/users/' + userId),
  getPetitions: () => instance.get('/petitions'),
  getPetitionsFiltered: (queryString) => instance.get('/petitions?' + queryString),
  getCategories: () => instance.get('/petitions/categories'),
};