import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ActionButton, AppPage, CustomerRow, EmptyState, SectionHeading } from '@/components/AppUI';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function CustomersScreen() {
  const colors = useColors();
  const router = useRouter();
  const { customers, sales, ready, loadError, retryLoad } = useAppData();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.phone}`.toLowerCase().includes(query),
    );
  }, [customers, search]);

  if (!ready) {
    return (
      <AppPage title={loadError ? 'Unable to open records' : 'Opening customers'}>
        {loadError ? <ActionButton title="Try again" icon="refresh-cw" onPress={retryLoad} /> : null}
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Customers"
      subtitle={`${customers.length} ${customers.length === 1 ? 'person' : 'people'} in your list`}
      hasTabs
      action={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add customer"
          testID="add-customer-button"
          onPress={() => router.push('/add-customer')}
          style={({ pressed }) => [styles.addButton, { backgroundColor: colors.accent, opacity: pressed ? 0.75 : 1 }]}
        >
          <Feather name="user-plus" size={18} color={colors.accentForeground} />
        </Pressable>
      }
    >
      {customers.length > 0 ? (
        <>
          <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={17} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find a customer"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              testID="customer-search-input"
              style={[styles.searchInput, { color: colors.foreground }]}
            />
            {search ? (
              <Pressable accessibilityLabel="Clear search" onPress={() => setSearch('')}>
                <Feather name="x-circle" size={17} color={colors.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
          <SectionHeading title={search ? 'Matching customers' : 'Your customers'} />
          {filtered.length ? (
            <View style={styles.list}>
              {filtered.map((customer) => {
                const count = sales.filter((sale) => sale.customerId === customer.id).length;
                return (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    subtitle={`${customer.phone || 'No phone number'} · ${count} ${count === 1 ? 'sale' : 'sales'}`}
                    onPress={() => router.push({ pathname: '/customer/[id]', params: { id: customer.id } })}
                  />
                );
              })}
            </View>
          ) : (
            <EmptyState icon="search" title="No matching customers" description="Try another name or phone number." />
          )}
        </>
      ) : (
        <EmptyState
          icon="users"
          title="No customers yet"
          description="Add your first customer to start keeping sales organized."
          action={<ActionButton title="Add a customer" icon="user-plus" onPress={() => router.push('/add-customer')} />}
        />
      )}
    </AppPage>
  );
}

const styles = StyleSheet.create({
  addButton: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  search: { minHeight: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, minHeight: 50, fontFamily: 'Inter_400Regular', fontSize: 14, outlineStyle: 'none' as never },
  list: { gap: 9 },
});
