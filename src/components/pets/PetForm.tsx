import { useState } from 'react';
import { type PetFormData, type PetSpecies, type ValidationError } from '@/types';
import { Input, Select, Textarea, Checkbox, Button } from '@/components/ui';
import { AlertBanner } from '@/components/ui/Alert';
import { Save, Loader2 } from 'lucide-react';

interface PetFormProps {
  onSubmit: (data: PetFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<PetFormData>;
}

const emptyForm: PetFormData = {
  name: '',
  species: 'dog',
  breed: '',
  gender: 'unknown',
  birth_date: '',
  weight_kg: '',
  microchip_id: '',
  is_neutered: false,
  color: '',
  photo_url: '',
  notes: '',
};

function validate(data: PetFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Pet name is required' });
  } else if (data.name.trim().length < 1 || data.name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name must be between 1 and 50 characters' });
  }

  if (data.weight_kg) {
    const weight = parseFloat(data.weight_kg);
    if (isNaN(weight) || weight <= 0) {
      errors.push({ field: 'weight_kg', message: 'Weight must be a positive number' });
    } else if (weight > 100) {
      errors.push({ field: 'weight_kg', message: 'Weight seems unusually high — please check the value' });
    }
  }

  if (data.birth_date) {
    const birth = new Date(data.birth_date);
    const now = new Date();
    if (birth > now) {
      errors.push({ field: 'birth_date', message: 'Birth date cannot be in the future' });
    }
  }

  if (data.microchip_id && data.microchip_id.length > 30) {
    errors.push({ field: 'microchip_id', message: 'Microchip ID is too long (max 30 characters)' });
  }

  if (data.photo_url) {
    try {
      new URL(data.photo_url);
    } catch {
      errors.push({ field: 'photo_url', message: 'Please enter a valid URL' });
    }
  }

  return errors;
}

export function PetForm({ onSubmit, onCancel, initialData }: PetFormProps) {
  const [formData, setFormData] = useState<PetFormData>({
    ...emptyForm,
    ...initialData,
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof PetFormData>(field: K, value: PetFormData[K]) {
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
      setSubmitError(err instanceof Error ? err.message : 'Failed to save pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError('')} />
      )}

      {/* Species selector */}
      <div>
        <label className="input-label">Pet type</label>
        <div className="grid grid-cols-2 gap-3">
          {(['dog', 'cat'] as PetSpecies[]).map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => updateField('species', sp)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                formData.species === sp
                  ? 'border-sage-500 bg-sage-50 text-sage-700'
                  : 'border-cream-300 bg-white text-ink-500 hover:border-sage-200'
              }`}
            >
              {sp === 'dog' ? '🐕 Dog' : '🐱 Cat'}
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          label="Pet name *"
          placeholder="e.g. Bruno"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={getFieldError('name')}
        />
        <Input
          id="breed"
          label="Breed"
          placeholder={formData.species === 'dog' ? 'e.g. Golden Retriever' : 'e.g. Persian'}
          value={formData.breed}
          onChange={(e) => updateField('breed', e.target.value)}
        />
        <Select
          id="gender"
          label="Gender"
          value={formData.gender}
          onChange={(e) => updateField('gender', e.target.value as PetFormData['gender'])}
        >
          <option value="unknown">Unknown</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
        <Input
          id="birth_date"
          label="Date of birth"
          type="date"
          value={formData.birth_date}
          onChange={(e) => updateField('birth_date', e.target.value)}
          error={getFieldError('birth_date')}
        />
        <Input
          id="weight_kg"
          label="Weight (kg)"
          type="number"
          step="0.1"
          placeholder="e.g. 12.5"
          value={formData.weight_kg}
          onChange={(e) => updateField('weight_kg', e.target.value)}
          error={getFieldError('weight_kg')}
        />
        <Input
          id="color"
          label="Coat color"
          placeholder="e.g. Golden, Black & White"
          value={formData.color}
          onChange={(e) => updateField('color', e.target.value)}
        />
      </div>

      {/* Additional info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="microchip_id"
          label="Microchip ID"
          placeholder="e.g. 985112004567890"
          value={formData.microchip_id}
          onChange={(e) => updateField('microchip_id', e.target.value)}
          error={getFieldError('microchip_id')}
          hint="Optional — 15-digit microchip number"
        />
        <Input
          id="photo_url"
          label="Photo URL"
          placeholder="https://…"
          value={formData.photo_url}
          onChange={(e) => updateField('photo_url', e.target.value)}
          error={getFieldError('photo_url')}
          hint="Optional — link to a photo of your pet"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Checkbox
          id="is_neutered"
          label="Spayed / Neutered"
          checked={formData.is_neutered}
          onChange={(e) => updateField('is_neutered', e.target.checked)}
        />
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Any additional information about your pet — temperament, allergies, special care needs…"
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
      />

      <div className="flex justify-end gap-3 border-t border-cream-200 pt-6">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Pet
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
