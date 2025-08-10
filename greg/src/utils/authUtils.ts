import AsyncStorage from '@react-native-async-storage/async-storage';

export const getValidAccessToken = async (): Promise<string | null> => {
  const access = await AsyncStorage.getItem('access');
  const refresh = await AsyncStorage.getItem('refresh');

  if (!access || !refresh) return null;

  // Vérifier si le token est expiré
  const payload = JSON.parse(atob(access.split('.')[1]));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp > now) {
    return access; // Toujours valide
  }

  // Sinon : essayer de rafraîchir avec refresh token
  try {
    const response = await fetch('http://10.0.2.2:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      console.warn('Échec du rafraîchissement du token');
      return null;
    }

    const data = await response.json();
    await AsyncStorage.setItem('access', data.access);
    return data.access;
  } catch (error) {
    console.error('Erreur de refresh token:', error);
    return null;
  }
};
