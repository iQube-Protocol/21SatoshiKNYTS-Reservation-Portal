import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

interface ReservationFormProps {
  fullPrice: number;
  shardPrice: number;
  fullSupply: number;
  shardSupply: number;
}

export default function ReservationForm({ 
  fullPrice, 
  shardPrice, 
  fullSupply, 
  shardSupply,
  saleIsActive
}: ReservationFormProps) {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'full' | 'shard' | null>(null);
  const [referrerAddress, setReferrerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for referrer in URL parameters
  useEffect(() => {
    if (router.query.ref && typeof router.query.ref === 'string') {
      setReferrerAddress(router.query.ref);
    }
  }, [router.query.ref]);

  // Contract writes for minting with referrer
  const { write: mintFull, data: fullTx } = useContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as any,
    abi: REFERRAL_CONTRACT_ABI as any,
    functionName: referrerAddress && ethers.isAddress(referrerAddress) ? 'mintFullWithReferrer' : 'mintFull',
    args: referrerAddress && ethers.isAddress(referrerAddress) ? [1, referrerAddress] : [1],
    value: ethers.parseEther(fullPrice.toString()),
  });

  const { write: mintShard, data: shardTx } = useContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as any,
    abi: REFERRAL_CONTRACT_ABI as any,
    functionName: 'mintShard',
    args: [1],
    value: ethers.parseEther(shardPrice.toString()),
  });

  const { isLoading: isFullTxLoading, isSuccess: isFullTxSuccess } = useWaitForTransaction({
    hash: fullTx?.hash,
  });

  const { isLoading: isShardTxLoading, isSuccess: isShardTxSuccess } = useWaitForTransaction({
    hash: shardTx?.hash,
  });

  const handleMint = async (type: 'full' | 'shard') => {
    if (!isConnected || !saleIsActive) return;
    setIsLoading(true);
    try {
      if (type === 'full') {
        await mintFull?.();
      } else {
        await mintShard?.();
      }
    } catch (error) {
      console.error('Minting failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAddress = (addr: string) => {
    return addr === '' || ethers.isAddress(addr);
  };

  return (
    <div className="bg-white/5 p-8 rounded-lg">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Reserve Your SatKNYT
      </h2>

      {/* Referrer Address Input */}
      <div className="mb-8">
        <label className="block text-white mb-2">
          Referrer Address (optional)
        </label>
        <input
          type="text"
          value={referrerAddress}
          onChange={(e) => setReferrerAddress(e.target.value)}
          className={`w-full p-3 rounded-lg bg-black/20 text-white border ${
            isValidAddress(referrerAddress) ? 'border-gray-600' : 'border-red-500'
          }`}
          placeholder="0x... (Enter referrer's wallet address to give them a reward)"
          aria-label="Referrer wallet address"
        />
        {referrerAddress && !isValidAddress(referrerAddress) && (
          <p className="text-red-400 text-sm mt-1">Please enter a valid Ethereum address</p>
        )}
        {referrerAddress && isValidAddress(referrerAddress) && referrerAddress !== '' && (
          <p className="text-green-400 text-sm mt-1">✓ Referrer will receive a free Shard when you mint a Full SatKNYT</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Full Pass Card */}
        <div className="bg-black/50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Full SatKNYT</h3>
          <p className="text-xl text-green-400 mb-4">Price: {fullPrice.toFixed(4)} ETH</p>
          <p className="text-white mb-4">Available: {fullSupply}</p>
          {referrerAddress && isValidAddress(referrerAddress) && referrerAddress !== '' && (
            <p className="text-yellow-400 text-sm mb-4">🎁 Your referrer will get a free Shard!</p>
          )}
          <button
            onClick={() => handleMint('full')}
            disabled={!isConnected || !saleIsActive || isFullTxLoading || fullSupply === 0 || !isValidAddress(referrerAddress)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFullTxLoading ? 'Minting...' : 'Mint Full SatKNYT'}
          </button>
        </div>

        {/* Shard Pass Card */}
        <div className="bg-black/50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Shard Pass</h3>
          <p className="text-xl text-blue-400 mb-4">Price: {shardPrice.toFixed(4)} ETH</p>
          <p className="text-white mb-4">Available: {shardSupply}</p>
          <button
            onClick={() => handleMint('shard')}
            disabled={!isConnected || !saleIsActive || isShardTxLoading || shardSupply === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isShardTxLoading ? 'Minting...' : 'Mint Shard Pass'}
          </button>
        </div>
      </div>

      {!isConnected && (
        <div className="mt-8 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg text-yellow-300 text-center">
          Please connect your wallet to mint
        </div>
      )}

      {!saleIsActive && isConnected && (
        <div className="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center">
          Sale is currently inactive
        </div>
      )}

      {(isFullTxSuccess || isShardTxSuccess) && (
        <div className="mt-8 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-400 text-center">
          🎉 Congratulations! Your SatKNYT reservation has been successfully created.
        </div>
      )}
    </div>
  );
}

const REFERRAL_CONTRACT_ABI = [
  // Write functions
  {
    inputs: [{ internalType: "uint256", name: "quantity", type: "uint256" }],
    name: "mintFull",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" }
    ],
    name: "mintFullWithReferrer",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "quantity", type: "uint256" }],
    name: "mintShard",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
];
