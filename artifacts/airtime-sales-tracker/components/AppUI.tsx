import { Feather } from '@expo/vector-icons';
import React, { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Customer, Sale } from '@/context/AppDataContext';
import { formatMoney, formatSaleDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

type PageProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  keyboardAware?: boolean;
  hasTabs?: boolean;
}>;

export function AppPage({
  title,
  subtitle,
  eyebrow,
  action,
  keyboardAware = false,
  hasTabs = false,
  children,
}: PageProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const web = Platform.OS === 'web';
  const top = web ? Math.max(insets.top, 67) : insets.top;
  const bottom = insets.bottom + (web ? 34 : 18) + (hasTabs ? 84 : 12);
  const content = (
    <>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </>
  );
  const contentStyle = [
    styles.pageContent,
    { paddingTop: top + 16, paddingBottom: bottom },
  ];

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      {keyboardAware ? (
        <KeyboardAwareScrollViewCompat
          style={styles.flex}
          contentContainerStyle={contentStyle}
          bottomOffset={88}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </KeyboardAwareScrollViewCompat>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      )}
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
  testID?: string;
};

export function ActionButton({
  title,
  onPress,
  icon,
  disabled,
  loading,
  secondary,
  testID,
}: ButtonProps) {
  const colors = useColors();
  const backgroundColor = secondary ? colors.secondary : colors.primary;
  const foregroundColor = secondary ? colors.secondaryForeground : colors.primaryForeground;
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.82 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={18} color={foregroundColor} /> : null}
          <Text style={[styles.actionButtonText, { color: foregroundColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      style={({ pressed }) => [
        styles.backButton,
        { backgroundColor: colors.secondary, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <Feather name="arrow-left" size={18} color={colors.secondaryForeground} />
    </Pressable>
  );
}

export function Field({
  label,
  ...inputProps
}: TextInputProps & { label: string }) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            color: colors.foreground,
          },
          inputProps.style,
        ]}
      />
    </View>
  );
}

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action}
    </View>
  );
}

export function ChoicePill({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choicePill,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceText,
          { color: selected ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>{description}</Text>
      {action}
    </View>
  );
}

export function CustomerRow({
  customer,
  subtitle,
  onPress,
}: {
  customer: Customer;
  subtitle: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.listRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {customer.name.trim().charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.foreground }]}>{customer.name}</Text>
        <Text numberOfLines={1} style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function SaleRow({
  sale,
  customer,
  primaryLabel = 'customer',
  onPress,
  onEdit,
  onDelete,
}: {
  sale: Sale;
  customer?: Customer;
  primaryLabel?: 'customer' | 'saleType';
  onPress?: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const colors = useColors();
  const data = sale.type === 'data';
  const saleLabel = data ? 'Data' : 'Airtime';
  const title = primaryLabel === 'saleType' ? saleLabel : customer?.name ?? 'Unknown customer';
  const subtitle =
    primaryLabel === 'saleType'
      ? `${sale.network} · ${formatSaleDate(sale.createdAt)}`
      : `${sale.network} · ${data ? sale.dataPlan || 'Data' : 'Airtime'} · ${formatSaleDate(sale.createdAt)}`;
  const accessibleLabel = primaryLabel === 'saleType' ? saleLabel : customer?.name ?? 'Customer';
  const content = (
    <>
      <View style={[styles.saleIcon, { backgroundColor: data ? colors.accent : colors.secondary }]}>
        <Feather name={data ? 'wifi' : 'phone'} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.rowAmount, { color: colors.foreground }]}>{formatMoney(sale.amount)}</Text>
    </>
  );
  return (
    <View style={[styles.listRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${accessibleLabel} sale details`}
          onPress={onPress}
          style={({ pressed }) => [styles.saleMain, { opacity: pressed ? 0.72 : 1 }]}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.saleMain}>{content}</View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Options for ${accessibleLabel.toLowerCase()} sale`}
        testID={`sale-actions-${sale.id}`}
        onPress={() =>
          Alert.alert('Sale options', 'Choose what you want to do with this sale.', [
            { text: 'Edit sale', onPress: onEdit },
            {
              text: 'Remove sale',
              style: 'destructive',
              onPress: () =>
                Alert.alert(
                  'Remove this sale?',
                  'It will be removed from this device, and sales totals will be updated.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove sale',
                      style: 'destructive',
                      onPress: () => {
                        void onDelete().catch(() => {
                          Alert.alert(
                            'Sale not removed',
                            'This sale could not be removed. Please try again.',
                          );
                        });
                      },
                    },
                  ],
                ),
            },
            { text: 'Cancel', style: 'cancel' },
          ])
        }
        style={({ pressed }) => [
          styles.saleAction,
          { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="more-horizontal" size={19} color={colors.secondaryForeground} />
      </Pressable>
    </View>
  );
}

export function Notice({ children }: PropsWithChildren) {
  const colors = useColors();
  return (
    <View style={[styles.notice, { backgroundColor: colors.accent, borderColor: colors.border }]}>
      <Feather name="info" size={16} color={colors.accentForeground} />
      <Text style={[styles.noticeText, { color: colors.accentForeground }]}>{children}</Text>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    gap: 12,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  fieldGap: {
    gap: 16,
  },
});

const styles = StyleSheet.create({
  page: { flex: 1 },
  flex: { flex: 1 },
  pageContent: { paddingHorizontal: 20, gap: 22 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headingText: { flex: 1, gap: 4 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase' },
  pageTitle: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.8 },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  actionButton: { minHeight: 54, paddingHorizontal: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  actionButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  backButton: { height: 44, width: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: -0.3 },
  choicePill: { minHeight: 42, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  choiceText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  emptyState: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 28, gap: 10 },
  emptyIcon: { height: 48, width: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  emptyDescription: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  listRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, gap: 12 },
  saleMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  saleAction: { height: 38, width: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  saleIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  rowAmount: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  notice: { flexDirection: 'row', gap: 9, padding: 13, borderRadius: 14, borderWidth: 1, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
});
