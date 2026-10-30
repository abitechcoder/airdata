import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AppPage, ChoicePill, EmptyState, SaleRow } from '@/components/AppUI';
import { SaleType, useAppData } from '@/context/AppDataContext';
import { formatMoney, getSalesTotal } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

type Filter = 'all' | SaleType;

export default function TransactionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { customers, sales, deleteSale, ready, loadError, retryLoad } = useAppData();
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = useMemo(
    () => sales.filter((sale) => filter === 'all' || sale.type === filter),
    [sales, filter],
  );

  if (!ready) {
    return (
      <AppPage title={loadError ? 'Unable to open records' : 'Opening sales'}>
        {loadError ? <ActionButton title="Try again" icon="refresh-cw" onPress={retryLoad} /> : null}
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Sales"
      subtitle="Every airtime and data sale, in order."
      hasTabs
    >
      <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>TOTAL SALES VALUE</Text>
        <Text style={[styles.totalValue, { color: colors.foreground }]}>{formatMoney(getSalesTotal(sales))}</Text>
        <Text style={[styles.totalCount, { color: colors.primary }]}>{sales.length} recorded {sales.length === 1 ? 'sale' : 'sales'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <ChoicePill label="All sales" selected={filter === 'all'} onPress={() => setFilter('all')} testID="filter-all" />
        <ChoicePill label="Airtime" selected={filter === 'airtime'} onPress={() => setFilter('airtime')} testID="filter-airtime" />
        <ChoicePill label="Data" selected={filter === 'data'} onPress={() => setFilter('data')} testID="filter-data" />
      </ScrollView>
      {filtered.length ? (
        <View style={styles.list}>
          {filtered.map((sale) => (
            <SaleRow
              key={sale.id}
              sale={sale}
              customer={customers.find((customer) => customer.id === sale.customerId)}
              onPress={() => router.push({ pathname: '/customer/[id]', params: { id: sale.customerId } })}
              onEdit={() => router.push({ pathname: '/add-sale', params: { saleId: sale.id } })}
              onDelete={() => deleteSale(sale.id)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon={filter === 'data' ? 'wifi' : 'repeat'}
          title={filter === 'all' ? 'No sales recorded' : `No ${filter} sales yet`}
          description="Record a sale and it will appear here."
          action={<ActionButton title="Record a sale" icon="plus" onPress={() => router.push('/add-sale')} />}
        />
      )}
    </AppPage>
  );
}

const styles = StyleSheet.create({
  totalCard: { borderWidth: 1, borderRadius: 22, padding: 19, gap: 8 },
  totalLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1 },
  totalValue: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.7 },
  totalCount: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  filters: { gap: 8, paddingRight: 12 },
  list: { gap: 9 },
});
