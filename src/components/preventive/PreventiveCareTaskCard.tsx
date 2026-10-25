import { type PreventiveCareTask, type Pet } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { Shield, Calendar, CheckCircle2, Trash2, Syringe, Bug, Stethoscope, Heart } from 'lucide-react';

interface PreventiveCareTaskCardProps {
  task: PreventiveCareTask;
  pet?: Pet;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

const taskTypeConfig = {
  vaccination: { label: 'Vaccination', icon: Syringe, tone: 'sage' as const },
  deworming: { label: 'Deworming', icon: Bug, tone: 'amber' as const },
  checkup: { label: 'Checkup', icon: Stethoscope, tone: 'blue' as const },
  dental: { label: 'Dental', icon: Heart, tone: 'purple' as const },
  other: { label: 'Other', icon: Shield, tone: 'neutral' as const },
};

const statusConfig = {
  pending: { label: 'Pending', tone: 'amber' as const },
  completed: { label: 'Completed', tone: 'sage' as const },
  overdue: { label: 'Overdue', tone: 'red' as const },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function PreventiveCareTaskCard({ task, pet, onComplete, onDelete }: PreventiveCareTaskCardProps) {
  const typeConfig = taskTypeConfig[task.task_type];
  const statusConf = statusConfig[task.status];
  const Icon = typeConfig.icon;

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
                <h3 className="font-semibold text-ink-900">{task.title}</h3>
                <Badge tone={typeConfig.tone}>{typeConfig.label}</Badge>
                <Badge tone={statusConf.tone}>{statusConf.label}</Badge>
                {pet && <Badge tone="neutral">{pet.name}</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-ink-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Due {formatDate(task.due_date)}
                </span>
                {task.source === 'vet_recommended' && <span>Vet Recommended</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.status !== 'completed' && onComplete && (
              <Button size="sm" onClick={() => onComplete(task.id)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
              </Button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Delete this task? This cannot be undone.')) {
                    onDelete(task.id);
                  }
                }}
                className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {task.notes && (
          <div className="mt-4 border-t border-cream-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Notes</p>
            <p className="mt-1 text-sm text-ink-700 whitespace-pre-wrap">{task.notes}</p>
          </div>
        )}
        {task.completed_date && (
          <div className="mt-2 text-xs text-sage-600">
            Completed on {formatDate(task.completed_date)}
          </div>
        )}
      </div>
    </Card>
  );
}
