import { useEffect, useState } from 'react';
import { Card, EmptyState, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { Bell, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { usePreventiveCareTasks } from '@/hooks/usePreventiveCareTasks';
import { usePets } from '@/hooks/usePets';
import { PreventiveCareTaskCard } from '@/components/preventive/PreventiveCareTaskCard';

export function HealthAlertsPage() {
  const { tasks, loading, completeTask, deleteTask } = usePreventiveCareTasks();
  const { pets } = usePets();

  const overdueTasks = tasks.filter((t) => t.status === 'overdue');
  const upcomingTasks = tasks.filter((t) => {
    if (t.status !== 'pending') return false;
    const dueDate = new Date(t.due_date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });
  const completedTasks = tasks.filter((t) => t.status === 'completed').slice(0, 5);

  const handleComplete = async (taskId: string) => {
    const { error } = await completeTask(taskId);
    if (error) alert(`Failed to complete task: ${error}`);
  };

  const handleDelete = async (taskId: string) => {
    const { error } = await deleteTask(taskId);
    if (error) alert(`Failed to delete task: ${error}`);
  };

  return (
    <div>
      <PageHeader title="Health Alerts" subtitle="Reminders for upcoming vaccinations, treatments, and checkups." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: AlertTriangle, title: 'Urgent', desc: 'Overdue items', tone: 'red' as const, count: overdueTasks.length },
          { icon: Clock, title: 'Upcoming', desc: 'Due in the next 30 days', tone: 'amber' as const, count: upcomingTasks.length },
          { icon: CheckCircle2, title: 'Completed', desc: 'Recently resolved', tone: 'sage' as const, count: completedTasks.length },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                item.tone === 'red' ? 'bg-red-100 text-red-600' :
                item.tone === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-sage-100 text-sage-600'
              }`}>
                <item.icon className="h-5 w-5" />
              </div>
              <Badge tone={item.tone}>{item.count}</Badge>
            </div>
            <p className="font-semibold text-ink-900">{item.title}</p>
            <p className="text-sm text-ink-400">{item.desc}</p>
          </Card>
        ))}
      </div>

      {overdueTasks.length === 0 && upcomingTasks.length === 0 && completedTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No active health alerts"
            description="When you set up preventive care schedules for your pets, reminders will appear here when vaccinations or treatments are approaching their due date."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {overdueTasks.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink-900">Overdue</h2>
                <Badge tone="red">{overdueTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
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

          {upcomingTasks.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink-900">Upcoming (Next 30 Days)</h2>
                <Badge tone="amber">{upcomingTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
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
                <h2 className="text-lg font-semibold text-ink-900">Recently Completed</h2>
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
