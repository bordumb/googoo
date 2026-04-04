import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Services } from "./types";

const ServicesContext = createContext<Services | null>(null);

export const IS_MOCK = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === "true";

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (!ctx) {
    throw new Error("useServices() must be used within a <ServiceProvider>");
  }
  return ctx;
}

interface ServiceProviderProps {
  children: ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  const services = useMemo<Services>(() => {
    if (IS_MOCK) {
      // Lazy import — mock module is only loaded when IS_MOCK is true.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createMockServices } = require("./mock") as {
        createMockServices: () => Services;
      };
      return createMockServices();
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createRealServices } = require("./real") as {
      createRealServices: () => Services;
    };
    return createRealServices();
  }, []);

  return (
    <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
  );
}
