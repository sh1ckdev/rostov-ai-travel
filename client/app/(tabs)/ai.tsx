import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authStore } from '../../stores/authStore';

import AIAssistant from '@/components/AIAssistant';
import AIRoutePlanner from '@/components/AIRoutePlanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

const AIScreen = observer(() => {
  const router = useRouter();
  const [showAssistant, setShowAssistant] = useState(true);
  const { isDark } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace('/login');
    }
  }, [router]);

  const handleAIRecommendation = (recommendation: any) => {
    // На основе действия из ИИ открываем карту с параметрами
    if (recommendation.action === 'show_attractions' || recommendation.category === 'ATTRACTION') {
      router.push({ pathname: '/maps', params: { category: 'ATTRACTION' } });
    } else if (recommendation.action === 'show_restaurants' || recommendation.category === 'RESTAURANT') {
      router.push({ pathname: '/maps', params: { category: 'RESTAURANT' } });
    } else if (recommendation.action === 'view_details' && recommendation.id) {
      router.push({ pathname: '/maps', params: { selectedPOI: recommendation.id } });
    } else if (recommendation.action === 'create_route') {
      router.push({ pathname: '/maps', params: { action: 'create_route' } });
    } else {
      // По умолчанию открываем карты
      router.push('/maps');
    }
  };

  const handleAIRouteCreated = (route: any) => {
    // Передаем маршрут на карты
    try {
      const poiIds = (route?.pois || []).map((p: any) => p.id);
      router.push({ pathname: '/maps', params: { action: 'apply_route', poiIds: JSON.stringify(poiIds) } });
    } catch {
      router.push('/maps');
    }
  };

  const handleAIRouteSelect = (route: any) => {
    handleAIRouteCreated(route);
  };

  if (!authStore.isAuth) return null;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5' }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#333' }]}>{t('ai.title')}</Text>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segmentBtn, { backgroundColor: isDark ? '#3a3a3a' : '#fff', borderColor: '#007AFF' }, showAssistant && styles.segmentBtnActive]}
            onPress={() => setShowAssistant(true)}
          >
            <IconSymbol name="text.bubble" size={16} color={showAssistant ? '#fff' : '#007AFF'} />
            <Text style={[styles.segmentText, { color: showAssistant ? '#fff' : '#007AFF' }, showAssistant && styles.segmentTextActive]}>
              {t('ai.title')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, { backgroundColor: isDark ? '#3a3a3a' : '#fff', borderColor: '#007AFF' }, !showAssistant && styles.segmentBtnActive]}
            onPress={() => setShowAssistant(false)}
          >
            <IconSymbol name="sparkles" size={16} color={!showAssistant ? '#fff' : '#007AFF'} />
            <Text style={[styles.segmentText, { color: !showAssistant ? '#fff' : '#007AFF' }, !showAssistant && styles.segmentTextActive]}>
              {t('ai.planRoute')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {showAssistant ? (
          <AIAssistant
            onRecommendationPress={handleAIRecommendation}
            onRouteCreate={handleAIRouteCreated}
            fullScreen
          />
        ) : (
          <AIRoutePlanner
            onRouteCreated={handleAIRouteCreated}
            onRouteSelect={handleAIRouteSelect}
            fullScreen
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  body: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold' },
  segment: { flexDirection: 'row', gap: 8, marginTop: 12 },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  segmentBtnActive: { backgroundColor: '#007AFF' },
  segmentText: { fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'stretch', justifyContent: 'flex-start' },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AIScreen;


