import React from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio, ScrollView } from 'react-native';
import { DEVICE, FONT_SIZES, SPACING } from '../../utils/responsive';

const DeviceInfoScreen = () => {
  const { width, height } = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const pixelRatio = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📱 Device Testing Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Dimensions</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Window Width:</Text>
          <Text style={styles.value}>{width.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Window Height:</Text>
          <Text style={styles.value}>{height.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Screen Width:</Text>
          <Text style={styles.value}>{screenDimensions.width.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Screen Height:</Text>
          <Text style={styles.value}>{screenDimensions.height.toFixed(2)} px</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pixel & Font Info</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Pixel Ratio:</Text>
          <Text style={styles.value}>{pixelRatio}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Font Scale:</Text>
          <Text style={styles.value}>{fontScale.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Category</Text>
        
        <View style={styles.categoryCard}>
          <Text style={styles.categoryText}>
            {DEVICE.isSmallDevice && '📱 Small Device (< 375px)'}
            {DEVICE.isMediumDevice && '📱 Medium Device (375-414px)'}
            {DEVICE.isLargeDevice && '📱 Large Device (> 414px)'}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Responsive Font Sizes</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>FONT_SIZES.xs:</Text>
          <Text style={styles.value}>{FONT_SIZES.xs.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>FONT_SIZES.sm:</Text>
          <Text style={styles.value}>{FONT_SIZES.sm.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>FONT_SIZES.md:</Text>
          <Text style={styles.value}>{FONT_SIZES.md.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>FONT_SIZES.lg:</Text>
          <Text style={styles.value}>{FONT_SIZES.lg.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>FONT_SIZES.xl:</Text>
          <Text style={styles.value}>{FONT_SIZES.xl.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>FONT_SIZES.heading:</Text>
          <Text style={styles.value}>{FONT_SIZES.heading.toFixed(2)} px</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Responsive Spacing</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>SPACING.xs:</Text>
          <Text style={styles.value}>{SPACING.xs.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>SPACING.sm:</Text>
          <Text style={styles.value}>{SPACING.sm.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>SPACING.md:</Text>
          <Text style={styles.value}>{SPACING.md.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>SPACING.lg:</Text>
          <Text style={styles.value}>{SPACING.lg.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>SPACING.xl:</Text>
          <Text style={styles.value}>{SPACING.xl.toFixed(2)} px</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>SPACING.xxl:</Text>
          <Text style={styles.value}>{SPACING.xxl.toFixed(2)} px</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Size Preview</Text>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: FONT_SIZES.xs }]}>
            Extra Small Text (xs)
          </Text>
        </View>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: FONT_SIZES.sm }]}>
            Small Text (sm)
          </Text>
        </View>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: FONT_SIZES.md }]}>
            Medium Text (md)
          </Text>
        </View>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: FONT_SIZES.lg }]}>
            Large Text (lg)
          </Text>
        </View>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: FONT_SIZES.xl }]}>
            Extra Large Text (xl)
          </Text>
        </View>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewText, { fontSize: FONT_SIZES.heading }]}>
            Heading Text
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spacing Preview</Text>
        
        <View style={styles.spacingPreview}>
          <View style={[styles.spacingBox, { width: SPACING.xs, height: SPACING.xs }]}>
            <Text style={styles.spacingLabel}>xs</Text>
          </View>
          
          <View style={[styles.spacingBox, { width: SPACING.sm, height: SPACING.sm }]}>
            <Text style={styles.spacingLabel}>sm</Text>
          </View>
          
          <View style={[styles.spacingBox, { width: SPACING.md, height: SPACING.md }]}>
            <Text style={styles.spacingLabel}>md</Text>
          </View>
          
          <View style={[styles.spacingBox, { width: SPACING.lg, height: SPACING.lg }]}>
            <Text style={styles.spacingLabel}>lg</Text>
          </View>
          
          <View style={[styles.spacingBox, { width: SPACING.xl, height: SPACING.xl }]}>
            <Text style={styles.spacingLabel}>xl</Text>
          </View>
        </View>
      </View>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: '#666',
  },
  value: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  categoryCard: {
    backgroundColor: '#E3F2FD',
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  previewCard: {
    backgroundColor: '#fff',
    padding: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewText: {
    color: '#333',
  },
  spacingPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    backgroundColor: '#fff',
    padding: SPACING.xl,
    borderRadius: 8,
  },
  spacingBox: {
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  spacingLabel: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
});

export default DeviceInfoScreen;
