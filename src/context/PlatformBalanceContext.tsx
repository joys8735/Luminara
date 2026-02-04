import React, { createContext, useContext, useState } from "react";

interface PlatformBalanceContextType {
  balance: number;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
}

const PlatformBalanceContext = createContext<PlatformBalanceContextType | null>(null);

export function PlatformBalanceProvider({ children }) {
  const [balance, setBalance] = useState(0);

  const deposit = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const withdraw = (amount: number) => {
    if (amount > balance) return false;
    setBalance(prev => prev - amount);
    return true;
  };

  return (
    <PlatformBalanceContext.Provider value={{ balance, deposit, withdraw }}>
      {children}
    </PlatformBalanceContext.Provider>
  );
}

export const usePlatformBalance = () => {
  const ctx = useContext(PlatformBalanceContext);
  if (!ctx) throw new Error("usePlatformBalance must be inside provider");
  return ctx;
};
