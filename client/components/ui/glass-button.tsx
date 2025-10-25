import React from 'react';
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './icon-symbol';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: 'rgba(0, 122, 255, 0.3)',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          textColor: '#007AFF',
        };
      case 'secondary':
        return {
          borderColor: 'rgba(142, 142, 147, 0.3)',
          backgroundColor: 'rgba(142, 142, 147, 0.1)',
          textColor: '#8E8E93',
        };
      case 'danger':
        return {
          borderColor: 'rgba(255, 59, 48, 0.3)',
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          textColor: '#FF3B30',
        };
      default:
        return {
          borderColor: 'rgba(0, 122, 255, 0.3)',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          textColor: '#007AFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 20,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
          iconSize: 24,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
      activeOpacity={0.7}
    >
      <BlurView
        intensity={20}
        tint="light"
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: variantStyles.borderColor,
          backgroundColor: variantStyles.backgroundColor,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          }}
        >
          {icon && (
            <IconSymbol
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
                fontWeight: '600',
                textAlign: 'center',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};
