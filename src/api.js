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
  createUser: (data) => instance.post('/users/register', data),
  login: (email, password) => instance.post('/users/login', {
    email: email,
    password: password,
  }),
  logout: () => instance.post('/users/logout'),
  getUser: (userId) => instance.get('/users/' + userId),
  addProfilePicture: (userId, image, contentType) => instance.put('/users/' + userId + '/photo', image, {
    headers: {
      'Content-Type': contentType
    },
  }),
  getProfilePicture: (userId) => instance.get('/users/' + userId + '/photo'),
  removeProfilePicture: (userId) => instance.delete('/users/' + userId + '/photo'),
  editUser: (userId, data) => instance.patch('/users/' + userId, data),
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
  createPetitionNoDate: (title, description, categoryId) => instance.post('/petitions', {
    title: title,
    description: description,
    categoryId: categoryId,
  }),
  signPetition: (petitionId) => instance.post('/petitions/' + petitionId + '/signatures'),
  patchPetition: (petitionId, title, description, categoryId, closingDate) => instance.patch('/petitions/' + petitionId, {
    title: title,
    description: description,
    categoryId: categoryId,
    closingDate: closingDate,
  }),
  patchPetitionNoDate: (petitionId, title, description, categoryId) => instance.patch('/petitions/' + petitionId, {
    title: title,
    description: description,
    categoryId: categoryId,
  }),
  deletePetition: (petitionId) => instance.delete('/petitions/' + petitionId),
  addPetitionSignature: (petitionId) => instance.post('/petitions/' + petitionId + '/signatures'),
  deletePetitionSignature: (petitionId) => instance.delete('/petitions/' + petitionId + '/signatures'),
  addHeroImage: (petitionId, image, contentType) => instance.put('/petitions/' + petitionId + '/photo', image, {
    headers: {
      'Content-Type': contentType
    },
  }),
  removeHeroImage: (petitionId) => instance.delete('/petitions/' + petitionId + '/photo'),
};