// supabase/functions/vault-sync/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Контракт ABI (скорочений)
const VAULT_ABI = [
  "function createVault() external returns (address)",
  "function depositBNB() external payable",
  "function depositUSDT(uint256 amount) external",
  "function withdrawBNB(uint256 amount) external",
  "function withdrawUSDT(uint256 amount) external",
  "function getUserVault(address user) external view returns (uint256 bnbBalance, uint256 usdtBalance, uint256 totalDeposited, uint256 totalWithdrawn, bool exists)",
  "event VaultCreated(address indexed user, address indexed vaultAddress)",
  "event Deposited(address indexed user, address indexed token, uint256 amount, uint256 fee)",
  "event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 fee)"
];

// Конфігурація
const CONTRACT_ADDRESS = '0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const USDT_ADDRESS = '0x5d842eE37D3C5D3F34BFaB7824d6dC9149d83438';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { operation, data } = await req.json();
    
    switch (operation) {
      case 'sync_vault':
        return await syncVault(supabaseClient, data.user_id, data.tx_hash);
      case 'process_deposit':
        return await processDeposit(supabaseClient, data);
      case 'process_withdrawal':
        return await processWithdrawal(supabaseClient, data);
      case 'get_balance':
        return await getOnChainBalance(data.user_address);
      default:
        throw new Error('Unknown operation');
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncVault(supabase: any, userId: string, txHash?: string) {
  try {
    // Отримуємо vault з БД
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (vaultError || !vault) {
      return new Response(JSON.stringify({ error: 'Vault not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Підключаємось до контракту
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, VAULT_ABI, provider);

    // Отримуємо баланс з блокчейну
    const [bnbBalance, usdtBalance, totalDeposited, totalWithdrawn, exists] = 
      await contract.getUserVault(userId);

    // Конвертуємо з Wei
    const bnbBalanceEth = ethers.formatEther(bnbBalance);
    const usdtBalanceFormatted = ethers.formatUnits(usdtBalance, 6); // USDT має 6 decimals
    const totalDepositedFormatted = ethers.formatEther(totalDeposited);
    const totalWithdrawnFormatted = ethers.formatEther(totalWithdrawn);

    // Оновлюємо БД
    const { error: updateError } = await supabase
      .from('vaults')
      .update({
        bnb_balance: parseFloat(bnbBalanceEth),
        usdt_balance: parseFloat(usdtBalanceFormatted),
        total_deposited: parseFloat(totalDepositedFormatted),
        total_withdrawn: parseFloat(totalWithdrawnFormatted),
        updated_at: new Date().toISOString()
      })
      .eq('id', vault.id);

    if (updateError) throw updateError;

    // Записуємо транзакцію синхронізації
    if (txHash) {
      await supabase
        .from('vault_transactions')
        .insert({
          vault_id: vault.id,
          type: 'sync',
          asset: 'BNB',
          amount: parseFloat(bnbBalanceEth),
          fee: 0,
          net_amount: parseFloat(bnbBalanceEth),
          status: 'completed',
          tx_hash: txHash,
          on_chain: true,
          from_address: userId,
          to_address: CONTRACT_ADDRESS,
          metadata: { operation: 'sync' }
        });
    }

    return new Response(JSON.stringify({
      success: true,
      vault: {
        ...vault,
        bnb_balance: parseFloat(bnbBalanceEth),
        usdt_balance: parseFloat(usdtBalanceFormatted)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    throw new Error(`Sync failed: ${error.message}`);
  }
}

async function processDeposit(supabase: any, depositData: any) {
  const { user_id, asset, amount, tx_hash, from_address } = depositData;
  
  try {
    // Отримуємо vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (vaultError) throw vaultError;

    // Отримуємо комісію
    const { data: feeData } = await supabase
      .from('platform_fees')
      .select('fee_percent')
      .eq('fee_type', 'deposit')
      .eq('is_active', true)
      .single();

    const feePercent = feeData?.fee_percent || 0.1;
    const feeAmount = (amount * feePercent) / 100;
    const netAmount = amount - feeAmount;

    // Записуємо транзакцію
    const { data: transaction, error: txError } = await supabase
      .from('vault_transactions')
      .insert({
        vault_id: vault.id,
        type: 'deposit',
        asset: asset.toUpperCase(),
        amount: amount,
        fee: feeAmount,
        net_amount: netAmount,
        status: 'completed',
        tx_hash: tx_hash,
        on_chain: true,
        from_address: from_address,
        to_address: vault.vault_address || CONTRACT_ADDRESS,
        metadata: { 
          fee_percent: feePercent,
          method: 'blockchain_deposit'
        }
      })
      .select()
      .single();

    if (txError) throw txError;

    // Оновлюємо баланс vault
    const balanceField = asset.toLowerCase() + '_balance';
    const { error: updateError } = await supabase
      .from('vaults')
      .update({
        [balanceField]: vault[balanceField] + netAmount,
        total_deposited: vault.total_deposited + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', vault.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      transaction,
      fee_applied: feeAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    throw new Error(`Deposit processing failed: ${error.message}`);
  }
}

async function getOnChainBalance(userAddress: string) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, VAULT_ABI, provider);

    const [bnbBalance, usdtBalance] = await contract.getBalances(userAddress);
    
    return new Response(JSON.stringify({
      bnb_balance: ethers.formatEther(bnbBalance),
      usdt_balance: ethers.formatUnits(usdtBalance, 6),
      user_address: userAddress
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    throw new Error(`Failed to get on-chain balance: ${error.message}`);
  }
}