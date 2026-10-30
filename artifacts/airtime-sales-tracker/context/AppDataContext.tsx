import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SaleType = 'airtime' | 'data';
export type Network = 'MTN' | 'Airtel' | 'Glo' | '9mobile';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  customerId: string;
  type: SaleType;
  network: Network;
  amount: number;
  dataPlan: string;
  createdAt: string;
}

interface Store {
  customers: Customer[];
  sales: Sale[];
}

interface AppDataContextValue extends Store {
  ready: boolean;
  loadError: string | null;
  persistenceError: string | null;
  retryLoad: () => void;
  addCustomer: (input: { name: string; phone: string }) => Promise<Customer>;
  addSale: (
    input: Omit<Sale, 'id' | 'createdAt'>,
  ) => Promise<Sale>;
  updateSale: (
    id: string,
    input: Omit<Sale, 'id' | 'createdAt'>,
  ) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
}

const STORAGE_KEY = '@airtime-sales-tracker/data-v1';
const AppDataContext = createContext<AppDataContextValue | null>(null);
const emptyStore: Store = { customers: [], sales: [] };

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<Store>(emptyStore);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const storeRef = useRef<Store>(emptyStore);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setReady(false);
    setLoadError(null);
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (
            !parsed ||
            typeof parsed !== 'object' ||
            !Array.isArray((parsed as Store).customers) ||
            !Array.isArray((parsed as Store).sales)
          ) {
            throw new Error('Saved records could not be read.');
          }
          storeRef.current = parsed as Store;
          setStore(parsed as Store);
        } else {
          storeRef.current = emptyStore;
          setStore(emptyStore);
        }
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setLoadError('Your saved records could not be loaded. Try again.');
        }
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const commit = useCallback(
    (update: (current: Store) => Store) =>
      new Promise<void>((resolve, reject) => {
        writeQueue.current = writeQueue.current
          .then(async () => {
            const next = update(storeRef.current);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            storeRef.current = next;
            setStore(next);
            setPersistenceError(null);
            resolve();
          })
          .catch((error: unknown) => {
            setPersistenceError(
              'This change could not be saved. Check your device storage and try again.',
            );
            reject(error);
          });
      }),
    [],
  );

  const addCustomer = useCallback(
    async ({ name, phone }: { name: string; phone: string }) => {
      const customer: Customer = {
        id: createId(),
        name: name.trim(),
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
      };
      await commit((current) => ({
        ...current,
        customers: [customer, ...current.customers],
      }));
      return customer;
    },
    [commit],
  );

  const addSale = useCallback(
    async (input: Omit<Sale, 'id' | 'createdAt'>) => {
      const sale: Sale = {
        ...input,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      await commit((current) => ({
        ...current,
        sales: [sale, ...current.sales],
      }));
      return sale;
    },
    [commit],
  );

  const updateSale = useCallback(
    async (id: string, input: Omit<Sale, 'id' | 'createdAt'>) => {
      let updatedSale: Sale | null = null;
      await commit((current) => {
        const existingSale = current.sales.find((sale) => sale.id === id);
        if (!existingSale) {
          throw new Error('This sale could not be found.');
        }
        updatedSale = { ...existingSale, ...input };
        return {
          ...current,
          sales: current.sales.map((sale) =>
            sale.id === id ? updatedSale! : sale,
          ),
        };
      });
      if (!updatedSale) {
        throw new Error('This sale could not be updated.');
      }
      return updatedSale;
    },
    [commit],
  );

  const deleteSale = useCallback(
    async (id: string) => {
      await commit((current) => {
        if (!current.sales.some((sale) => sale.id === id)) {
          throw new Error('This sale could not be found.');
        }
        return {
          ...current,
          sales: current.sales.filter((sale) => sale.id !== id),
        };
      });
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      ...store,
      ready,
      loadError,
      persistenceError,
      retryLoad: () => setLoadAttempt((attempt) => attempt + 1),
      addCustomer,
      addSale,
      updateSale,
      deleteSale,
    }),
    [store, ready, loadError, persistenceError, addCustomer, addSale, updateSale, deleteSale],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider.');
  }
  return context;
}
