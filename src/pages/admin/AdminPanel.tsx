import { FC, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminShell, ShellItem } from '@ui/AdminShell';
import { logout } from '../../services/auth/auth.service';
import { fetchBookings } from '../../services/booking/booking.admin.api';
import type { AdminShellContext } from './adminShell';

const SECTIONS: ShellItem[] = [
  { key: 'bookings', label: 'Reserves', icon: 'calendar' },
  { key: 'sessions', label: 'Sessions', icon: 'sessions' },
  { key: 'schedule', label: 'Horaris', icon: 'schedule' },
  { key: 'blocked', label: 'Dies bloquejats', icon: 'block' },
  { key: 'weddings', label: 'Casaments', icon: 'weddings' },
];

export const AdminPanel: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pending, setPending] = useState(0);

  // Requests waiting for review: the one number worth seeing from any section. A failure only
  // hides the badge; the bookings section reports its own load errors.
  const refreshPending = useCallback(() => {
    fetchBookings({ status: 'Requested' })
      .then((list) => setPending(list.length))
      .catch(() => setPending(0));
  }, []);

  useEffect(refreshPending, [refreshPending]);

  const active = pathname.split('/')[2] ?? 'bookings';

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const outletContext: AdminShellContext = { refreshPending };

  return (
    <AdminShell
      brandTitle="Gestió"
      brandCaption="Panell d'administració"
      items={SECTIONS.map((s) => (s.key === 'bookings' ? { ...s, badge: pending } : s))}
      activeKey={active}
      onSelect={(key) => navigate(`/admin/${key}`)}
      onLogout={handleLogout}
      outletContext={outletContext}
    />
  );
};
