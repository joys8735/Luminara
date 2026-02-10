// supabase/functions/sync-predictions/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { ethers } from 'https://esm.sh/ethers@6.7.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Конфігурація
const PREDICTIONS_ABI = [...]; // ABI з кроку 2
const PREDICTIONS_ADDRESS = Deno.env.get('PREDICTIONS_ADDRESS')!;
const RPC_URL = Deno.env.get('BSC_RPC_URL')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PREDICTIONS_ADDRESS, PREDICTIONS_ABI, provider);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Синхронізація нових прогнозів
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(latestBlock - 10000, 0); // Останні 10к блоків

    // Отримуємо події
    const events = await contract.queryFilter('PredictionCreated', fromBlock, latestBlock);
    
    for (const event of events) {
      const { predictionId, creator, title, lockTime, endTime, entryFee } = event.args;
      
      // Перевіряємо чи вже є в базі
      const { data: existing } = await supabase
        .from('predictions')
        .select('id')
        .eq('prediction_id', predictionId.toString())
        .single();
      
      if (!existing) {
        // Отримуємо повну інформацію про прогноз
        const prediction = await contract.predictions(predictionId);
        
        // Знаходимо profile_id за адресою
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', creator.toLowerCase())
          .single();
        
        // Додаємо в базу
        await supabase.from('predictions').insert({
          prediction_id: predictionId.toString(),
          title: prediction.title,
          description: prediction.description,
          category: prediction.category,
          resolution_source: prediction.resolutionSource,
          entry_fee: ethers.formatEther(prediction.entryFee),
          min_bet: ethers.formatEther(prediction.minBet),
          max_bet: ethers.formatEther(prediction.maxBet),
          lock_time: new Date(Number(prediction.lockTime) * 1000),
          end_time: new Date(Number(prediction.endTime) * 1000),
          status: 'open',
          creator_address: creator,
          creator_profile_id: profile?.id,
          contract_address: PREDICTIONS_ADDRESS,
          transaction_hash: event.transactionHash,
          block_number: event.blockNumber,
          created_at: new Date(Number(prediction.createdAt) * 1000)
        });
      }
    }

    // Синхронізація ставок
    const betEvents = await contract.queryFilter('BetPlaced', fromBlock, latestBlock);
    
    for (const event of betEvents) {
      const { predictionId, better, amount } = event.args;
      
      // Перевіряємо чи вже є ставка
      const { data: existing } = await supabase
        .from('prediction_bets')
        .select('id')
        .eq('transaction_hash', event.transactionHash)
        .single();
      
      if (!existing) {
        // Знаходимо profile_id
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', better.toLowerCase())
          .single();
        
        // Додаємо ставку
        await supabase.from('prediction_bets').insert({
          prediction_id: predictionId.toString(),
          better_address: better,
          better_profile_id: profile?.id,
          amount: ethers.formatEther(amount),
          asset: 'BNB', // або визначаємо з події
          transaction_hash: event.transactionHash,
          block_number: event.blockNumber,
          timestamp: new Date(Number(event.args.timestamp) * 1000)
        });
        
        // Оновлюємо статистику прогнозу
        await supabase.rpc('update_prediction_stats', {
          pred_id: predictionId.toString()
        });
      }
    }

    // Синхронізація завершених прогнозів
    const settledEvents = await contract.queryFilter('PredictionSettled', fromBlock, latestBlock);
    
    for (const event of settledEvents) {
      const { predictionId, result, resolvedValue } = event.args;
      
      await supabase
        .from('predictions')
        .update({
          status: 'settled',
          result: result === 0 ? 'up' : result === 1 ? 'down' : 'draw',
          resolved_value: resolvedValue.toString(),
          resolved_at: new Date()
        })
        .eq('prediction_id', predictionId.toString());
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sync completed',
        predictions_synced: events.length,
        bets_synced: betEvents.length,
        settled_synced: settledEvents.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});