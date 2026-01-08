type IconMap = Record<string, string>;

export type IconName =
  | 'dashboard'
  | 'community'
  | 'test'
  | 'patients'
  | 'analytics'
  | 'users'
  | 'profile'
  | 'notifications'
  | 'logout';

const ICONS: IconMap = {
  dashboard: '/icons/dashboard-square-01.svg',
  community: '/icons/user-group-02.svg',
  test: '/icons/medical-file.svg',
  patients: '/icons/patient.svg',
  analytics: '/icons/analytics-01.svg',
  users: '/icons/user-multiple-03.svg',
  profile: '/icons/patient.svg',
  notifications: '/icons/notification-01.svg',
  logout: '/icons/logout-square-01.svg',
};

type Props = {
  readonly name: IconName;
  readonly size?: number;
  readonly className?: string;
  readonly alt?: string;
};

import Image from 'next/image';

export default function Icon({ name, size = 24, className, alt = '' }: Props) {
  const src = ICONS[name];
  return <Image src={src} width={size} height={size} className={className} alt={alt} />;
}
