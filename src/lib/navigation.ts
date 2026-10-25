import { LayoutDashboard, Cat, FileText, Shield, Bell, MapPin, PawPrint } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Pets', path: '/app/pets', icon: Cat },
  { label: 'Medical Records', path: '/app/medical-records', icon: FileText },
  { label: 'Preventive Care', path: '/app/preventive-care', icon: Shield },
  { label: 'Health Alerts', path: '/app/health-alerts', icon: Bell },
  { label: 'Veterinary Clinics', path: '/app/clinics', icon: MapPin },
];
