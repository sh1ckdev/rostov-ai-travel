import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { AIHotelService, AISession } from '../services/AIHotelService';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

interface AISessionManagerProps {
  visible: boolean;
  onClose: () => void;
  onSessionSelect: (session: AISession) => void;
  currentSession?: AISession | null;
}

const AISessionManager: React.FC<AISessionManagerProps> = ({
  visible,
  onClose,
  onSessionSelect,
  currentSession
}) => {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  const loadSessions = () => {
    const sessionHistory = AIHotelService.getSessionHistory();
    setSessions(sessionHistory);
  };

  const handleCreateNewSession = async () => {
    try {
      setIsLoading(true);
      const newSession = await AIHotelService.initializeSession('Таганрог');
      setSessions(prev => [newSession, ...prev]);
      onSessionSelect(newSession);
      onClose();
    } catch (error: any) {
      Alert.alert('Ошибка', 'Не удалось создать новую сессию. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = (session: AISession) => {
    onSessionSelect(session);
    onClose();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Удалить сессию',
      'Вы уверены, что хотите удалить эту сессию? История чата будет потеряна.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
            if (currentSession?.sessionId === sessionId) {
              AIHotelService.endCurrentSession();
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStatus = (session: AISession) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - session.lastActivity.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return { text: 'Активна', color: '#4ECDC4' };
    if (diffMinutes < 60) return { text: `${diffMinutes} мин назад`, color: '#FFE66D' };
    if (diffMinutes < 1440) return { text: `${Math.floor(diffMinutes / 60)} ч назад`, color: '#FF6B6B' };
    return { text: 'Неактивна', color: '#999' };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF' }]}>
          <View style={styles.headerLeft}>
            <IconSymbol name="brain.head.profile" size={24} color="#007AFF" />
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#333' }]}>
              Управление сессиями ИИ
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: isDark ? '#3a3a3a' : '#F8F9FA' }]} 
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={20} color={isDark ? '#ffffff' : '#666'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.newSessionButton, { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF' }]}
            onPress={handleCreateNewSession}
            disabled={isLoading}
          >
            <IconSymbol name="plus" size={20} color="#007AFF" />
            <Text style={[styles.newSessionText, { color: isDark ? '#ffffff' : '#333' }]}>
              {isLoading ? 'Создание...' : 'Создать новую сессию'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#333' }]}>
            История сессий ({sessions.length})
          </Text>

          <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="brain.head.profile" size={48} color="#999" />
                <Text style={[styles.emptyStateText, { color: isDark ? '#cccccc' : '#666' }]}>
                  Нет сохраненных сессий
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: isDark ? '#999' : '#999' }]}>
                  Создайте новую сессию для начала общения с ИИ
                </Text>
              </View>
            ) : (
              sessions.map((session) => {
                const status = getSessionStatus(session);
                const isCurrent = currentSession?.sessionId === session.sessionId;
                
                return (
                  <TouchableOpacity
                    key={session.sessionId}
                    style={[
                      styles.sessionItem,
                      { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF' },
                      isCurrent && styles.currentSessionItem
                    ]}
                    onPress={() => handleSelectSession(session)}
                  >
                    <View style={styles.sessionHeader}>
                      <View style={styles.sessionInfo}>
                        <View style={styles.sessionTitleRow}>
                          <Text style={[styles.sessionTitle, { color: isDark ? '#ffffff' : '#333' }]}>
                            Сессия {session.sessionId.slice(0, 8)}...
                          </Text>
                          {isCurrent && (
                            <View style={styles.currentBadge}>
                              <Text style={styles.currentBadgeText}>Текущая</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.sessionLocation, { color: isDark ? '#cccccc' : '#666' }]}>
                          📍 {session.location}
                        </Text>
                        <Text style={[styles.sessionDate, { color: isDark ? '#999' : '#999' }]}>
                          Создана: {formatDate(session.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.sessionActions}>
                        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                          <Text style={[styles.statusText, { color: status.color }]}>
                            {status.text}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.deleteButton, { backgroundColor: isDark ? '#3a3a3a' : '#F8F9FA' }]}
                          onPress={() => handleDeleteSession(session.sessionId)}
                        >
                          <IconSymbol name="trash" size={16} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.sessionStats}>
                      <View style={styles.statItem}>
                        <IconSymbol name="text.bubble" size={14} color="#007AFF" />
                        <Text style={[styles.statText, { color: isDark ? '#cccccc' : '#666' }]}>
                          {session.messageCount} сообщений
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <IconSymbol name="clock" size={14} color="#4ECDC4" />
                        <Text style={[styles.statText, { color: isDark ? '#cccccc' : '#666' }]}>
                          {formatDate(session.lastActivity)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 24,
    gap: 8,
  },
  newSessionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sessionsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  currentSessionItem: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  sessionLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});

export default AISessionManager;
