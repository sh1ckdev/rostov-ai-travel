import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = observer(({ children }: AuthGuardProps) => {
  const router = useRouter();

  useEffect(() => {
    if (authStore.isInitialized && !authStore.isAuth) {
      router.replace('/login');
    }
  }, [authStore.isAuth, authStore.isInitialized]);

  if (!authStore.isInitialized || authStore.isCheckingAuth) {
    return null; // Показываем загрузку в _layout.tsx
  }

  if (!authStore.isAuth) {
    return null; // Перенаправляем на логин
  }

  return <>{children}</>;
});

export default AuthGuard;
