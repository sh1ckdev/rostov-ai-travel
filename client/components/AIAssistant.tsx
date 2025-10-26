import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { AIService, ChatMessage, AIRecommendation } from '../services/AIService';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Добавляем приветственное сообщение
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я ваш универсальный AI-помощник. Могу помочь с любыми вопросами - от туризма и карт до общих тем. Чем могу помочь?',
      timestamp: new Date(),
      suggestions: [
        {
          id: '1',
          title: 'О туризме',
          description: 'Рассказать о Ростове-на-Дону',
          category: 'TRAVEL',
          confidence: 0.9,
          reasoning: 'Специализация',
          action: 'travel_info'
        },
        {
          id: '2',
          title: 'Общие вопросы',
          description: 'Поговорить на любую тему',
          category: 'GENERAL',
          confidence: 0.8,
          reasoning: 'Универсальность',
          action: 'general_chat'
        },
        {
          id: '3',
          title: 'Помощь',
          description: 'Как пользоваться приложением',
          category: 'HELP',
          confidence: 0.9,
          reasoning: 'Поддержка',
          action: 'help'
        }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss(); // Убираем клавиатуру после отправки
    setIsLoading(true);

    try {
      const response = await AIService.sendMessage(inputText);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (recommendation: AIRecommendation) => {
    if (onRecommendationPress) {
      onRecommendationPress(recommendation);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
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
      style={[styles.container, fullScreen && styles.containerFull]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 140}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="brain.head.profile" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>AI-Помощник</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={20} color="#666" />
          </TouchableOpacity>
        )}
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

            {message.suggestions && message.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {message.suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <IconSymbol name="arrow.clockwise" size={16} color="#007AFF" />
            <Text style={styles.loadingText}>AI думает...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, isInputFocused && styles.inputContainerFocused]}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Напишите ваш вопрос..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <IconSymbol 
            name="paperplane.fill" 
            size={20} 
            color={(!inputText.trim() || isLoading) ? "#999" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#FFFFFF',
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
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
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
  suggestionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#666',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 120,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    minHeight: 60,
  },
  inputContainerFocused: {
    paddingBottom: 16, // Обычный padding когда фокус на инпуте
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
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
