import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cat,
  Shield,
  Bell,
  FileText,
  Calendar,
  ArrowRight,
  Stethoscope,
  Activity,
  AlertTriangle,
  Dog,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { usePets } from '@/hooks/usePets';
import { usePreventiveCareTasks } from '@/hooks/usePreventiveCareTasks';

function petAgeLabel(birthDate: string | null): string {
  if (!birthDate) return 'Age unknown';
  const years = (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 1) return `${Math.floor(years * 12)} months`;
  return `${Math.floor(years)} year${Math.floor(years) !== 1 ? 's' : ''}`;
}

function formatDueDate(dateStr: string): string {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`;
  return new Date(dateStr).toLocaleDateString();
}

export function DashboardPage() {
  const { pets, loading: petsLoading } = usePets();
  const { tasks, loading: tasksLoading, checkAndGenerateNotifications } = usePreventiveCareTasks();

  useEffect(() => {
    if (tasks.length > 0) {
      checkAndGenerateNotifications();
    }
  }, [tasks, checkAndGenerateNotifications]);

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  const overdueCount = tasks.filter(
    (t) => t.status !== 'completed' && new Date(t.due_date) < new Date()
  ).length;

  const upcomingCount = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const days = Math.ceil((new Date(t.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  const loading = petsLoading || tasksLoading;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={loading ? 'Loading your pets\u2019 health overview\u2026' : 'Overview of your pets\u2019 health and upcoming care.'}
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Registered Pets', value: String(pets.length), icon: pets.length > 0 ? Dog : Cat, tone: 'sage' as const, hint: pets.length === 0 ? 'Add your first pet' : `${pets.filter((p) => p.species === 'dog').length} dog\u00b7${pets.filter((p) => p.species === 'cat').length} cat` },
          { label: 'Upcoming Care', value: String(upcomingCount), icon: Calendar, tone: 'amber' as const, hint: 'Next 30 days' },
          { label: 'Overdue', value: String(overdueCount), icon: Bell, tone: 'red' as const, hint: overdueCount === 0 ? 'All on track' : 'Needs attention' },
          { label: 'Total Tasks', value: String(tasks.length), icon: FileText, tone: 'blue' as const, hint: `${tasks.filter((t) => t.status === 'completed').length} completed` },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-ink-900">{stat.value}</p>
                <p className="mt-1 text-xs text-ink-400">{stat.hint}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  stat.tone === 'sage'
                    ? 'bg-sage-100 text-sage-600'
                    : stat.tone === 'amber'
                    ? 'bg-amber-100 text-amber-600'
                    : stat.tone === 'red'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pets overview */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="My Pets"
            subtitle="Quick health status overview"
            icon={<Cat className="h-5 w-5" />}
            action={
              <Link to="/app/pets" className="btn-ghost text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {pets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Cat className="mb-2 h-8 w-8 text-ink-300" />
                <p className="text-sm text-ink-400">No pets added yet.</p>
                <Link to="/app/pets" className="mt-2 text-xs font-medium text-sage-600 hover:text-sage-700">
                  Add your first pet <ArrowRight className="inline h-3 w-3" />
                </Link>
              </div>
            ) : (
              pets.map((pet) => {
                const petTasks = tasks.filter((t) => t.pet_id === pet.id && t.status !== 'completed');
                const hasOverdue = petTasks.some((t) => new Date(t.due_date) < new Date());
                const hasUpcoming = petTasks.some((t) => {
                  const days = Math.ceil((new Date(t.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return days >= 0 && days <= 30;
                });
                const statusTone = hasOverdue ? 'red' as const : hasUpcoming ? 'amber' as const : 'sage' as const;
                const statusLabel = hasOverdue ? 'Action needed' : hasUpcoming ? 'Care due' : 'Up to date';
                return (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between rounded-xl border border-cream-200 p-4 transition-colors hover:bg-cream-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
                        {pet.species === 'dog' ? <Dog className="h-6 w-6" /> : <Cat className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{pet.name}</p>
                        <p className="text-sm text-ink-400">
                          {pet.breed ?? pet.species} {'\u00b7'} {petAgeLabel(pet.birth_date)}
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusTone}>{statusLabel}</Badge>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Upcoming care */}
        <Card>
          <CardHeader
            title="Upcoming Care"
            subtitle="Next 30 days"
            icon={<Calendar className="h-5 w-5" />}
          />
          <CardBody className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-2 h-8 w-8 text-ink-300" />
                <p className="text-sm text-ink-400">No upcoming care tasks.</p>
                <Link to="/app/preventive-care" className="mt-2 text-xs font-medium text-sage-600 hover:text-sage-700">
                  Set up care schedules <ArrowRight className="inline h-3 w-3" />
                </Link>
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const pet = pets.find((p) => p.id === task.pet_id);
                const days = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isOverdue = days < 0;
                const isHigh = isOverdue || days <= 7;
                return (
                  <div key={task.id} className="rounded-xl border border-cream-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-900">{task.title}</p>
                      {isHigh && (
                        <AlertTriangle className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-ink-400">{pet?.name ?? 'Unknown pet'}</span>
                      <Badge tone={isOverdue ? 'red' : isHigh ? 'amber' : 'neutral'}>
                        {formatDueDate(task.due_date)}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: FileText, label: 'Medical Records', path: '/app/medical-records', desc: 'View history' },
          { icon: Shield, label: 'Preventive Care', path: '/app/preventive-care', desc: 'Track schedules' },
          { icon: Bell, label: 'Health Alerts', path: '/app/health-alerts', desc: 'Check reminders' },
          { icon: Stethoscope, label: 'Find a Vet', path: '/app/clinics', desc: 'Clinic directory' },
        ].map((action) => (
          <Link key={action.label} to={action.path}>
            <Card hover className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-ink-900">{action.label}</p>
              <p className="text-sm text-ink-400">{action.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty state notice */}
      {pets.length === 0 && tasks.length === 0 && (
        <div className="mt-8 flex items-center gap-2 rounded-xl bg-cream-200 px-4 py-3">
          <Activity className="h-4 w-4 shrink-0 text-ink-400" />
          <p className="text-xs text-ink-500">
            Add your real pets in the My Pets page to start tracking their health and care schedules.
          </p>
        </div>
      )}
    </div>
  );
}
