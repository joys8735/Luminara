import { useEffect, useState } from "react";

export function useProjectWallet(publicKey?: string | null) {
  const [projectWalletAddress, setProjectWalletAddress] = useState<string | undefined>(undefined);
  const [projectBnb, setProjectBnb] = useState<number>(0); // ЗМІНА: projectSol → projectBnb
  const [projectUsdt, setProjectUsdt] = useState<number>(0);

  const persist = (addr: string | undefined, bnb: number, usdt: number) => { // ЗМІНА
    if (!publicKey) return;

    const kAddr = `svt_project_wallet_${publicKey}`;
    const kBnb = `svt_project_bnb_${publicKey}`; // ЗМІНА
    const kUsdt = `svt_project_usdt_${publicKey}`;

    if (addr) localStorage.setItem(kAddr, addr);
    else localStorage.removeItem(kAddr);

    localStorage.setItem(kBnb, String(bnb)); // ЗМІНА
    localStorage.setItem(kUsdt, String(usdt));
  };

  useEffect(() => {
    if (!publicKey) {
      setProjectWalletAddress(undefined);
      setProjectBnb(0); // ЗМІНА
      setProjectUsdt(0);
      return;
    }

    const addr = localStorage.getItem(`svt_project_wallet_${publicKey}`) || undefined;
    setProjectWalletAddress(addr);

    setProjectBnb(Number(localStorage.getItem(`svt_project_bnb_${publicKey}`) || 0)); // ЗМІНА
    setProjectUsdt(Number(localStorage.getItem(`svt_project_usdt_${publicKey}`) || 0));
  }, [publicKey]);

  const setAddress = (addr?: string) => {
    const next = addr || undefined;
    setProjectWalletAddress(next);
    persist(next, projectBnb, projectUsdt); // ЗМІНА
  };

  const setBnb = (bnb: number) => { // ЗМІНА
    const next = Number.isFinite(bnb) ? bnb : 0;
    setProjectBnb(next);
    persist(projectWalletAddress, next, projectUsdt);
  };

  const setUsdt = (usdt: number) => {
    const next = Number.isFinite(usdt) ? usdt : 0;
    setProjectUsdt(next);
    persist(projectWalletAddress, projectBnb, next); // ЗМІНА
  };

  return { projectWalletAddress, projectBnb, projectUsdt, setAddress, setBnb, setUsdt }; // ЗМІНА
}