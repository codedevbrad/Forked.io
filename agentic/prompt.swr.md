# SWR Client-Side Data Fetching Pattern

## Overview

Use SWR (stale-while-revalidate) hooks to fetch data client-side in React components instead of fetching on the server and passing data down as props. This pattern enables automatic rehydration, better UX with loading states, and automatic cache invalidation.

## Core Principles

1. **Client-Side Fetching**: Data is fetched in client components using SWR hooks, not in server components
2. **Automatic Rehydration**: SWR automatically revalidates and updates data when mutations occur
3. **State Management**: Components handle loading, error, and empty states internally
4. **Cache Invalidation**: Call `mutate()` after mutations to refresh the data

## Architecture Pattern

### 1. SWR Hook Structure

Create a hook in `src/domains/{domain}/_contexts/use{Resource}.ts`:

"use client";

import useSWR from "swr";
import { get{Resource}Action } from "../db";

export function use{Resource}() {
  const fetcher = () => get{Resource}Action();
  const { data, error, isLoading, mutate } = useSWR("{resource-key}", fetcher);
  return { data, error, isLoading, mutate };
}
