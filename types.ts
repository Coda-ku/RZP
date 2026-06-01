export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  photo_url?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  description?: string;
}

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface LineItem {
  nama: string;
  p: number;
  l: number;
  t: number;
  qty: number;
  harga: number;
  unit?: string;
}

export interface DocumentBase {
  id?: number;
  no: string;
  client_name: string;
  date: string;
  status: string;
  type: string;
  discount: number;
  tax: number;
  notes?: string;
  location?: string;
  payment_term?: string;
  items: LineItem[];
  attachments: string[];
}