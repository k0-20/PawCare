export type PetSpecies = 'dog' | 'cat';

export type PetGender = 'male' | 'female' | 'unknown';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  gender: PetGender | null;
  birth_date: string | null;
  weight_kg: number | null;
  microchip_id: string | null;
  is_neutered: boolean;
  color: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetFormData {
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  birth_date: string;
  weight_kg: string;
  microchip_id: string;
  is_neutered: boolean;
  color: string;
  photo_url: string;
  notes: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UserPreferences {
  id: string;
  user_id: string;
  display_name: string | null;
  email_alerts: boolean;
  in_app_notifications: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 'care_reminder' | 'health_alert' | 'system' | 'info';

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  related_pet_id: string | null;
  created_at: string;
}

export type CareTaskType = 'vaccination' | 'deworming' | 'checkup' | 'dental' | 'other';
export type CareTaskStatus = 'pending' | 'completed' | 'overdue';
export type CareTaskSource = 'vet_recommended' | 'owner_set';

export interface PreventiveCareTask {
  id: string;
  pet_id: string;
  user_id: string;
  task_type: CareTaskType;
  title: string;
  due_date: string;
  completed_date: string | null;
  status: CareTaskStatus;
  source: CareTaskSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreventiveCareTaskFormData {
  pet_id: string;
  task_type: CareTaskType;
  title: string;
  due_date: string;
  source: CareTaskSource;
  notes: string;
}

export type MedicalRecordType = 'vet_visit' | 'vaccination' | 'prescription' | 'lab_result' | 'surgery' | 'other';

export interface MedicalRecord {
  id: string;
  pet_id: string;
  user_id: string;
  record_type: MedicalRecordType;
  title: string;
  visit_date: string;
  veterinarian: string | null;
  clinic_name: string | null;
  diagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  notes: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordFormData {
  pet_id: string;
  record_type: MedicalRecordType;
  title: string;
  visit_date: string;
  veterinarian: string;
  clinic_name: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
}

export interface VeterinaryClinic {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface VeterinaryClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  notes: string;
  is_favorite: boolean;
}
