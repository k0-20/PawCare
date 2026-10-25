import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { type Pet, type PetFormData } from '@/types';
import { PetCard } from '@/components/pets/PetCard';
import { PetForm } from '@/components/pets/PetForm';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { EmptyState, LoadingOverlay, ErrorState, AlertBanner } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { Plus, Cat, PawPrint } from 'lucide-react';
import { usePets } from '@/hooks/usePets';

export function MyPetsPage() {
  const { pets, loading, error, refetch } = usePets();
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddPet = useCallback(async (data: PetFormData) => {
    const insertData = {
      name: data.name.trim(),
      species: data.species,
      breed: data.breed.trim() || null,
      gender: data.gender,
      birth_date: data.birth_date || null,
      weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
      microchip_id: data.microchip_id.trim() || null,
      is_neutered: data.is_neutered,
      color: data.color.trim() || null,
      photo_url: data.photo_url.trim() || null,
      notes: data.notes.trim() || null,
    };

    const { error: insertError } = await supabase.from('pets').insert(insertData);
    if (insertError) throw new Error(insertError.message);

    setShowForm(false);
    setSuccessMessage(`${insertData.name} has been added to your pets!`);
    refetch();
    setTimeout(() => setSuccessMessage(''), 5000);
  }, [refetch]);

  const handleDeletePet = useCallback(async (pet: Pet) => {
    if (!confirm(`Remove ${pet.name} from your pets? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from('pets').delete().eq('id', pet.id);
    if (deleteError) {
      alert(`Failed to delete ${pet.name}: ${deleteError.message}`);
      return;
    }
    refetch();
  }, [refetch]);

  return (
    <div>
      <PageHeader title="My Pets" subtitle="Manage profiles for your dogs and cats.">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            'Cancel'
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Pet
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
          <CardHeader title="Add a new pet" subtitle="Fill in the details below — fields marked * are required." icon={<PawPrint className="h-5 w-5" />} />
          <CardBody>
            <PetForm onSubmit={handleAddPet} onCancel={() => setShowForm(false)} />
          </CardBody>
        </Card>
      )}

      {loading ? (
        <LoadingOverlay message="Loading your pets…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : pets.length === 0 && !showForm ? (
        <Card>
          <EmptyState
            icon={Cat}
            title="No pets added yet"
            description="Create a profile for your dog or cat to start tracking their health, medical records, and preventive care."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add your first pet
              </Button>
            }
          />
        </Card>
      ) : pets.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm text-ink-500">Fill out the form above to create your first pet profile.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Badge tone="sage">{pets.length} pet{pets.length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onDelete={handleDeletePet} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
