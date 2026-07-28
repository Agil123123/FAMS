import api from '../api';

export interface CustomerOnu {
  id: string;
  serial_number: string;
  mac_address: string;
}

export interface CustomerPackage {
  id: string;
  package_profile_id: string;
  package_profile?: any;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  odp_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  odp?: any;
  customer_onu?: CustomerOnu;
  customer_package?: CustomerPackage;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'status' | 'created_at' | 'updated_at' | 'odp' | 'customer_onu' | 'customer_package'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export const customersApi = {
  getAll: async () => {
    const { data } = await api.get<Customer[]>('/customers');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  create: async (customer: CreateCustomerInput) => {
    const { data } = await api.post<Customer>('/customers', customer);
    return data;
  },

  update: async (id: string, customer: UpdateCustomerInput) => {
    const { data } = await api.patch<Customer>(`/customers/${id}`, customer);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },

  assignOnu: async (id: string, onuData: { serial_number: string; mac_address?: string }) => {
    const { data } = await api.post(`/customers/${id}/onu`, onuData);
    return data;
  },

  assignPackage: async (id: string, packageData: { package_profile_id: string }) => {
    const { data } = await api.post(`/customers/${id}/package`, packageData);
    return data;
  },

  activate: async (id: string) => {
    const { data } = await api.post(`/customers/${id}/activate`);
    return data;
  },

  terminate: async (id: string) => {
    const { data } = await api.post(`/customers/${id}/terminate`);
    return data;
  },

  relocate: async (id: string, newOdpId: string) => {
    const { data } = await api.post(`/customers/${id}/relocate`, { new_odp_id: newOdpId });
    return data;
  },
};
