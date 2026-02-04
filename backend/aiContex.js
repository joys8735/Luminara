export function buildAIContext({ user, wallet }) {
  return {
    platform: {
      name: "Web3 Identity",
      network: "BSC Testnet",
      chainId: 97,
      nativeToken: "tBNB",
      explorer: "https://testnet.bscscan.com",
      rules: [
        "This is TESTNET only",
        "Funds are not real",
        "Never treat balances as mainnet assets"
      ]
    },

    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },

    wallet: wallet
      ? {
          connected: true,
          address: wallet.address,
          balances: wallet.balances,
          chainId: wallet.chainId
        }
      : { connected: false }
  };
}
