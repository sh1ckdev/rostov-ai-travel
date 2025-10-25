import { View, Text, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from "react-native";
import { observer } from "mobx-react-lite";
import { authStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileScreen = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [authStore.isAuth]);

  const handleLogout = () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            await authStore.logout();
            router.replace("/login");
          }
        }
      ]
    );
  };

  if (!authStore.isAuth) {
    return null;
  }

  const menuItems = [
    { icon: "person.circle" as const, title: "Редактировать профиль", color: "#007AFF" },
    { icon: "gear" as const, title: "Настройки", color: "#8E8E93" },
    { icon: "bell" as const, title: "Уведомления", color: "#FF9500" },
    { icon: "lock" as const, title: "Безопасность", color: "#34C759" },
    { icon: "questionmark.circle" as const, title: "Помощь", color: "#5856D6" },
    { icon: "info.circle" as const, title: "О приложении", color: "#AF52DE" },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header с блюром */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <BlurView 
          intensity={20}
          tint="extraLight"
          style={{
            paddingTop: insets.top,
            paddingBottom: 20,
          }}
        >
          <View className="px-6">
            <Text className="text-3xl font-bold text-black mb-2">Профиль</Text>
            <Text className="text-black opacity-80">Добро пожаловать в вашу учетную запись</Text>
          </View>
        </BlurView>
      </View>
      
      {/* Добавляем отступ для контента под header */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: 120 + insets.top, // Отступ под header
          paddingBottom: 100 
        }}
      >
        {/* Profile Info Card */}
        <View className="px-6 py-8">
          <View className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <View className="items-center mb-6">
              {/* Profile Avatar */}
              <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                <IconSymbol name="person.fill" size={40} color="#007AFF" />
              </View>
              
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {authStore.user.username}
              </Text>
              <Text className="text-gray-600 text-lg">
                {authStore.user.email}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View className="space-y-3">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white rounded-xl shadow-sm p-4 my-2 flex-row items-center"
                onPress={() => Alert.alert(item.title, "Функция в разработке")}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: item.color + '20' }}
                >
                  <IconSymbol name={item.icon} size={20} color={item.color} />
                </View>
                <Text className="text-gray-900 text-lg font-medium flex-1">
                  {item.title}
                </Text>
                <IconSymbol name="chevron.right" size={16} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-xl py-4 px-6 shadow-sm mt-6"
          >
            <View className="flex-row items-center justify-center">
              <IconSymbol name="power" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center text-lg font-semibold">Выйти из аккаунта</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

export default ProfileScreen;