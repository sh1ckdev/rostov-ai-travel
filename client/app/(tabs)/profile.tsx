import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal } from "react-native";
import { observer } from "mobx-react-lite";
import { authStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";

const ProfileScreen = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
            await authStore.logout();
            router.replace("/login");
    setShowLogoutModal(false);
  };

  if (!authStore.isAuth) {
    return null;
  }

  const profileSections = [
    {
      title: t('profile.title'),
      items: [
        {
          icon: "person.circle",
          title: "Редактировать профиль",
          subtitle: "Изменить данные аккаунта",
          color: "#007AFF",
          onPress: () => Alert.alert("Редактировать профиль", "Функция в разработке"),
        },
      ],
    },
    {
      title: t('profile.settings'),
      items: [
        {
          icon: "gear",
          title: t('profile.settings'),
          subtitle: "Настройки приложения",
          color: "#8E8E93",
          onPress: () => router.push('/settings'),
        },
        {
          icon: "bell",
          title: t('profile.notifications'),
          subtitle: "Уведомления и звуки",
          color: "#FF9500",
          onPress: () => Alert.alert(t('profile.notifications'), "Функция в разработке"),
        },
        {
          icon: "lock",
          title: t('profile.privacy'),
          subtitle: "Безопасность и конфиденциальность",
          color: "#34C759",
          onPress: () => Alert.alert(t('profile.privacy'), "Функция в разработке"),
        },
      ],
    },
    {
      title: t('profile.about'),
      items: [
        {
          icon: "questionmark.circle",
          title: "Помощь",
          subtitle: "FAQ и поддержка",
          color: "#5856D6",
          onPress: () => Alert.alert("Помощь", "Функция в разработке"),
        },
        {
          icon: "info.circle",
          title: t('profile.about'),
          subtitle: t('profile.version') + " 1.0.0",
          color: "#AF52DE",
          onPress: () => Alert.alert(t('profile.about'), "Функция в разработке"),
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
      paddingBottom: 120,
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
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
    },
    content: {
      flex: 1,
      paddingTop: 100 + insets.top,
      paddingBottom: 100,
    },
    profileCard: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#007AFF20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    username: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
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
    logoutButton: {
      backgroundColor: '#FF3B30',
      marginHorizontal: 20,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
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
    modalMessage: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: isDark ? '#3a3a3a' : '#e0e0e0',
    },
    modalButtonConfirm: {
      backgroundColor: '#FF3B30',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonTextCancel: {
      color: isDark ? '#ffffff' : '#000000',
    },
    modalButtonTextConfirm: {
      color: '#FFFFFF',
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
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <Text style={styles.headerSubtitle}>Добро пожаловать в вашу учетную запись</Text>
        </BlurView>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
                <IconSymbol name="person.fill" size={40} color="#007AFF" />
          </View>
          <Text style={styles.username}>{authStore.user?.username || 'Пользователь'}</Text>
          <Text style={styles.email}>{authStore.user?.email || 'Email не указан'}</Text>
              </View>
              
        {profileSections.map((section, sectionIndex) => (
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
                  <View 
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.color + '20' }
                    ]}
                  >
                    <IconSymbol name={item.icon as any} size={20} color={item.color} />
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="power" size={20} color="white" />
          <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('auth.logout')}
            </Text>
            <Text style={[styles.modalMessage, { color: isDark ? '#cccccc' : '#666666' }]}>
              Вы уверены, что хотите выйти из аккаунта?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
          <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  {t('auth.logout')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default ProfileScreen;