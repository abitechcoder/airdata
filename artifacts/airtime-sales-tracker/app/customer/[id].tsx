import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AppPage, EmptyState, SaleRow } from '@/components/AppUI';
import { useAppData } from '@/context/AppDataContext';
import { formatMoney, getSalesTotal } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function CustomerDetailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, sales, ready, loadError, retryLoad } = useAppData();
  const customer = customers.find((item) => item.id === id);
  const customerSales = sales.filter((sale) => sale.customerId === id);

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
              <SaleRow key={sale.id} sale={sale} customer={customer} onPress={() => {}} />
            ))}
          </View>
        ) : (
          <EmptyState icon="repeat" title="No purchases yet" description="This customer's sales will appear here." />
        )}
      </View>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  backButton: { height: 44, width: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  summary: { borderRadius: 24, padding: 20, gap: 9 },
  summaryLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1 },
  summaryAmount: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.7 },
  summaryCount: { fontFamily: 'Inter_500Medium', fontSize: 12, opacity: 0.8 },
  history: { gap: 14 },
  historyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  list: { gap: 9 },
});
