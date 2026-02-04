import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { WalletConnectModal } from "./WalletConnectModal";

export function WalletConnect() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Connect Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex relative 
  bg-blue-500/20 
  backdrop-blur-xl 
  border border-blue-400/50 
  text-white 
  px-2 py-3 
  rounded-lg 
  shadow-[0_0_10px_rgba(59,130,246,0.5)]
  hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]
  hover:bg-blue-500/30 
  transition-all duration-300  items-center h-9 gap-2 px-4 py-2.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs"
      >
        <Wallet className="h-4 w-4 " />
        <span>Connect Wallet</span>
      </button>

      {/* Reuse the same modal everywhere */}
      <WalletConnectModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default WalletConnect;
