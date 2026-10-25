import { type VeterinaryClinic } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { MapPin, Phone, Mail, Globe, Clock, Star, Trash2 } from 'lucide-react';

interface VeterinaryClinicCardProps {
  clinic: VeterinaryClinic;
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void;
  onDelete?: (clinicId: string) => void;
}

export function VeterinaryClinicCard({ clinic, onToggleFavorite, onDelete }: VeterinaryClinicCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ink-900">{clinic.name}</h3>
              {clinic.is_favorite && <Badge tone="amber">Favorite</Badge>}
            </div>
            {clinic.hours && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                {clinic.hours}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(clinic.id, clinic.is_favorite)}
                className={`rounded-lg p-1.5 transition-colors ${
                  clinic.is_favorite
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-ink-400 hover:bg-cream-100'
                }`}
                title={clinic.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className="h-4 w-4" fill={clinic.is_favorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Delete this clinic? This cannot be undone.')) {
                    onDelete(clinic.id);
                  }
                }}
                className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {clinic.address && (
            <div className="flex items-start gap-2 text-sm text-ink-600">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-ink-400" />
              <span className="whitespace-pre-wrap">{clinic.address}</span>
            </div>
          )}
          {clinic.phone && (
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <Phone className="h-4 w-4 shrink-0 text-ink-400" />
              <a href={`tel:${clinic.phone}`} className="hover:text-sage-600 transition-colors">
                {clinic.phone}
              </a>
            </div>
          )}
          {clinic.email && (
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <Mail className="h-4 w-4 shrink-0 text-ink-400" />
              <a href={`mailto:${clinic.email}`} className="hover:text-sage-600 transition-colors">
                {clinic.email}
              </a>
            </div>
          )}
          {clinic.website && (
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <Globe className="h-4 w-4 shrink-0 text-ink-400" />
              <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="hover:text-sage-600 transition-colors truncate">
                {clinic.website}
              </a>
            </div>
          )}
        </div>

        {clinic.notes && (
          <div className="mt-4 border-t border-cream-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Notes</p>
            <p className="mt-1 text-sm text-ink-700 whitespace-pre-wrap">{clinic.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
