// lib/novaposhta.ts

const API_KEY = 'ВАШ_КЛЮЧ_ВСТАВИТИ_СЮДИ'; // <--- ВСТАВ СЮДИ СВІЙ КЛЮЧ
const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

// Функція пошуку міста
export const searchCities = async (query: string) => {
  if (query.length < 2) return []; // Шукаємо тільки якщо ввели 2+ букви

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: query,
          Limit: '50',
          Page: '1'
        }
      })
    });
    const data = await res.json();
    
    // Нова Пошта повертає купу даних, нам треба тільки назва і Ref
    return data.data[0].Addresses.map((item: any) => ({
      name: item.Present, // Назва: "м. Київ, Київська обл."
      deliveryCity: item.DeliveryCity // Цей код треба, щоб шукати відділення
    }));
  } catch (error) {
    console.error("Помилка НП:", error);
    return [];
  }
};

// Функція отримання відділень
export const getWarehouses = async (cityRef: string) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef, // Шукаємо по коду міста
          Limit: '500'      // Максимум відділень
        }
      })
    });
    const data = await res.json();
    return data.data.map((item: any) => item.Description); // Повертаємо тільки назви відділень
  } catch (error) {
    console.error("Помилка відділень:", error);
    return [];
  }
};