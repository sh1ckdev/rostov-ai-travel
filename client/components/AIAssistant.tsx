import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { AIHotelService, ChatMessage, AIRecommendation, AISession } from '../services/AIHotelService';
import AISessionManager from './AISessionManager';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

interface AIAssistantProps {
  onRecommendationPress?: (recommendation: AIRecommendation) => void;
  onRouteCreate?: (routeData: any) => void;
  onClose?: () => void;
  fullScreen?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  onRecommendationPress,
  onRouteCreate,
  onClose,
  fullScreen = false,
}) => {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentSession, setCurrentSession] = useState<AISession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Инициализация чата
  const initializeChat = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      console.log('🚀 Инициализация AI чата...');
      
      // Инициализируем новую сессию с ИИ
      const session = await AIHotelService.initializeSession('Таганрог');
      setCurrentSession(session);
      setIsInitialized(true);
      
      // Создаем приветственное сообщение
      const welcomeMessage = AIHotelService.createWelcomeMessage(session);
      setMessages([welcomeMessage]);
      
      console.log('✅ AI чат инициализирован успешно');
    } catch (error: any) {
      console.error('❌ Ошибка инициализации чата:', error);
      setConnectionError(error.message || 'Ошибка подключения к ИИ');
      
      // Fallback - показываем приветственное сообщение без AI
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: 'Привет! Я ваш AI-помощник по туризму в Таганроге. К сожалению, сейчас есть проблемы с подключением к серверу, но я все равно могу помочь с базовой информацией.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Если чат не инициализирован, инициализируем его
    if (!isInitialized || !currentSession) {
      await initializeChat();
      if (!currentSession) {
        Alert.alert('Ошибка', 'Не удалось инициализировать чат. Попробуйте еще раз.');
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      sessionId: currentSession?.sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      console.log('📤 Отправка сообщения:', messageText);
      
      // Отправляем сообщение через AI сервис
      const aiResponse = await AIHotelService.sendMessage(messageText);
      
      setMessages(prev => [...prev, aiResponse]);
      console.log('✅ Получен ответ от ИИ');
    } catch (error: any) {
      console.error('❌ Ошибка отправки сообщения:', error);
      
      // Добавляем сообщение об ошибке
      const errorMessage = AIHotelService.createErrorMessage(error.message || 'Неизвестная ошибка');
      setMessages(prev => [...prev, errorMessage]);
      
      // Показываем уведомление пользователю
      Alert.alert(
        'Ошибка', 
        'Не удалось отправить сообщение. Проверьте подключение к интернету и попробуйте еще раз.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Перезапустить', style: 'destructive', onPress: () => {
            setIsInitialized(false);
            setCurrentSession(null);
            setMessages([]);
            initializeChat();
          }}
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };


  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSessionSelect = async (session: AISession) => {
    try {
      setCurrentSession(session);
      setIsInitialized(true);
      setConnectionError(null);
      
      // Загружаем историю чата для выбранной сессии
      const history = await AIHotelService.getChatHistory(session.sessionId);
      setMessages(history);
      
      console.log('✅ Переключение на сессию:', session.sessionId);
    } catch (error: any) {
      console.error('❌ Ошибка переключения сессии:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить историю сессии.');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '00:00';
      }
      return dateObj.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Ошибка форматирования времени:', error);
      return '00:00';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[
        styles.container, 
        fullScreen && styles.containerFull,
        { backgroundColor: isDark ? '#1a1a1a' : '#F8F9FA' }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 140}
    >
      <View style={[styles.header, { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF', borderBottomColor: isDark ? '#3a3a3a' : '#E9ECEF' }]}>
        <View style={styles.headerLeft}>
          <IconSymbol 
            name="brain.head.profile" 
            size={24} 
            color={connectionError ? '#FF6B6B' : (currentSession ? '#4ECDC4' : '#007AFF')} 
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#333' }]}>{t('ai.title')}</Text>
            {connectionError && (
              <Text style={[styles.headerSubtitle, { color: '#FF6B6B' }]}>Офлайн режим</Text>
            )}
            {currentSession && !connectionError && (
              <Text style={[styles.headerSubtitle, { color: isDark ? '#cccccc' : '#666' }]}>
                Сессия: {currentSession.sessionId.slice(0, 8)}...
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.sessionButton, { backgroundColor: isDark ? '#3a3a3a' : '#F8F9FA' }]} 
            onPress={() => setShowSessionManager(true)}
          >
            <IconSymbol name="list.bullet" size={16} color="#007AFF" />
          </TouchableOpacity>
          {connectionError && (
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: isDark ? '#3a3a3a' : '#F8F9FA' }]} 
              onPress={() => {
                setIsInitialized(false);
                setCurrentSession(null);
                setMessages([]);
                setConnectionError(null);
                initializeChat();
              }}
            >
              <IconSymbol name="arrow.clockwise" size={16} color="#007AFF" />
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: isDark ? '#3a3a3a' : '#F8F9FA' }]} onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={isDark ? '#ffffff' : '#666'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View key={message.id} style={styles.messageContainer}>
            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={styles.messageTime}>
                {formatTime(message.timestamp)}
              </Text>
            </View>

          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <IconSymbol name="arrow.clockwise" size={16} color="#007AFF" />
            <Text style={styles.loadingText}>AI думает...</Text>
          </View>
        )}

        {/* Кнопка для получения рекомендаций отелей */}
        {currentSession && !connectionError && (
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: isDark ? '#3a3a3a' : '#F8F9FA' }]}
              onPress={async () => {
                try {
                  setIsLoading(true);
                  const recommendations = await AIHotelService.getHotelRecommendations('Таганрог');
                  const recommendationMessage: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `🏨 **Рекомендации отелей в Таганроге:**\n\n${recommendations}`,
                    timestamp: new Date(),
                    sessionId: currentSession.sessionId
                  };
                  setMessages(prev => [...prev, recommendationMessage]);
                } catch (error: any) {
                  const errorMessage = AIHotelService.createErrorMessage(error.message);
                  setMessages(prev => [...prev, errorMessage]);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <IconSymbol name="building.2.fill" size={16} color="#4ECDC4" />
              <Text style={[styles.quickActionText, { color: isDark ? '#ffffff' : '#333' }]}>
                Рекомендации отелей
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={[
        styles.inputContainer, 
        isInputFocused && styles.inputContainerFocused,
        { backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF', borderColor: isDark ? '#3a3a3a' : '#E9ECEF' }
      ]}>
        <TextInput
          ref={textInputRef}
          style={[styles.textInput, { color: isDark ? '#ffffff' : '#000000' }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('ai.placeholder')}
          placeholderTextColor={isDark ? '#999' : '#999'}
          multiline
          maxLength={500}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            { backgroundColor: isDark ? '#3a3a3a' : '#007AFF' },
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <IconSymbol 
            name="paperplane.fill" 
            size={20} 
            color={(!inputText.trim() || isLoading) ? "#999" : (isDark ? "#ffffff" : "#FFFFFF")} 
          />
        </TouchableOpacity>
      </View>

      {/* Менеджер сессий */}
      <AISessionManager
        visible={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        onSessionSelect={handleSessionSelect}
        currentSession={currentSession}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerFull: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 120,
    borderTopWidth: 1,
    minHeight: 60,
  },
  inputContainerFocused: {
    paddingBottom: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#E9ECEF',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default AIAssistant;
