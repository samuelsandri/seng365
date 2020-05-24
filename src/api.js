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
  addProfilePicture: (userId, image) => instance.put('/users/' + userId + '/photo', image),
  getProfilePicture: (userId) => instance.get('/users/' + userId + '/photo'),
  removeProfilePicture: (userId) => instance.remove('/users/' + userId + '/photo'),
  editUser: (userId, name, email, city, country) => instance.patch('/users/' + userId, {
    name: name,
    email: email,
    city: city,
    country: country,
  }),
  editUserNewPassword: (userId, name, email, newPassword, currentPassword, city, country) => instance.patch('/users/' + userId, {
    name: name,
    email: email,
    password: newPassword,
    currentPassword: currentPassword,
    city: city,
    country: country,
  })
};

export const apiPetition = {
  getDetailedPetition: (petitionId) => instance.get('/petitions/' + petitionId),
  getPetitionSignatures: (petitionId) => instance.get('petitions/' + petitionId + '/signatures'),
  getPetitions: () => instance.get('/petitions'),
  getPetitionsFiltered: (queryString) => instance.get('/petitions?' + queryString),
  getCategories: () => instance.get('/petitions/categories'),
  createPetition: (title, description, categoryId, closingDate) => instance.post('/petitions', {
    title: title,
    description: description,
    categoryId: categoryId,
    closingDate: closingDate,
  }),
  signPetition: (petitionId) => instance.post('/petitions/' + petitionId + '/signatures'),
  patchPetition: (petitionId, title, description, categoryId, closingDate) => instance.patch('/petitions/' + petitionId, {
    title: title,
    description: description,
    categoryId: categoryId,
    closingDate: closingDate,
  }),
  deletePetition: (petitionId) => instance.delete('/petitions/' + petitionId),
  addPetitionSignature: (petitionId) => instance.post('/petitions/' + petitionId + '/signatures'),
  deletePetitionSignature: (petitionId) => instance.delete('/petitions/' + petitionId + '/signatures'),
};