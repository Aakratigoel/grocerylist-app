"use client";

import { useEffect, useState } from "react";
import {
  Client,
  DraftOrder,
  EMPTY_DRAFT,
  GroceryList,
  HouseholdGroceryList,
  HouseholdItem,
  Ingredient,
  MenuItem,
  Order,
  STORE_UPDATE_EVENT,
  ensureSeed,
  readClients,
  readDraftOrder,
  readGroceryLists,
  readHouseholdList,
  readHouseholdLists,
  readIngredients,
  readMenuItems,
  readOrders,
  writeClients,
  writeDraftOrder,
  writeGroceryLists,
  writeHouseholdList,
  writeHouseholdLists,
  writeIngredients,
  writeMenuItems,
  writeOrders,
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

  const update = (next: T) => {
    setValue(next);
    writer(next);
  };

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

export function useHouseholdList() {
  return useLocalCollection<HouseholdItem[]>(
    readHouseholdList,
    writeHouseholdList,
    [],
  );
}

export function useHouseholdLists() {
  return useLocalCollection<HouseholdGroceryList[]>(
    readHouseholdLists,
    writeHouseholdLists,
    [],
  );
}
