import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useI18n();
  const [showThemeModal, setShowThemeModal] = React.useState(false);
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const settingsSections = [
    {
      title: t('profile.settings'),
      items: [
        {
          icon: 'paintbrush',
          title: t('profile.theme'),
          subtitle: theme === 'light' ? t('theme.light') : theme === 'dark' ? t('theme.dark') : t('theme.system'),
          onPress: () => setShowThemeModal(true),
        },
        {
          icon: 'globe',
          title: t('profile.language'),
          subtitle: language === 'ru' ? t('language.russian') : t('language.english'),
          onPress: () => setShowLanguageModal(true),
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    headerContent: {
      paddingTop: insets.top,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    content: {
      flex: 1,
      paddingTop: 100 + insets.top,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 12,
      paddingHorizontal: 20,
    },
    sectionContent: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#3a3a3a' : '#f0f0f0',
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#3a3a3a' : '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
    },
    chevron: {
      marginLeft: 8,
    },
    themeLanguageSection: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      marginHorizontal: 20,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    themeLanguageTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 16,
    },
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    optionText: {
      fontSize: 16,
      marginLeft: 12,
    },
    closeButton: {
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    closeButtonText: {
      textAlign: 'center',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BlurView 
          intensity={20}
          tint={isDark ? "dark" : "extraLight"}
          style={styles.headerContent}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={20} color={isDark ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.settings')}</Text>
        </BlurView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.settingItemLast,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.iconContainer}>
                    <IconSymbol name={item.icon as any} size={20} color="#007AFF" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <IconSymbol 
                    name="chevron.right" 
                    size={16} 
                    color={isDark ? '#666666' : '#cccccc'} 
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('profile.theme')}
            </Text>
            {[
              { key: 'light', label: t('theme.light'), icon: 'sunny' },
              { key: 'dark', label: t('theme.dark'), icon: 'moon' },
              { key: 'system', label: t('theme.system'), icon: 'phone-portrait' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.option,
                  { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' },
                  theme === option.key && { backgroundColor: isDark ? '#3a3a3a' : '#e0e0e0' },
                ]}
                onPress={() => {
                  setTheme(option.key as any);
                  setShowThemeModal(false);
                }}
              >
                <IconSymbol
                  name={option.icon as any}
                  size={20}
                  color={isDark ? '#ffffff' : '#000000'}
                />
                <Text style={[styles.optionText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {option.label}
                </Text>
                {theme === option.key && (
                  <IconSymbol
                    name="checkmark"
                    size={20}
                    color="#007AFF"
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: isDark ? '#404040' : '#e0e0e0' }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('profile.language')}
            </Text>
            {[
              { key: 'ru', label: t('language.russian'), flag: '🇷🇺' },
              { key: 'en', label: t('language.english'), flag: '🇺🇸' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.option,
                  { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' },
                  language === option.key && { backgroundColor: isDark ? '#3a3a3a' : '#e0e0e0' },
                ]}
                onPress={() => {
                  setLanguage(option.key as any);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={{ fontSize: 20 }}>{option.flag}</Text>
                <Text style={[styles.optionText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {option.label}
                </Text>
                {language === option.key && (
                  <IconSymbol
                    name="checkmark"
                    size={20}
                    color="#007AFF"
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: isDark ? '#404040' : '#e0e0e0' }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
