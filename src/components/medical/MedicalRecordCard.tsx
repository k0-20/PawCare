import { type MedicalRecord, type Pet } from '@/types';
import { Card, Badge } from '@/components/ui';
import { FileText, Calendar, User, Building2, Trash2, Stethoscope, Syringe, Pill, FlaskConical, Scissors } from 'lucide-react';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  pet?: Pet;
  onDelete?: (record: MedicalRecord) => void;
}

const recordTypeConfig = {
  vet_visit: { label: 'Vet Visit', icon: Stethoscope, tone: 'blue' as const },
  vaccination: { label: 'Vaccination', icon: Syringe, tone: 'sage' as const },
  prescription: { label: 'Prescription', icon: Pill, tone: 'amber' as const },
  lab_result: { label: 'Lab Result', icon: FlaskConical, tone: 'purple' as const },
  surgery: { label: 'Surgery', icon: Scissors, tone: 'red' as const },
  other: { label: 'Other', icon: FileText, tone: 'neutral' as const },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function MedicalRecordCard({ record, pet, onDelete }: MedicalRecordCardProps) {
  const config = recordTypeConfig[record.record_type];
  const Icon = config.icon;

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-ink-900">{record.title}</h3>
                <Badge tone={config.tone}>{config.label}</Badge>
                {pet && <Badge tone="neutral">{pet.name}</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-ink-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(record.visit_date)}
                </span>
                {record.veterinarian && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {record.veterinarian}
                  </span>
                )}
                {record.clinic_name && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {record.clinic_name}
                  </span>
                )}
              </div>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Delete this medical record? This cannot be undone.')) {
                  onDelete(record);
                }
              }}
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {(record.diagnosis || record.treatment || record.prescription || record.notes) && (
          <div className="mt-4 space-y-3 border-t border-cream-200 pt-4">
            {record.diagnosis && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Diagnosis</p>
                <p className="mt-1 text-sm text-ink-700 whitespace-pre-wrap">{record.diagnosis}</p>
              </div>
            )}
            {record.treatment && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Treatment</p>
                <p className="mt-1 text-sm text-ink-700 whitespace-pre-wrap">{record.treatment}</p>
              </div>
            )}
            {record.prescription && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Prescription / Medications</p>
                <p className="mt-1 text-sm text-ink-700 whitespace-pre-wrap">{record.prescription}</p>
              </div>
            )}
            {record.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Notes</p>
                <p className="mt-1 text-sm text-ink-700 whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
