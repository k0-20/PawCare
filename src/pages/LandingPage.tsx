import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  PawPrint,
  HeartPulse,
  Shield,
  Bell,
  FileText,
  MapPin,
  ArrowRight,
  Check,
  Cat,
  Dog,
  Stethoscope,
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();
  const dashboardPath = user ? '/app/dashboard' : '/auth';

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-cream-200 bg-cream-50/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-600 text-white">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink-900">PAWCARE</h1>
              <p className="text-xs text-ink-400">Pet Health Manager</p>
            </div>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <a href="#features" className="btn-ghost">Features</a>
            <a href="#how-it-works" className="btn-ghost">How it works</a>
            <a href="#about" className="btn-ghost">About</a>
          </div>
          <Link to={dashboardPath} className="btn-primary">
            {user ? 'Open Dashboard' : 'Get Started'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-slide-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-1.5 text-sm font-medium text-sage-700">
                <HeartPulse className="h-4 w-4" />
                AI-assisted preventive care for dogs and cats
              </div>
              <h1 className="text-4xl font-bold leading-tight text-ink-900 lg:text-5xl">
                Your pet's health,
                <span className="text-sage-600"> organized and proactive</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-ink-500">
                PAWCARE helps pet owners track medical records, stay on top of preventive care
                schedules, and keep all veterinary information in one warm, friendly place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={dashboardPath} className="btn-primary btn-lg">
                  {user ? 'Add Your Pet' : 'Get Started'} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to={dashboardPath} className="btn-secondary btn-lg">
                  Explore Dashboard
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-ink-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sage-500" />
                  No diagnosis claims
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sage-500" />
                  Owner-controlled data
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <img
                src="https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="A cat cuddling a dog on green grass"
                className="w-full rounded-3xl object-cover shadow-lift"
                style={{ aspectRatio: '4/3' }}
              />
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-cream-200 bg-white p-4 shadow-card sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Preventive Care</p>
                    <p className="text-xs text-ink-400">Vaccines & checkups tracked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-cream-200 bg-cream-50 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-ink-900">Everything in one place</h2>
            <p className="mt-3 text-lg text-ink-500">
              From vet visits to vaccination reminders — PAWCARE keeps your pet's health organized.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Cat, title: 'Pet Profiles', desc: 'Create detailed profiles for each dog or cat with breed, weight, microchip, and more.' },
              { icon: FileText, title: 'Medical Records', desc: 'Log vet visits, diagnoses, treatments, and prescriptions in a structured timeline.' },
              { icon: Shield, title: 'Preventive Care', desc: 'Track vaccinations, deworming, and annual checkups with due-date reminders.' },
              { icon: Bell, title: 'Health Alerts', desc: 'Get notified when vaccinations or preventive treatments are approaching their due date.' },
              { icon: MapPin, title: 'Veterinary Clinics', desc: 'Keep contact details for your trusted vets and find nearby clinics when you need them.' },
              { icon: Stethoscope, title: 'AI-Assisted Insights', desc: 'Future feature — structured summaries to support conversations with your veterinarian.' },
            ].map((feature) => (
              <div key={feature.title} className="card-base card-hover p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-ink-900">How it works</h2>
            <p className="mt-3 text-lg text-ink-500">Three simple steps to start managing your pet's health.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: Cat, title: 'Create a pet profile', desc: 'Add your dog or cat with breed, age, weight, and health details.' },
              { step: '02', icon: FileText, title: 'Log medical history', desc: 'Record past vet visits, vaccinations, and treatments in one timeline.' },
              { step: '03', icon: Bell, title: 'Stay on schedule', desc: 'Receive reminders for upcoming preventive care and checkups.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-600 text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold text-cream-300">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pet types */}
      <section className="bg-sage-700 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                <Dog className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold text-white">For dogs & cats</h2>
              <p className="mt-4 text-lg text-sage-100">
                PAWCARE supports both canine and feline companions with species-specific fields,
                vaccination schedules, and care tracking. Whether you have a playful Golden Retriever
                or a cozy tabby cat, we've got you covered.
              </p>
              <Link
                to={dashboardPath}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-sage-700 transition-all hover:bg-sage-50"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/7643253/pexels-photo-7643253.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Golden retriever puppy"
                className="w-full rounded-2xl object-cover shadow-lift"
                style={{ aspectRatio: '3/4' }}
              />
              <img
                src="https://images.pexels.com/photos/30001432/pexels-photo-30001432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Ginger cat resting"
                className="mt-8 w-full rounded-2xl object-cover shadow-lift"
                style={{ aspectRatio: '3/4' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About / disclaimer */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
              <PawPrint className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-ink-900">Built with care, backed by transparency</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-500">
            PAWCARE is a college project exploring how technology can support proactive pet health
            management. It does not provide medical diagnosis, medication recommendations, or
            unreviewed clinical rules. All sample data shown is clearly labelled as illustrative.
            Always consult a licensed veterinarian for your pet's medical needs.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-200 bg-cream-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600 text-white">
              <PawPrint className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-ink-700">PAWCARE</span>
          </div>
          <p className="text-xs text-ink-400">
            College CSE AIML Project — Foundation build. Not a medical device. Always consult your veterinarian.
          </p>
        </div>
      </footer>
    </div>
  );
}
