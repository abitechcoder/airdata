import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AppPage, SaleRow, SectionHeading, uiStyles } from '@/components/AppUI';
import { useAppData } from '@/context/AppDataContext';
import { formatMoney, getSalesTotal, isToday } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function OverviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const { customers, sales, ready, loadError, retryLoad } = useAppData();
  const todaySales = sales.filter((sale) => isToday(sale.createdAt));
  const recentSales = sales.slice(0, 4);

  if (!ready) {
    return (
      <AppPage title={loadError ? 'Unable to open records' : 'Opening your tracker'}>
        {loadError ? (
          <ActionButton title="Try again" icon="refresh-cw" onPress={retryLoad} />
        ) : (
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Loading your saved sales…</Text>
        )}
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="AIRTIME & DATA"
      title="Overview"
      subtitle="Your sales, kept in one place."
      hasTabs
    >
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroTop}>
          <View style={styles.heroLabelRow}>
            <Feather name="bar-chart-2" size={15} color={colors.primaryForeground} />
            <Text style={[styles.heroLabel, { color: colors.primaryForeground }]}>TODAY'S SALES</Text>
          </View>
          <View style={[styles.heroMark, { backgroundColor: colors.accent }]}>
            <Feather name="activity" size={18} color={colors.accentForeground} />
          </View>
        </View>
        <Text style={[styles.heroAmount, { color: colors.primaryForeground }]}>{formatMoney(getSalesTotal(todaySales))}</Text>
        <View style={styles.heroFoot}>
          <Text style={[styles.heroFootText, { color: colors.primaryForeground }]}>
            {todaySales.length} {todaySales.length === 1 ? 'sale' : 'sales'} recorded today
          </Text>
          <View style={[styles.heroDot, { backgroundColor: colors.accent }]} />
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="repeat" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{sales.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>All sales</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.accent }]}>
            <Feather name="users" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{customers.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Customers</Text>
        </View>
      </View>

      <View style={styles.buttonStack}>
        <ActionButton title="Record a sale" icon="plus" onPress={() => router.push('/add-sale')} testID="record-sale-button" />
        <ActionButton title="Add a customer" icon="user-plus" secondary onPress={() => router.push('/add-customer')} />
      </View>

      <View style={styles.recentSection}>
        <SectionHeading
          title="Recent sales"
          action={
            <Pressable onPress={() => router.push('/(tabs)/transactions')} accessibilityRole="button">
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          }
        />
        {recentSales.length ? (
          <View style={styles.list}>
            {recentSales.map((sale) => (
              <SaleRow
                key={sale.id}
                sale={sale}
                customer={customers.find((customer) => customer.id === sale.customerId)}
                onPress={() => router.push({ pathname: '/customer/[id]', params: { id: sale.customerId } })}
              />
            ))}
          </View>
        ) : (
          <View style={[uiStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your sales will show up here after your first entry.</Text>
          </View>
        )}
      </View>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 26, padding: 21, gap: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1 },
  heroMark: { height: 36, width: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heroAmount: { fontFamily: 'Inter_700Bold', fontSize: 36, letterSpacing: -1.1 },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroFootText: { fontFamily: 'Inter_500Medium', fontSize: 12, opacity: 0.85 },
  heroDot: { width: 6, height: 6, borderRadius: 3 },
  quickStats: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, minHeight: 125, borderRadius: 22, borderWidth: 1, padding: 15, gap: 8 },
  statIcon: { width: 32, height: 32, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.4 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  buttonStack: { gap: 10 },
  recentSection: { gap: 14 },
  list: { gap: 9 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
});
