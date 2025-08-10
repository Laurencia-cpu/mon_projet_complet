// // // Service pour l'authentification avec l'API Django REST Framework

// // export const login = async (email: string, password: string) => {
// //   // Envoie de la requête POST vers l'endpoint de connexion
// //   const response = await fetch('http://10.0.2.2:8000/api/auth/login/', {
// //     method: 'POST',
// //     headers: { 'Content-Type': 'application/json' },
// //     body: JSON.stringify({ email, password }),
// //   });

// //   // Si la réponse est une erreur, on lève une exception avec un message
// //   if (!response.ok) {
// //     const errorData = await response.json();
// //     throw new Error(errorData.error || 'Erreur lors de la connexion');
// //   }

// //   // Retourne la réponse JSON contenant le token et les informations de l'utilisateur
// //   return response.json();
// // };

// // api/api.ts


// // src/api/api.ts
// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:8000', // Adresse de ton backend Django
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const requestPasswordReset = (email: string) =>
//   api.post('/auth/users/reset_password/', { email });

// export const confirmPasswordReset = (uid: string, token: string, newPassword: string) =>
//   api.post('/auth/users/reset_password_confirm/', {
//     uid,
//     token,
//     new_password: newPassword,
//   });

// export default api;

// const API_URL = "http://localhost:8000/api"; // Remplace par ton URL backend

// export const registerUser = async (email: string, password: string, entreprise: any) => {
//     const response = await fetch(`${API_URL}/register/`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password, entreprise }),
//     });
//     return response.json();
// };

// export const loginUser = async (email: string, password: string) => {
//     const response = await fetch(`${API_URL}/login/`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//     });
//     return response.json();
// };

// export const getEntreprise = async (token: string) => {
//     const response = await fetch(`${API_URL}/entreprise/`, {
//         method: "GET",
//         headers: {
//             "Authorization": `Bearer ${token}`,
//         },
//     });
//     return response.json();
// };

// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
