import { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, EmptyState, AlertBanner } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { type VeterinaryClinicFormData } from '@/types';
import { VeterinaryClinicForm } from '@/components/clinics/VeterinaryClinicForm';
import { Badge } from '@/components/ui';

export function VeterinaryClinicsPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddClinic = useCallback(
    async (data: VeterinaryClinicFormData) => {
      const newClinic = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        address: data.address.trim() || null,
        phone: data.phone.trim() || null,
        email: data.email.trim() || null,
        website: data.website.trim() || null,
        hours: data.hours.trim() || null,
        notes: data.notes.trim() || null,
        is_favorite: data.is_favorite,
        created_at: new Date().toISOString(),
      };
      setClinics((prev) => [newClinic, ...prev]);
      setShowForm(false);
      setSuccessMessage('Veterinary clinic has been added successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    []
  );

  const handleToggleFavorite = useCallback((clinicId: string) => {
    setClinics((prev) =>
      prev.map((c) => (c.id === clinicId ? { ...c, is_favorite: !c.is_favorite } : c))
    );
  }, []);

  const handleDelete = useCallback((clinicId: string) => {
    if (confirm('Delete this clinic? This cannot be undone.')) {
      setClinics((prev) => prev.filter((c) => c.id !== clinicId));
    }
  }, []);

  const favoriteClinics = clinics.filter((c) => c.is_favorite);
  const otherClinics = clinics.filter((c) => !c.is_favorite);

  return (
    <div>
      <PageHeader title="Veterinary Clinics" subtitle="Keep contact details for your trusted vets and find nearby clinics.">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            'Cancel'
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Clinic
            </>
          )}
        </Button>
      </PageHeader>

      {successMessage && (
        <div className="mb-4">
          <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader
            title="Add Veterinary Clinic"
            subtitle="Save contact details for your trusted veterinary clinic."
            icon={<MapPin className="h-5 w-5" />}
          />
          <CardBody>
            <VeterinaryClinicForm onSubmit={handleAddClinic} onCancel={() => setShowForm(false)} />
          </CardBody>
        </Card>
      )}

      {clinics.length === 0 && !showForm ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No clinics saved yet"
            description="Save your preferred veterinary clinics with contact details and hours. You'll be able to quickly find and contact them when your pet needs care."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add your first clinic
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {favoriteClinics.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink-900">Favorites</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteClinics.map((clinic) => (
                  <Card key={clinic.id} className="overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-ink-900">{clinic.name}</h3>
                            {clinic.is_favorite && <Badge tone="amber">Favorite</Badge>}
                          </div>
                          {clinic.hours && <p className="mt-1 text-sm text-ink-400">{clinic.hours}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(clinic.id)}
                            className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50"
                          >
                            <Star className="h-4 w-4" fill="currentColor" />
                          </button>
                          <button
                            onClick={() => handleDelete(clinic.id)}
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {(clinic.address || clinic.phone || clinic.email || clinic.website || clinic.notes) && (
                        <div className="mt-4 space-y-2 text-sm text-ink-600">
                          {clinic.address && <div>{clinic.address}</div>}
                          {clinic.phone && <div>Phone: {clinic.phone}</div>}
                          {clinic.email && <div>Email: {clinic.email}</div>}
                          {clinic.website && <div>Website: {clinic.website}</div>}
                          {clinic.notes && <div className="mt-2 pt-2 border-t border-cream-200 whitespace-pre-wrap">{clinic.notes}</div>}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {otherClinics.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink-900">
                {favoriteClinics.length > 0 ? 'Other Clinics' : 'My Clinics'}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {otherClinics.map((clinic) => (
                  <Card key={clinic.id} className="overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ink-900">{clinic.name}</h3>
                          {clinic.hours && <p className="mt-1 text-sm text-ink-400">{clinic.hours}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(clinic.id)}
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-cream-100"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(clinic.id)}
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {(clinic.address || clinic.phone || clinic.email || clinic.website || clinic.notes) && (
                        <div className="mt-4 space-y-2 text-sm text-ink-600">
                          {clinic.address && <div>{clinic.address}</div>}
                          {clinic.phone && <div>Phone: {clinic.phone}</div>}
                          {clinic.email && <div>Email: {clinic.email}</div>}
                          {clinic.website && <div>Website: {clinic.website}</div>}
                          {clinic.notes && <div className="mt-2 pt-2 border-t border-cream-200 whitespace-pre-wrap">{clinic.notes}</div>}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
