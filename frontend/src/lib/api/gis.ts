import api from '../api';

export const gisApi = {
  getAssets: async () => {
    const { data } = await api.get<GeoJSON.FeatureCollection>('/gis/assets');
    return data;
  },

  getCustomers: async () => {
    const { data } = await api.get<GeoJSON.FeatureCollection>('/gis/customers');
    return data;
  },
};
