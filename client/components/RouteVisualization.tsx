import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Route } from '../services/DirectionsService';
import { IconSymbol } from './ui/icon-symbol';

const { width } = Dimensions.get('window');

interface RouteVisualizationProps {
  route: Route | null;
  onClose?: () => void;
  onNavigate?: () => void;
  onShare?: () => void;
}

const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  route,
  onClose,
  onNavigate,
  onShare,
}) => {
  const [slideAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (route) {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [route]);

  if (!route) return null;

  const slideTransform = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} км`;
    }
    return `${meters} м`;
  };

  const getRouteSteps = () => {
    if (!route.legs || route.legs.length === 0) return [];
    
    return route.legs.map((leg, index) => ({
      step: index + 1,
      instruction: leg.html_instructions?.replace(/<[^>]*>/g, '') || 'Следуйте по маршруту',
      distance: leg.distance?.text || '',
      duration: leg.duration?.text || '',
    }));
  };

  const steps = getRouteSteps();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideTransform }],
          opacity: fadeAnimation,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Маршрут построен</Text>
          <Text style={styles.subtitle}>
            {formatDistance(route.distance?.value || 0)} • {formatDuration(route.duration?.value || 0)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <IconSymbol name="xmark" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <IconSymbol name="location" size={16} color="#007AFF" />
            <Text style={styles.infoText}>
              {formatDistance(route.distance?.value || 0)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="clock" size={16} color="#007AFF" />
            <Text style={styles.infoText}>
              {formatDuration(route.duration?.value || 0)}
            </Text>
          </View>
        </View>
      </View>

      {steps.length > 0 && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Пошаговая навигация</Text>
          <View style={styles.stepsList}>
            {steps.slice(0, 3).map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepInstruction} numberOfLines={2}>
                    {step.instruction}
                  </Text>
                  <Text style={styles.stepDistance}>{step.distance}</Text>
                </View>
              </View>
            ))}
            {steps.length > 3 && (
              <Text style={styles.moreSteps}>
                +{steps.length - 3} шагов
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onNavigate}
        >
          <IconSymbol name="location.fill" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Начать навигацию</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onShare}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Поделиться</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  stepsList: {
    maxHeight: 120,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  stepDistance: {
    fontSize: 12,
    color: '#666',
  },
  moreSteps: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RouteVisualization;
