import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardHeader, CardBody, Input, Button, Badge, Spinner } from '@/components/ui';
import { Toggle } from '@/components/ui/Toggle';
import { AlertBanner, ErrorState } from '@/components/ui/Alert';
import { PageHeader } from '@/components/common/PageHeader';
import {
  User,
  Bell,
  Shield,
  LogOut,
  Mail,
  Lock,
  Save,
  CheckCircle2,
  BellOff,
  Info,
  Trash2,
  CheckCheck,
} from 'lucide-react';

export function AccountSettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { preferences, loading, error, saving, saveError, saveSuccess, updatePreferences } =
    useUserPreferences();
  const { notifications, loading: notifLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const [displayName, setDisplayName] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    if (preferences.display_name !== null) {
      setDisplayName(preferences.display_name);
    }
  }, [preferences.display_name]);

  const handleSaveProfile = useCallback(async () => {
    setProfileError('');
    setProfileSaved(false);
    setSavingProfile(true);

    const success = await updatePreferences({
      display_name: displayName.trim() || null,
    });

    setSavingProfile(false);
    if (success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileError('Failed to save profile. Please try again.');
    }
  }, [displayName, updatePreferences]);

  const handleToggle = useCallback(
    (field: 'email_alerts' | 'in_app_notifications' | 'weekly_summary', value: boolean) => {
      updatePreferences({ [field]: value });
    },
    [updatePreferences]
  );

  async function handleSignOut() {
    setSignOutError('');
    try {
      await signOut();
      navigate('/');
    } catch {
      setSignOutError('Failed to sign out. Please try again.');
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Account Settings" subtitle="Manage your profile, notification preferences, and privacy." />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Account Settings" subtitle="Manage your profile, notification preferences, and privacy." />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const email = user?.email ?? '';
  const initials = email.charAt(0).toUpperCase() || '?';

  return (
    <div>
      <PageHeader title="Account Settings" subtitle="Manage your profile, notification preferences, and privacy." />

      {saveError && (
        <div className="mb-4">
          <AlertBanner type="error" message={saveError} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader title="Profile" subtitle="Your account information" icon={<User className="h-5 w-5" />} />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-cream-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sm font-semibold text-sage-700">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-800">{email}</p>
                <p className="text-xs text-ink-400">Email registered with your account</p>
              </div>
            </div>
            <Input
              id="display-name"
              label="Display name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setProfileSaved(false);
                setProfileError('');
              }}
            />
            {profileError && <AlertBanner type="error" message={profileError} />}
            {profileSaved && (
              <AlertBanner type="success" message="Profile saved successfully." />
            )}
            <Button onClick={handleSaveProfile} disabled={savingProfile || displayName === (preferences.display_name ?? '')}>
              {savingProfile ? (
                <>
                  <Spinner size="sm" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save changes
                </>
              )}
            </Button>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader
            title="Notifications"
            subtitle="How you receive alerts"
            icon={<Bell className="h-5 w-5" />}
          />
          <CardBody className="space-y-4">
            {/* Email alerts */}
            <div className="flex items-center justify-between rounded-xl border border-cream-200 p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-800">Email alerts</p>
                <p className="text-xs text-ink-400">Vaccination & care reminders sent to your email</p>
              </div>
              <Toggle
                checked={preferences.email_alerts}
                onChange={(v) => handleToggle('email_alerts', v)}
                disabled={saving}
                label="Email alerts"
              />
            </div>
            {preferences.email_alerts && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Preference saved. Email delivery is not yet configured — no email provider
                  credentials or scheduled sending job have been set up. You will not receive email
                  alerts until an email service (e.g. Resend, SendGrid) is connected and a scheduled
                  job is deployed. In-app notifications are fully functional.
                </p>
              </div>
            )}

            {/* In-app notifications */}
            <div className="flex items-center justify-between rounded-xl border border-cream-200 p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-800">In-app notifications</p>
                <p className="text-xs text-ink-400">Alerts within the dashboard</p>
              </div>
              <Toggle
                checked={preferences.in_app_notifications}
                onChange={(v) => handleToggle('in_app_notifications', v)}
                disabled={saving}
                label="In-app notifications"
              />
            </div>

            {/* Weekly summary */}
            <div className="flex items-center justify-between rounded-xl border border-cream-200 p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-800">Weekly summary</p>
                <p className="text-xs text-ink-400">Pet health digest every Sunday</p>
              </div>
              <Toggle
                checked={preferences.weekly_summary}
                onChange={(v) => handleToggle('weekly_summary', v)}
                disabled={saving}
                label="Weekly summary"
              />
            </div>
            {preferences.weekly_summary && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Preference saved. Weekly summaries are not yet being sent — this requires an email
                  provider and a scheduled job (cron) to be configured. No emails will be delivered
                  until that infrastructure is in place.
                </p>
              </div>
            )}

            {saveSuccess && (
              <AlertBanner type="success" message="Notification preferences saved." />
            )}
          </CardBody>
        </Card>

        {/* In-app notification center */}
        {preferences.in_app_notifications && (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recent In-App Notifications"
              subtitle={`${notifications.filter((n) => !n.is_read).length} unread`}
              icon={<Bell className="h-5 w-5" />}
              action={
                notifications.some((n) => !n.is_read) ? (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </Button>
                ) : undefined
              }
            />
            <CardBody>
              {notifLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BellOff className="mb-3 h-8 w-8 text-ink-300" />
                  <p className="text-sm text-ink-400">
                    No notifications yet. Care reminders and health alerts will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                        notif.is_read ? 'border-cream-200 bg-white' : 'border-sage-200 bg-sage-50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          notif.type === 'health_alert'
                            ? 'bg-red-100 text-red-600'
                            : notif.type === 'care_reminder'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-sage-100 text-sage-600'
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900">{notif.title}</p>
                        <p className="text-xs text-ink-500">{notif.message}</p>
                        <p className="mt-1 text-xs text-ink-400">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-sage-100 hover:text-sage-600"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Privacy & Data */}
        <Card>
          <CardHeader
            title="Privacy & Data"
            subtitle="Your data belongs to you"
            icon={<Shield className="h-5 w-5" />}
          />
          <CardBody className="space-y-4">
            <div className="rounded-xl bg-cream-50 p-4">
              <p className="text-sm text-ink-600">
                PAWCARE stores your pet data securely. Your settings and preferences are private to
                your account and enforced by database-level access controls — other users cannot
                see or modify them.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <CheckCircle2 className="h-4 w-4 text-sage-500" />
                Preferences are saved to your private database record
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <CheckCircle2 className="h-4 w-4 text-sage-500" />
                Row-level security prevents other users from accessing your data
              </div>
            </div>
            <div className="border-t border-cream-200 pt-4">
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Data export and deletion tools are not yet implemented.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Authentication — connected to existing auth */}
        <Card>
          <CardHeader
            title="Authentication"
            subtitle="Your sign-in session"
            icon={<Lock className="h-5 w-5" />}
          />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-cream-200 p-3">
              <Mail className="h-5 w-5 text-ink-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-800">{email}</p>
                <p className="text-xs text-ink-400">Signed in with email & password</p>
              </div>
              <Badge tone="sage">Active</Badge>
            </div>
            {signOutError && <AlertBanner type="error" message={signOutError} />}
            <Button variant="danger" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
            <p className="text-xs text-ink-400">
              After signing out, you can sign back in with your email and password. Your pet data
              and preferences will be restored when you sign in again.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
