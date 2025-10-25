import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';

interface AuthRedirectGuardProps {
  children: React.ReactNode;
}

const AuthRedirectGuard = observer(({ children }: AuthRedirectGuardProps) => {
  const router = useRouter();

  useEffect(() => {
    if (authStore.isInitialized && authStore.isAuth) {
      router.replace('/(tabs)');
    }
  }, [authStore.isAuth, authStore.isInitialized]);

  if (!authStore.isInitialized || authStore.isCheckingAuth) {
    return null; // Показываем загрузку в _layout.tsx
  }

  if (authStore.isAuth) {
    return null; // Перенаправляем на главную страницу
  }

  return <>{children}</>;
});

export default AuthRedirectGuard;
