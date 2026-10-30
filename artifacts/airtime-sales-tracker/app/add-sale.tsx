import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AppPage, BackButton, ChoicePill, Field, Notice, SectionHeading, uiStyles } from '@/components/AppUI';
import { Network, SaleType, useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

const networks: Network[] = ['MTN', 'Airtel', 'Glo', '9mobile'];

export default function AddSaleScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string }>();
  const { customers, addCustomer, addSale, ready, loadError, retryLoad, persistenceError } = useAppData();
  const [saleType, setSaleType] = useState<SaleType>('airtime');
  const [network, setNetwork] = useState<Network>('MTN');
  const [amount, setAmount] = useState('');
  const [dataPlan, setDataPlan] = useState('');
  const [customerId, setCustomerId] = useState(params.customerId ?? '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const matchedCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    return customers.filter((customer) =>
      !query || `${customer.name} ${customer.phone}`.toLowerCase().includes(query),
    );
  }, [customers, customerSearch]);

  const createInlineCustomer = async () => {
    if (!newName.trim()) {
      setError('Enter a name for the new customer.');
      return;
    }
    try {
      const customer = await addCustomer({ name: newName, phone: newPhone });
      setCustomerId(customer.id);
      setNewName('');
      setNewPhone('');
      setShowNewCustomer(false);
      setError('');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      setError('The customer could not be saved. Try again.');
    }
  };

  const saveSale = async () => {
    if (!ready || saving) return;
    const numericAmount = Number(amount.replace(/[^\d]/g, ''));
    if (!customerId || !customers.some((customer) => customer.id === customerId)) {
      setError('Choose a customer before saving this sale.');
      return;
    }
    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
      setError('Enter a sale amount greater than ₦0.');
      return;
    }
    if (saleType === 'data' && !dataPlan.trim()) {
      setError('Enter the data bundle or plan.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await addSale({
        customerId,
        type: saleType,
        network,
        amount: numericAmount,
        dataPlan: saleType === 'data' ? dataPlan.trim() : '',
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/transactions');
    } catch {
      Alert.alert('Sale not saved', 'Your device could not save this sale. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <AppPage title={loadError ? 'Unable to open records' : 'Opening sale form'}>
        {loadError ? (
          <ActionButton title="Try again" icon="refresh-cw" onPress={retryLoad} />
        ) : (
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Loading your saved records…</Text>
        )}
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="NEW TRANSACTION"
      title="Record a sale"
      subtitle="Add a customer and sale details."
      keyboardAware
      action={<BackButton onPress={() => router.back()} />}
    >
      <View style={styles.form}>
        <View style={styles.typeRow}>
          <ChoicePill label="Airtime" selected={saleType === 'airtime'} onPress={() => { setSaleType('airtime'); setError(''); }} testID="sale-type-airtime" />
          <ChoicePill label="Data" selected={saleType === 'data'} onPress={() => { setSaleType('data'); setError(''); }} testID="sale-type-data" />
        </View>

        <View style={styles.section}>
          <SectionHeading title="Choose customer" />
          {customers.length ? (
            <>
              <Field
                label="Search by name or phone"
                value={customerSearch}
                onChangeText={setCustomerSearch}
                placeholder="Type to find a customer"
                autoCapitalize="none"
                testID="sale-customer-search"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.customerPills}>
                {matchedCustomers.map((customer) => (
                  <ChoicePill
                    key={customer.id}
                    label={customer.name}
                    selected={customerId === customer.id}
                    onPress={() => { setCustomerId(customer.id); setError(''); }}
                  />
                ))}
              </ScrollView>
              {matchedCustomers.length === 0 ? (
                <Text style={[styles.helper, { color: colors.mutedForeground }]}>No customer matches that search.</Text>
              ) : null}
            </>
          ) : (
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>Add a customer here before recording the sale.</Text>
          )}
          <View style={[styles.inlineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.inlineTitle, { color: colors.foreground }]}>
              {showNewCustomer ? 'New customer details' : 'Need to add someone?'}
            </Text>
            {showNewCustomer ? (
              <View style={styles.inlineForm}>
                <Field label="Name" value={newName} onChangeText={setNewName} placeholder="Customer name" autoCapitalize="words" />
                <Field label="Phone number (optional)" value={newPhone} onChangeText={setNewPhone} placeholder="0801 234 5678" keyboardType="phone-pad" />
                <View style={styles.inlineActions}>
                  <ActionButton title="Add & select" icon="user-plus" onPress={createInlineCustomer} />
                  <ActionButton title="Cancel" onPress={() => { setShowNewCustomer(false); setError(''); }} secondary />
                </View>
              </View>
            ) : (
              <ActionButton title="Add a customer" icon="user-plus" onPress={() => setShowNewCustomer(true)} secondary />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Network" />
          <View style={styles.networkGrid}>
            {networks.map((item) => (
              <ChoicePill key={item} label={item} selected={network === item} onPress={() => setNetwork(item)} />
            ))}
          </View>
        </View>

        <Field
          label="Sale amount (₦)"
          value={amount}
          onChangeText={(value) => { setAmount(value.replace(/[^\d]/g, '')); setError(''); }}
          placeholder="e.g. 1000"
          keyboardType="number-pad"
          testID="sale-amount-input"
        />
        {saleType === 'data' ? (
          <Field
            label="Data bundle or plan"
            value={dataPlan}
            onChangeText={(value) => { setDataPlan(value); setError(''); }}
            placeholder="e.g. 2GB weekly"
            autoCapitalize="sentences"
            testID="data-plan-input"
          />
        ) : null}
        {error ? <Text style={[uiStyles.errorText, { color: colors.destructive }]}>{error}</Text> : null}
        {persistenceError ? <Notice>{persistenceError}</Notice> : null}
        <ActionButton title="Save sale" icon="check" onPress={saveSale} loading={saving} testID="save-sale-button" />
      </View>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  form: { gap: 20 },
  typeRow: { flexDirection: 'row', gap: 9 },
  section: { gap: 13 },
  customerPills: { gap: 8, paddingRight: 12 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  inlineCard: { borderRadius: 18, borderWidth: 1, padding: 15, gap: 12 },
  inlineTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  inlineForm: { gap: 14 },
  inlineActions: { gap: 9 },
  networkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
