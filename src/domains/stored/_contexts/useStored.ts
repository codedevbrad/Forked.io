"use client";

import useSWR from "swr";
import { getStoredAction, getStoredLocationAction } from "../db";

export function useStored() {
  const fetcher = () => getStoredAction();
  const { data, error, isLoading, mutate } = useSWR("stored", fetcher);
  return { data, error, isLoading, mutate };
}

export function useStoredLocation(id: string) {
  const fetcher = () => getStoredLocationAction(id);
  const { data, error, isLoading, mutate } = useSWR(id ? `stored-${id}` : null, fetcher);
  return { data, error, isLoading, mutate };
}
