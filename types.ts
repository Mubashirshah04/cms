
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Client {
  id: string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  clients?: Client; // Joined relation
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  icon: string;
  description: string;
  benefits: string[];
}

export interface DashboardStats {
  total: number;
  today: number;
  upcoming: number;
  pending: number;
}