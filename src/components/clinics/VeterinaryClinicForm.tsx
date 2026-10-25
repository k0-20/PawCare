import { useState } from 'react';
import { type VeterinaryClinicFormData, type ValidationError } from '@/types';
import { Input, Textarea, Button, Checkbox } from '@/components/ui';
import { AlertBanner } from '@/components/ui/Alert';
import { Save, Loader2 } from 'lucide-react';

interface VeterinaryClinicFormProps {
  onSubmit: (data: VeterinaryClinicFormData) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: VeterinaryClinicFormData = {
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  hours: '',
  notes: '',
  is_favorite: false,
};

function validate(data: VeterinaryClinicFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Clinic name is required' });
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (data.website && !/^https?:\/\//.test(data.website)) {
    errors.push({ field: 'website', message: 'Website must start with http:// or https://' });
  }

  return errors;
}

export function VeterinaryClinicForm({ onSubmit, onCancel }: VeterinaryClinicFormProps) {
  const [formData, setFormData] = useState<VeterinaryClinicFormData>(emptyForm);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof VeterinaryClinicFormData>(field: K, value: VeterinaryClinicFormData[K]) {
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
      setSubmitError(err instanceof Error ? err.message : 'Failed to save clinic. Please try again.');
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
        <Input
          id="name"
          label="Clinic Name *"
          placeholder="e.g. Happy Paws Veterinary Hospital"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={getFieldError('name')}
        />
        <Input
          id="phone"
          label="Phone"
          placeholder="e.g. (555) 123-4567"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="e.g. contact@clinic.com"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={getFieldError('email')}
        />
        <Input
          id="website"
          label="Website"
          placeholder="https://..."
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          error={getFieldError('website')}
        />
      </div>

      <Input
        id="address"
        label="Address"
        placeholder="Street address, city, state, zip"
        value={formData.address}
        onChange={(e) => updateField('address', e.target.value)}
      />

      <Input
        id="hours"
        label="Hours of Operation"
        placeholder="e.g. Mon-Fri 9am-6pm, Sat 9am-2pm"
        value={formData.hours}
        onChange={(e) => updateField('hours', e.target.value)}
      />

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Additional notes..."
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        rows={3}
      />

      <Checkbox
        id="is_favorite"
        label="Mark as favorite"
        checked={formData.is_favorite}
        onChange={(e) => updateField('is_favorite', e.target.checked)}
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
              <Save className="h-4 w-4" /> Save Clinic
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
