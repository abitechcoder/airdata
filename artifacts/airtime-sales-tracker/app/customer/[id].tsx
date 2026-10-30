import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton, AppPage, ChoicePill, EmptyState, Field, Notice, SaleRow, uiStyles } from '@/components/AppUI';
import { Network, SaleType, useAppData } from '@/context/AppDataContext';
import { formatMoney, getSalesTotal } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

const networks: Network[] = ['MTN', 'Airtel', 'Glo', '9mobile'];

export default function CustomerDetailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, sales, addSale, deleteSale, ready, loadError, retryLoad, persistenceError } = useAppData();
  const customer = customers.find((item) => item.id === id);
  const customerSales = sales.filter((sale) => sale.customerId === id);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [saleType, setSaleType] = useState<SaleType>('airtime');
  const [network, setNetwork] = useState<Network>('MTN');
  const [amount, setAmount] = useState('');
  const [savingSale, setSavingSale] = useState(false);
  const [saleError, setSaleError] = useState('');

  const openQuickSale = () => {
    setSaleType('airtime');
    setNetwork('MTN');
    setAmount('');
    setSaleError('');
    setShowQuickSale(true);
  };

  const closeQuickSale = () => {
    if (!savingSale) setShowQuickSale(false);
  };

  const saveQuickSale = async () => {
    if (savingSale) return;
    const numericAmount = Number(amount.replace(/[^\d]/g, ''));
    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
      setSaleError('Enter a sale amount greater than ₦0.');
      return;
    }

    setSaleError('');
    setSavingSale(true);
    try {
      await addSale({
        customerId: id,
        type: saleType,
        network,
        amount: numericAmount,
        dataPlan: '',
      });
      setShowQuickSale(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      setSaleError('This sale could not be saved. Please try again.');
    } finally {
      setSavingSale(false);
    }
  };

  if (!ready) {
    return (
      <AppPage title={loadError ? 'Unable to open records' : 'Opening customer'}>
        {loadError ? <ActionButton title="Try again" icon="refresh-cw" onPress={retryLoad} /> : null}
      </AppPage>
    );
  }

  if (!customer) {
    return (
      <AppPage title="Customer not found">
        <EmptyState
          icon="user-x"
          title="This customer is unavailable"
          description="They may have been removed from this device."
          action={<ActionButton title="View customers" onPress={() => router.replace('/(tabs)/customers')} secondary />}
        />
      </AppPage>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppPage
        eyebrow="CUSTOMER DETAILS"
        title={customer.name}
        subtitle={customer.phone || 'No phone number added'}
        action={
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="arrow-left" size={18} color={colors.secondaryForeground} />
          </Pressable>
        }
      >
        <View style={[styles.summary, { backgroundColor: colors.primary }]}>
          <Text style={[styles.summaryLabel, { color: colors.primaryForeground }]}>TOTAL PURCHASES</Text>
          <Text style={[styles.summaryAmount, { color: colors.primaryForeground }]}>{formatMoney(getSalesTotal(customerSales))}</Text>
          <Text style={[styles.summaryCount, { color: colors.primaryForeground }]}>
            {customerSales.length} {customerSales.length === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>
        <View style={styles.history}>
          <Text style={[styles.historyTitle, { color: colors.foreground }]}>Transaction history</Text>
          {customerSales.length ? (
            <View style={styles.list}>
              {customerSales.map((sale) => (
                <SaleRow
                  key={sale.id}
                  sale={sale}
                  customer={customer}
                  onEdit={() => router.push({ pathname: '/add-sale', params: { saleId: sale.id } })}
                  onDelete={() => deleteSale(sale.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState icon="repeat" title="No purchases yet" description="This customer's sales will appear here." />
          )}
        </View>
      </AppPage>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add sale for ${customer.name}`}
        testID="customer-add-sale-button"
        onPress={openQuickSale}
        style={({ pressed }) => [
          styles.floatingButton,
          {
            right: 20,
            bottom: insets.bottom + (Platform.OS === 'web' ? 34 : 12) + 16,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <Feather name="plus" size={27} color={colors.primaryForeground} />
      </Pressable>

      <Modal
        visible={showQuickSale}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeQuickSale}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add sale form"
            testID="close-customer-sale-backdrop"
            onPress={closeQuickSale}
            style={[StyleSheet.absoluteFill, styles.backdrop]}
          />
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={styles.keyboardAvoider}
          >
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.background,
                  paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 12) + 16,
                },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetContent}
              >
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeading}>
                    <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Add a sale</Text>
                    <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>
                      For {customer.name}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close add sale form"
                    testID="close-customer-sale-button"
                    onPress={closeQuickSale}
                    style={({ pressed }) => [
                      styles.closeButton,
                      { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Feather name="x" size={20} color={colors.secondaryForeground} />
                  </Pressable>
                </View>

                <View style={styles.formSection}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Network</Text>
                  <View style={styles.choiceRow}>
                    {networks.map((item) => (
                      <ChoicePill
                        key={item}
                        label={item}
                        selected={network === item}
                        onPress={() => setNetwork(item)}
                        testID={`customer-sale-network-${item}`}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Field
                    label="Amount (₦)"
                    value={amount}
                    onChangeText={(value) => {
                      setAmount(value.replace(/[^\d]/g, ''));
                      setSaleError('');
                    }}
                    placeholder="e.g. 1000"
                    keyboardType="number-pad"
                    testID="customer-sale-amount-input"
                  />
                </View>
                <View style={styles.formSection}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Sale type</Text>
                  <View style={styles.choiceRow}>
                    <ChoicePill
                      label="Airtime"
                      selected={saleType === 'airtime'}
                      onPress={() => setSaleType('airtime')}
                      testID="customer-sale-type-airtime"
                    />
                    <ChoicePill
                      label="Data"
                      selected={saleType === 'data'}
                      onPress={() => setSaleType('data')}
                      testID="customer-sale-type-data"
                    />
                  </View>
                </View>
                {saleError ? (
                  <Text style={[uiStyles.errorText, { color: colors.destructive }]}>{saleError}</Text>
                ) : null}
                {persistenceError ? <Notice>{persistenceError}</Notice> : null}
                <ActionButton
                  title="Save sale"
                  icon="check"
                  onPress={saveQuickSale}
                  loading={savingSale}
                  testID="save-customer-sale-button"
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backButton: { height: 44, width: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  summary: { borderRadius: 24, padding: 20, gap: 9 },
  summaryLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1 },
  summaryAmount: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.7 },
  summaryCount: { fontFamily: 'Inter_500Medium', fontSize: 12, opacity: 0.8 },
  history: { gap: 14 },
  historyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  list: { gap: 9 },
  floatingButton: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.42)' },
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { paddingHorizontal: 22, paddingTop: 16, gap: 21 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  sheetHeading: { flex: 1, gap: 4 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.4 },
  sheetSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  closeButton: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  formSection: { gap: 10 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
