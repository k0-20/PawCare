import { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, EmptyState, AlertBanner, LoadingOverlay, ErrorState, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { Shield, Plus, Syringe, Bug, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui';
import { usePreventiveCareTasks } from '@/hooks/usePreventiveCareTasks';
import { usePets } from '@/hooks/usePets';
import { PreventiveCareTaskForm } from '@/components/preventive/PreventiveCareTaskForm';
import { PreventiveCareTaskCard } from '@/components/preventive/PreventiveCareTaskCard';
import { type PreventiveCareTaskFormData } from '@/types';

export function PreventiveCarePage() {
  const { tasks, loading, error, addTask, completeTask, deleteTask, fetchTasks } = usePreventiveCareTasks();
  const { pets } = usePets();
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddTask = useCallback(
    async (data: PreventiveCareTaskFormData) => {
      const { error: addError } = await addTask(data);
      if (addError) throw new Error(addError);

      setShowForm(false);
      setSuccessMessage('Preventive care task has been added successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    [addTask]
  );

  const handleComplete = useCallback(
    async (taskId: string) => {
      const { error: completeError } = await completeTask(taskId);
      if (completeError) {
        alert(`Failed to complete task: ${completeError}`);
      }
    },
    [completeTask]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      const { error: deleteError } = await deleteTask(taskId);
      if (deleteError) {
        alert(`Failed to delete task: ${deleteError}`);
      }
    },
    [deleteTask]
  );

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div>
      <PageHeader title="Preventive Care" subtitle="Track vaccinations, deworming, and routine checkups with due-date reminders.">
        <Button onClick={() => setShowForm(!showForm)} disabled={pets.length === 0}>
          {showForm ? (
            'Cancel'
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Schedule
            </>
          )}
        </Button>
      </PageHeader>

      {pets.length === 0 && !showForm && (
        <div className="mb-4">
          <AlertBanner type="info" message="Add a pet first before creating preventive care tasks." />
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
            title="Add Preventive Care Task"
            subtitle="Schedule vaccinations, deworming, checkups, and more."
            icon={<Shield className="h-5 w-5" />}
          />
          <CardBody>
            <PreventiveCareTaskForm pets={pets} onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />
          </CardBody>
        </Card>
      )}

      {loading ? (
        <LoadingOverlay message="Loading preventive care tasksâ€¦" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasks} />
      ) : tasks.length === 0 && !showForm ? (
        <Card>
          <EmptyState
            icon={Shield}
            title="No preventive care schedules yet"
            description={
              pets.length === 0
                ? 'Add a pet first, then you can set up vaccination, deworming, and checkup schedules.'
                : 'Set up vaccination, deworming, and annual checkup schedules for your pets. Track due dates and mark tasks as complete.'
            }
            action={
              pets.length > 0 ? (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" /> Add your first task
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink-900">Pending & Overdue</h2>
                <Badge tone="amber">{pendingTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <PreventiveCareTaskCard
                    key={task.id}
                    task={task}
                    pet={pets.find((p) => p.id === task.pet_id)}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink-900">Completed</h2>
                <Badge tone="sage">{completedTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <PreventiveCareTaskCard
                    key={task.id}
                    task={task}
                    pet={pets.find((p) => p.id === task.pet_id)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
