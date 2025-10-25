import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'systemMaterial';
  style?: ViewStyle;
  borderRadius?: number;
  borderColor?: string;
  backgroundColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  tint = 'light',
  style,
  borderRadius = 16,
  borderColor = 'rgba(255, 255, 255, 0.2)',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        {
          borderRadius,
          borderWidth: 1,
          borderColor,
          backgroundColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
};
