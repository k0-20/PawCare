import { useState } from 'react';
import { type PreventiveCareTaskFormData, type Pet, type ValidationError, type CareTaskType, type CareTaskSource } from '@/types';
import { Input, Select, Textarea, Button } from '@/components/ui';
import { AlertBanner } from '@/components/ui/Alert';
import { Save, Loader2 } from 'lucide-react';

interface PreventiveCareTaskFormProps {
  pets: Pet[];
  onSubmit: (data: PreventiveCareTaskFormData) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: PreventiveCareTaskFormData = {
  pet_id: '',
  task_type: 'vaccination',
  title: '',
  due_date: '',
  source: 'owner_set',
  notes: '',
};

const taskTypes: { value: CareTaskType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'checkup', label: 'Checkup' },
  { value: 'dental', label: 'Dental' },
  { value: 'other', label: 'Other' },
];

const sources: { value: CareTaskSource; label: string }[] = [
  { value: 'owner_set', label: 'Owner Set' },
  { value: 'vet_recommended', label: 'Vet Recommended' },
];

function validate(data: PreventiveCareTaskFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.pet_id) {
    errors.push({ field: 'pet_id', message: 'Please select a pet' });
  }
  if (!data.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }
  if (!data.due_date) {
    errors.push({ field: 'due_date', message: 'Due date is required' });
  }

  return errors;
}

export function PreventiveCareTaskForm({ pets, onSubmit, onCancel }: PreventiveCareTaskFormProps) {
  const [formData, setFormData] = useState<PreventiveCareTaskFormData>({
    ...emptyForm,
    pet_id: pets.length === 1 ? pets[0].id : '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof PreventiveCareTaskFormData>(field: K, value: PreventiveCareTaskFormData[K]) {
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
      setSubmitError(err instanceof Error ? err.message : 'Failed to save task. Please try again.');
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
          id="task_type"
          label="Task Type *"
          value={formData.task_type}
          onChange={(e) => updateField('task_type', e.target.value as CareTaskType)}
        >
          {taskTypes.map((tt) => (
            <option key={tt.value} value={tt.value}>
              {tt.label}
            </option>
          ))}
        </Select>
        <Input
          id="title"
          label="Title *"
          placeholder="e.g. Rabies booster"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={getFieldError('title')}
        />
        <Input
          id="due_date"
          label="Due Date *"
          type="date"
          value={formData.due_date}
          onChange={(e) => updateField('due_date', e.target.value)}
          error={getFieldError('due_date')}
        />
        <Select
          id="source"
          label="Source"
          value={formData.source}
          onChange={(e) => updateField('source', e.target.value as CareTaskSource)}
        >
          {sources.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Additional notes..."
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
              <Save className="h-4 w-4" /> Save Task
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
