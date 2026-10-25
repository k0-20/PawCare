import { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, EmptyState, AlertBanner, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { FileText, Plus, Stethoscope, Syringe, Pill, FlaskConical, Scissors, Calendar, User, Building2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { usePets } from '@/hooks/usePets';
import { MedicalRecordForm } from '@/components/medical/MedicalRecordForm';
import { type MedicalRecordFormData } from '@/types';

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

export function MedicalRecordsPage() {
  const { pets } = usePets();
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddRecord = useCallback(
    async (data: MedicalRecordFormData) => {
      const newRecord = {
        id: crypto.randomUUID(),
        pet_id: data.pet_id,
        record_type: data.record_type,
        title: data.title.trim(),
        visit_date: data.visit_date,
        veterinarian: data.veterinarian.trim() || null,
        clinic_name: data.clinic_name.trim() || null,
        diagnosis: data.diagnosis.trim() || null,
        treatment: data.treatment.trim() || null,
        prescription: data.prescription.trim() || null,
        notes: data.notes.trim() || null,
        created_at: new Date().toISOString(),
      };
      setRecords((prev) => [newRecord, ...prev]);
      setShowForm(false);
      setSuccessMessage('Medical record has been added successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    []
  );

  const handleDeleteRecord = useCallback((recordId: string) => {
    if (confirm('Delete this medical record? This cannot be undone.')) {
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    }
  }, []);

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="A timeline of vet visits, diagnoses, treatments, and prescriptions.">
        <Button onClick={() => setShowForm(!showForm)} disabled={pets.length === 0}>
          {showForm ? (
            'Cancel'
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Record
            </>
          )}
        </Button>
      </PageHeader>

      {pets.length === 0 && !showForm && (
        <div className="mb-4">
          <AlertBanner type="info" message="Add a pet first before creating medical records." />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
        </div>
      )}

      {showForm && pets.length > 0 && (
        <Card className="mb-6">
          <CardHeader
            title="Add Medical Record"
            subtitle="Record a vet visit, vaccination, treatment, or lab result."
            icon={<FileText className="h-5 w-5" />}
          />
          <CardBody>
            <MedicalRecordForm pets={pets} onSubmit={handleAddRecord} onCancel={() => setShowForm(false)} />
          </CardBody>
        </Card>
      )}

      {records.length === 0 && !showForm ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No medical records yet"
            description={
              pets.length === 0
                ? 'Add a pet first, then you can start logging vet visits, treatments, and prescriptions.'
                : 'Start logging vet visits, treatments, and prescriptions to build a complete medical history for your pets.'
            }
            action={
              pets.length > 0 ? (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" /> Add your first record
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const config = recordTypeConfig[record.record_type as keyof typeof recordTypeConfig] || recordTypeConfig.other;
            const Icon = config.icon;
            const pet = pets.find((p) => p.id === record.pet_id);
            return (
              <Card key={record.id} className="overflow-hidden">
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
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
          })}
        </div>
      )}
    </div>
  );
}
