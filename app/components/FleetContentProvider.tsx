"use client";

import { createContext, useContext } from "react";
import { CODED_NAP } from "../lib/fleet/coded";
import type { Nap } from "../lib/fleet/types";

export type PublicFleet = {
  active: boolean;
  version: string;
  nap: Nap;
};

const CODED: PublicFleet = {
  active: false,
  version: "NMG01:coded",
  nap: CODED_NAP,
};

const FleetContentContext = createContext<PublicFleet>(CODED);

export default function FleetContentProvider({
  value,
  children,
}: {
  value: PublicFleet;
  children: React.ReactNode;
}) {
  return <FleetContentContext.Provider value={value}>{children}</FleetContentContext.Provider>;
}

export function useFleetContent(): PublicFleet {
  return useContext(FleetContentContext);
}
