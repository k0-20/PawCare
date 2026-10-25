import { useState } from 'react';
import { type MedicalRecordFormData, type MedicalRecordType, type Pet, type ValidationError } from '@/types';
import { Input, Select, Textarea, Button } from '@/components/ui';
import { AlertBanner } from '@/components/ui/Alert';
import { Save, Loader2 } from 'lucide-react';

interface MedicalRecordFormProps {
  pets: Pet[];
  onSubmit: (data: MedicalRecordFormData) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: MedicalRecordFormData = {
  pet_id: '',
  record_type: 'vet_visit',
  title: '',
  visit_date: '',
  veterinarian: '',
  clinic_name: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  notes: '',
};

const recordTypes: { value: MedicalRecordType; label: string }[] = [
  { value: 'vet_visit', label: 'Vet Visit' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'other', label: 'Other' },
];

function validate(data: MedicalRecordFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.pet_id) {
    errors.push({ field: 'pet_id', message: 'Please select a pet' });
  }
  if (!data.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }
  if (!data.visit_date) {
    errors.push({ field: 'visit_date', message: 'Visit date is required' });
  } else {
    const visitDate = new Date(data.visit_date);
    const now = new Date();
    if (visitDate > now) {
      errors.push({ field: 'visit_date', message: 'Visit date cannot be in the future' });
    }
  }

  return errors;
}

export function MedicalRecordForm({ pets, onSubmit, onCancel }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    ...emptyForm,
    pet_id: pets.length === 1 ? pets[0].id : '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof MedicalRecordFormData>(field: K, value: MedicalRecordFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save medical record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError('')} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="pet_id"
          label="Pet *"
          value={formData.pet_id}
          onChange={(e) => updateField('pet_id', e.target.value)}
          error={getFieldError('pet_id')}
        >
          <option value="">Select a pet</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.species})
            </option>
          ))}
        </Select>
        <Select
          id="record_type"
          label="Record Type *"
          value={formData.record_type}
          onChange={(e) => updateField('record_type', e.target.value as MedicalRecordType)}
        >
          {recordTypes.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </Select>
        <Input
          id="title"
          label="Title *"
          placeholder="e.g. Annual wellness exam"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={getFieldError('title')}
        />
        <Input
          id="visit_date"
          label="Visit Date *"
          type="date"
          value={formData.visit_date}
          onChange={(e) => updateField('visit_date', e.target.value)}
          error={getFieldError('visit_date')}
        />
        <Input
          id="veterinarian"
          label="Veterinarian"
          placeholder="e.g. Dr. Smith"
          value={formData.veterinarian}
          onChange={(e) => updateField('veterinarian', e.target.value)}
        />
        <Input
          id="clinic_name"
          label="Clinic/Hospital"
          placeholder="e.g. Happy Paws Vet Clinic"
          value={formData.clinic_name}
          onChange={(e) => updateField('clinic_name', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          id="diagnosis"
          label="Diagnosis"
          placeholder="Diagnosis or findings..."
          value={formData.diagnosis}
          onChange={(e) => updateField('diagnosis', e.target.value)}
          rows={3}
        />
        <Textarea
          id="treatment"
          label="Treatment"
          placeholder="Treatment provided..."
          value={formData.treatment}
          onChange={(e) => updateField('treatment', e.target.value)}
          rows={3}
        />
      </div>

      <Textarea
        id="prescription"
        label="Prescription/Medications"
        placeholder="Medications prescribed with dosage..."
        value={formData.prescription}
        onChange={(e) => updateField('prescription', e.target.value)}
        rows={3}
      />

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Additional notes or observations..."
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        rows={3}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Record
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
