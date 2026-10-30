import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AppPage, BackButton, Field, Notice, uiStyles } from '@/components/AppUI';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function AddCustomerScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addCustomer, ready, loadError, retryLoad, persistenceError } = useAppData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!ready || saving) return;
    if (!name.trim()) {
      setError('Enter a customer name to continue.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await addCustomer({ name, phone });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/customers');
    } catch {
      Alert.alert('Customer not saved', 'Your device could not save this customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <AppPage title={loadError ? 'Unable to open records' : 'Opening customer form'}>
        {loadError ? (
          <ActionButton title="Try again" icon="refresh-cw" onPress={retryLoad} />
        ) : (
          <Text style={[styles.introText, { color: colors.mutedForeground }]}>Loading your saved records…</Text>
        )}
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="CUSTOMER LIST"
      title="Add a customer"
      subtitle="Keep their contact details with their sales."
      keyboardAware
      action={<BackButton onPress={() => router.back()} />}
    >
      <View style={styles.form}>
        <View style={[styles.intro, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.introTitle, { color: colors.secondaryForeground }]}>A name is all you need</Text>
          <Text style={[styles.introText, { color: colors.mutedForeground }]}>You can add a phone number now or leave it blank.</Text>
        </View>
        <Field
          label="Customer name"
          value={name}
          onChangeText={(value) => { setName(value); setError(''); }}
          placeholder="e.g. Amara Okafor"
          autoCapitalize="words"
          returnKeyType="next"
          testID="customer-name-input"
        />
        <Field
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. 0801 234 5678"
          keyboardType="phone-pad"
          autoComplete="tel"
          testID="customer-phone-input"
        />
        {error ? <Text style={[uiStyles.errorText, { color: colors.destructive }]}>{error}</Text> : null}
        {persistenceError ? <Notice>{persistenceError}</Notice> : null}
        <ActionButton title="Save customer" icon="check" onPress={save} loading={saving} disabled={!ready} testID="save-customer-button" />
      </View>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  form: { gap: 18 },
  intro: { padding: 17, gap: 5, borderRadius: 18 },
  introTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  introText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
});
