import { type Pet } from '@/types';
import { Card, Badge } from '@/components/ui';
import { Cat, Dog, Trash2, Calendar, Weight } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  onDelete?: (pet: Pet) => void;
  onClick?: (pet: Pet) => void;
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return 'Age unknown';
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years < 0) return 'Age unknown';
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''} old`;
  return `${years} year${years !== 1 ? 's' : ''} old`;
}

export function PetCard({ pet, onDelete, onClick }: PetCardProps) {
  return (
    <Card hover onClick={onClick ? () => onClick(pet) : undefined} className="overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-600 overflow-hidden">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover" />
          ) : pet.species === 'dog' ? (
            <Dog className="h-8 w-8" />
          ) : (
            <Cat className="h-8 w-8" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-ink-900">{pet.name}</h3>
            <div className="flex items-center gap-2">
              <Badge tone={pet.species === 'dog' ? 'blue' : 'amber'}>
                {pet.species === 'dog' ? 'Dog' : 'Cat'}
              </Badge>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pet);
                  }}
                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-ink-500">{pet.breed || 'Breed not specified'}</p>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {calculateAge(pet.birth_date)}
            </span>
            {pet.weight_kg && (
              <span className="flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5" />
                {pet.weight_kg} kg
              </span>
            )}
            {pet.is_neutered && <Badge tone="neutral">Neutered</Badge>}
          </div>
        </div>
      </div>
    </Card>
  );
}
