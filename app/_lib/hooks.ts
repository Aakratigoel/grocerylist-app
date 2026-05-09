"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Client,
  DEFAULT_SETTINGS,
  DraftOrder,
  EMPTY_DRAFT,
  GroceryList,
  Ingredient,
  InventoryRecord,
  MenuItem,
  Order,
  STORE_UPDATE_EVENT,
  Settings,
  ensureSeed,
  readClients,
  readDraftOrder,
  readGroceryLists,
  readIngredients,
  readInventory,
  readMenuItems,
  readOrders,
  readSettings,
  writeClients,
  writeDraftOrder,
  writeGroceryLists,
  writeIngredients,
  writeInventory,
  writeMenuItems,
  writeOrders,
  writeSettings,
} from "./store";

function useLocalCollection<T>(
  reader: () => T,
  writer: (next: T) => void,
  initial: T,
): [T, (next: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureSeed();
    setValue(reader());
    setHydrated(true);

    const handleUpdate = () => setValue(reader());
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      writer(next);
    },
    [writer],
  );

  return [value, update, hydrated];
}

export function useMenuItems() {
  return useLocalCollection<MenuItem[]>(readMenuItems, writeMenuItems, []);
}

export function useIngredients() {
  return useLocalCollection<Ingredient[]>(readIngredients, writeIngredients, []);
}

export function useDraftOrder() {
  return useLocalCollection<DraftOrder>(readDraftOrder, writeDraftOrder, EMPTY_DRAFT);
}

export function useGroceryLists() {
  return useLocalCollection<GroceryList[]>(readGroceryLists, writeGroceryLists, []);
}

export function useClients() {
  return useLocalCollection<Client[]>(readClients, writeClients, []);
}

export function useOrders() {
  return useLocalCollection<Order[]>(readOrders, writeOrders, []);
}

export function useInventory() {
  return useLocalCollection<InventoryRecord[]>(
    readInventory,
    writeInventory,
    [],
  );
}

export function useSettings() {
  return useLocalCollection<Settings>(
    readSettings,
    writeSettings,
    DEFAULT_SETTINGS,
  );
}
