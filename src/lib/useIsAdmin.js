import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// undefined while checking, then true or false.
export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(undefined);
  useEffect(() => {
    let cancelled = false;
    base44.auth
      .me()
      .then((user) => !cancelled && setIsAdmin(user?.role === 'admin'))
      .catch(() => !cancelled && setIsAdmin(false));
    return () => {
      cancelled = true;
    };
  }, []);
  return isAdmin;
}
