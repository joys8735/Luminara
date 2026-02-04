// utils/constants.ts
export const CONTRACT_ADDRESSES = {
  PREMIUM_SUBSCRIPTION: '0x6ff1E7760266004b5Fce914A4f43fe86819693dD', // Твій контракт
  USDT: '0x5d842eE37D3C5D3F34BFaB7824d6dC9149d83438', // USDT на BSC Mainnet
};

// USDT ABI (мінімальний для approve)
export const USDT_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
];