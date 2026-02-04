import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, AlertTriangle, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
interface InvestmentModalProps {
  project: any;
  onClose: () => void;
}
const InvestmentModal = ({
  project,
  onClose
}: InvestmentModalProps) => {
  const {
    balance
  } = useWallet();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('SOL');
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const minInvestment = 0.1; // SOL
  const maxInvestment = 10; // SOL
  const tokensToReceive = amount ? parseFloat(amount) / project.price : 0;
  const isValidAmount = amount && parseFloat(amount) >= minInvestment && parseFloat(amount) <= maxInvestment && parseFloat(amount) <= balance;
  const handleAmountChange = e => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value))) {
      setAmount(value);
    }
  };
  const handleMaxClick = () => {
    setAmount(Math.min(balance, maxInvestment).toString());
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (isValidAmount) {
      setStep(2);
    }
  };
  const handleConfirm = () => {
    // In a real app, this would call a smart contract
    setTimeout(() => {
      setIsSuccess(true);
      // Close modal after success display
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1500);
  };
  // Calculate vesting schedule (example)
  const vestingSchedule = [{
    date: '2023-12-25',
    percentage: 20
  }, {
    date: '2024-01-25',
    percentage: 20
  }, {
    date: '2024-02-25',
    percentage: 20
  }, {
    date: '2024-03-25',
    percentage: 20
  }, {
    date: '2024-04-25',
    percentage: 20
  }];
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <X className="h-6 w-6" />
        </button>
        {isSuccess ? <div className="text-center py-8">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Investment Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You have successfully invested {amount} {paymentMethod} in{' '}
              {project.name}.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will receive {tokensToReceive.toLocaleString()}{' '}
              {project.symbol} tokens according to the vesting schedule.
            </p>
          </div> : <>
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-lg overflow-hidden mr-4">
                <img src={project.logo} alt={project.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Invest in {project.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  ${project.symbol} • ${project.price} per token
                </p>
              </div>
            </div>
            {step === 1 && <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method
                    </label>
                    <select id="payment-method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Investment Amount ({paymentMethod})
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input type="text" name="amount" id="amount" value={amount} onChange={handleAmountChange} className="block w-full pr-16 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0.00" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button type="button" onClick={handleMaxClick} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
                          MAX
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Min: {minInvestment} {paymentMethod}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Max: {maxInvestment} {paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calculator className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Investment Summary
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Amount
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {amount || '0'} {paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Token Price
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          ${project.price}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tokens to Receive
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {tokensToReceive.toLocaleString()} {project.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isValidAmount && amount && <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 mr-3" />
                        <div>
                          {parseFloat(amount) < minInvestment && <p className="text-sm text-amber-700 dark:text-amber-300">
                              Amount is below minimum investment of{' '}
                              {minInvestment} {paymentMethod}.
                            </p>}
                          {parseFloat(amount) > maxInvestment && <p className="text-sm text-amber-700 dark:text-amber-300">
                              Amount exceeds maximum investment of{' '}
                              {maxInvestment} {paymentMethod}.
                            </p>}
                          {parseFloat(amount) > balance && <p className="text-sm text-amber-700 dark:text-amber-300">
                              Amount exceeds your balance of {balance}{' '}
                              {paymentMethod}.
                            </p>}
                        </div>
                      </div>
                    </div>}
                  <button type="submit" disabled={!isValidAmount} className={`w-full py-3 px-4 rounded-lg font-medium ${!isValidAmount ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'}`}>
                    Continue
                  </button>
                </div>
              </form>}
            {step === 2 && <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Vesting Schedule
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Your tokens will be released according to the following
                    schedule:
                  </p>
                  <div className="space-y-2">
                    {vestingSchedule.map((item, index) => <div key={index} className="flex justify-between">
                        <span className="text-xs text-blue-700 dark:text-blue-300">
                          {item.date}
                        </span>
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                          {(tokensToReceive * (item.percentage / 100)).toLocaleString()}{' '}
                          {project.symbol} ({item.percentage}%)
                        </span>
                      </div>)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Investment
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Project
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Investment
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {amount} {paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tokens to Receive
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {tokensToReceive.toLocaleString()} {project.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button type="button" onClick={() => setStep(1)} className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Back
                  </button>
                  <button type="button" onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                    Confirm Investment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>}
          </>}
      </div>
    </div>;
};
export default InvestmentModal;