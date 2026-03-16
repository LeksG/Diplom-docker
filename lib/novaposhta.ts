
const API_KEY = '37083846edd26711dfc559da2f6e2f6f'; 
const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

// Функція пошуку міста
export const searchCities = async (query: string) => {
  if (query.length < 2) return []; 

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
    
    
    return data.data[0].Addresses.map((item: any) => ({
      name: item.Present, 
      deliveryCity: item.DeliveryCity
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
          CityRef: cityRef, 
          Limit: '500'      
        }
      })
    });
    const data = await res.json();
    return data.data.map((item: any) => item.Description);
  } catch (error) {
    console.error("Помилка відділень:", error);
    return [];
  }
};