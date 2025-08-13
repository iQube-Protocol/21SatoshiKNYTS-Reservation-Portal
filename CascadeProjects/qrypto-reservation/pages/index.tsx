import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// Contract ABI for the 21 Sats KNYT system
const KNYT_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "MAX_FULL_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SHARD_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REFERRAL_SHARD_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fullMinted",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "shardMinted",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "referralShardsMinted",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "saleIsActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fullPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "shardPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "quantity", "type": "uint256"}],
    "name": "mintFull",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "quantity", "type": "uint256"}],
    "name": "mintShard",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
    "name": "mintReferralShard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ReferralShardMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "CommunityShardMinted",
    "type": "event"
  }
];

export default function Home() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [passType, setPassType] = useState<'full' | 'shard'>('full');
  const [referrerAddress, setReferrerAddress] = useState('');
  const [referralFromUrl, setReferralFromUrl] = useState(false);
  const [email, setEmail] = useState('');
  const [saleIsActive, setSaleIsActive] = useState(false);

  // Contract data state
  const [contractData, setContractData] = useState({
    maxFullSupply: 18,
    maxShardSupply: 21,
    fullMinted: 0,
    shardMinted: 0,
    referralShardsMinted: 0
  });

  const [fullPrice, setFullPrice] = useState(0.01);
  const [shardPrice, setShardPrice] = useState(0.001);

  // UI state
  const [showAvailabilityDetails, setShowAvailabilityDetails] = useState(false);
  const [showReferralDetails, setShowReferralDetails] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Owner interface state
  const [isOwner, setIsOwner] = useState(false);
  const [showOwnerInterface, setShowOwnerInterface] = useState(false);
  const [processingRewards, setProcessingRewards] = useState(false);
  
  // Notification state for persistent messages
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [showNotification, setShowNotification] = useState(false);
  
  // NEW: Blockchain token balance state
  const [userTokenBalance, setUserTokenBalance] = useState({ fullPasses: 0, shards: 0 });
  
  // Hydration fix - prevent server-client mismatch
  const [mounted, setMounted] = useState(false);

  // localStorage helper functions for referral tracking
  const saveReferralData = (userAddress: string, referrerAddress: string, txHash: string, passType: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const referralData = {
        userAddress,
        referrerAddress,
        txHash,
        passType,
        timestamp: new Date().toISOString()
      };
      
      console.log('💾 Attempting to save referral data:', referralData);
      const existingData = JSON.parse(localStorage.getItem('referralData') || '[]');
      existingData.push(referralData);
      localStorage.setItem('referralData', JSON.stringify(existingData));
      console.log('✅ Referral data saved successfully');
    } catch (error) {
      console.error(' Error saving referral data:', error);
    }
  };

  const getReferralData = () => {
    if (typeof window === 'undefined') return [];
    
    try {
      const rawData = localStorage.getItem('referralData');
      const data = JSON.parse(rawData || '[]');
      return data;
    } catch (error) {
      console.error('❌ Error accessing localStorage:', error);
      return [];
    }
  };

  const clearReferralData = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('referralData');
  };

  // NEW: Blockchain event querying functions for Option 3
  const getReferralEventsFromBlockchain = async () => {
    if (!contract) return [];
    
    try {
      console.log('🔍 Querying blockchain for referral events...');
      
      // Get existing localStorage data first
      const existingData = getReferralData();
      console.log(`📋 Found ${existingData.length} existing referral records in localStorage`);
      
      // Query Transfer events to find all mints
      try {
        const transferFilter = contract.filters.Transfer();
        const transferEvents = await contract.queryFilter(transferFilter, 0, 'latest');
        console.log(`📊 Found ${transferEvents.length} Transfer events on blockchain`);
        
        // DETAILED ANALYSIS: Log every Transfer event to understand the discrepancy
        console.log('🔍 DETAILED TRANSFER EVENT ANALYSIS:');
        transferEvents.forEach((event, index) => {
          console.log(`Event ${index + 1}:`, {
            from: event.args.from,
            to: event.args.to,
            tokenId: event.args.tokenId?.toString(),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        });
        
        // Filter only mints (from zero address)
        const mintEvents = transferEvents.filter(event => 
          event.args.from === '0x0000000000000000000000000000000000000000'
        );
        console.log(`🎯 Found ${mintEvents.length} actual MINT events (from zero address)`);
        
        // Analyze each Transfer event to identify potential referral mints
        const newReferralsToAdd = [];
        
        for (const event of mintEvents) {
            try {
              // Check if we already have this transaction in localStorage
              const existingMatch = existingData.find((existing: any) => existing.txHash === event.transactionHash);
              
              if (existingMatch) {
                console.log(`✅ Transaction ${event.transactionHash} already exists with referrer: ${existingMatch.referrerAddress}`);
                // Skip this transaction - we already have it with proper data
                continue;
              }
              
              // Get the transaction details to analyze the function call
              const tx = await event.getTransaction();
              console.log(`🔍 Analyzing transaction: ${event.transactionHash}`);
              console.log(`📋 Transaction data:`, tx.data);
              
              // Only add if localStorage is completely empty (prevents double-counting)
              if (existingData.length === 0) {
                
                // SMART TRANSACTION TYPE DETECTION
                let transactionType = "Unknown";
                let referrerAddress = "BULK_PROCESS";
                let passType = "Full Pass";
                
                // Analyze transaction data to determine type
                if (tx.data.startsWith('0x')) {
                  const methodId = tx.data.slice(0, 10);
                  console.log(`🔍 Method ID: ${methodId}`);
                  
                  // Common method IDs (these would need to match your actual contract)
                  if (methodId === '0x' + 'mintFull'.slice(0, 8)) { // Approximate - would need actual method ID
                    transactionType = "Full Pass Mint";
                    referrerAddress = "BULK_PROCESS"; // Needs referrer assignment
                    passType = "Full Pass";
                  } else if (methodId === '0x' + 'mintShard'.slice(0, 8)) { // Approximate
                    transactionType = "Shard Mint";
                    referrerAddress = "Self-Purchase (No Referrer)"; // No referrer for shard mints
                    passType = "Shard";
                  } else if (methodId === '0x' + 'mintReferralShard'.slice(0, 8)) { // Approximate
                    transactionType = "Referral Reward";
                    console.log(`⏭️ Skipping referral reward distribution: ${event.transactionHash}`);
                    continue; // Skip referral reward distributions - not user transactions
                  }
                }
                
                console.log(`📝 Creating entry for ${transactionType}`);
                
                const newReferralEntry = {
                  userAddress: event.args.to,
                  referrerAddress: referrerAddress,
                  txHash: event.transactionHash,
                  passType: passType,
                  timestamp: new Date().toISOString(),
                  needsVerification: referrerAddress === "BULK_PROCESS", // Only bulk process items need verification
                  source: "blockchain_sync_smart",
                  transactionType: transactionType
                };
                
                newReferralsToAdd.push(newReferralEntry);
                console.log(`✅ Added ${transactionType}:`, newReferralEntry);
              } else {
                console.log(`⏭️ Skipping - localStorage has ${existingData.length} existing entries`);
              }
              
            } catch (txError) {
              console.log(`⚠️ Could not get transaction details for ${event.transactionHash}`);
            }
        }
        
        console.log(`🔍 Found ${newReferralsToAdd.length} NEW transactions that need verification (${transferEvents.length - newReferralsToAdd.length} already exist)`);
        
        return newReferralsToAdd;
        
      } catch (eventError) {
        console.log('⚠️ Transfer events not available:', eventError);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Error querying blockchain events:', error);
      return [];
    }
  };

  // NEW: Combined referral data from localStorage and blockchain
  const getAllReferralData = async () => {
    const localData = getReferralData();
    const blockchainData = await getReferralEventsFromBlockchain();
    
    // Merge and deduplicate based on transaction hash
    const combined = [...localData];
    
    blockchainData.forEach((blockchainItem: any) => {
      const exists = localData.some((localItem: any) => 
        localItem.txHash === blockchainItem.txHash
      );
      if (!exists) {
        combined.push(blockchainItem);
      }
    });
    
    console.log(`📊 Combined referral data: ${localData.length} local + ${blockchainData.length} blockchain = ${combined.length} total`);
    return combined;
  };

  // NEW: Sync referral data from blockchain (recovery function)
  const syncReferralDataFromBlockchain = async () => {
    if (!contract) {
      setNotification('❌ Contract not connected. Click to dismiss.');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }
    
    try {
      console.log('🔄 Syncing referral data from blockchain...');
      setNotification('🔄 Syncing referral data from blockchain...');
      setNotificationType('info');
      setShowNotification(true);
      
      const blockchainData = await getReferralEventsFromBlockchain();
      
      if (blockchainData.length > 0) {
        // Merge with existing localStorage data
        const existingData = getReferralData();
        const mergedData = [...existingData];
        
        blockchainData.forEach((item: any) => {
          const exists = existingData.some((existing: any) => existing.txHash === item.txHash);
          if (!exists) {
            mergedData.push(item);
          }
        });
        
        // Save merged data back to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('referralData', JSON.stringify(mergedData));
        }
        
        console.log(`✅ Synced ${blockchainData.length} referrals from blockchain`);
        setNotification(`✅ Successfully synced ${blockchainData.length} referrals from blockchain! Click to dismiss.`);
        setNotificationType('success');
      } else {
        console.log('ℹ️ No additional referral data found on blockchain');
        setNotification('ℹ️ No additional referral data found on blockchain. Click to dismiss.');
        setNotificationType('info');
      }
    } catch (error) {
      console.error('❌ Error syncing from blockchain:', error);
      setNotification(`❌ Error syncing referral data from blockchain: ${error.message}. Click to dismiss.`);
      setNotificationType('error');
    }
  };

  // Helper function to dismiss notification
  const dismissNotification = () => {
    setShowNotification(false);
    setNotification('');
  };

  // Get count of referrals where current user is the referrer
  const getUserReferralCount = () => {
    if (!address) return 0;
    const referralData = getReferralData();
    return referralData.filter((data: any) => 
      data.referrerAddress.toLowerCase() === address.toLowerCase()
    ).length;
  };

  // NEW: Get user's actual token balance from blockchain
  const getUserTokenBalance = async () => {
    if (!contract || !address) return { fullPasses: 0, shards: 0 };
    
    try {
      // Try balanceOf first (standard ERC-721)
      try {
        const totalBalance = await contract.balanceOf(address);
        console.log(`📊 User ${address} has ${totalBalance} total tokens via balanceOf`);
        
        // For now, return total as full passes (we can enhance this later to distinguish types)
        return { fullPasses: Number(totalBalance), shards: 0 };
      } catch (balanceOfError) {
        console.log('⚠️ balanceOf not available, falling back to Transfer event counting');
        
        // Fallback: Count Transfer events to this address
        const transferFilter = contract.filters.Transfer(null, address);
        const transferEvents = await contract.queryFilter(transferFilter, 0, 'latest');
        
        console.log(`📊 Found ${transferEvents.length} transfers to user ${address}`);
        return { fullPasses: transferEvents.length, shards: 0 };
      }
    } catch (error) {
      console.error('❌ Error getting user token balance:', error);
      return { fullPasses: 0, shards: 0 };
    }
  };

  // Check if connected wallet is the contract owner
  const checkOwnerStatus = async () => {
    if (!contract || !address) {
      setIsOwner(false);
      return;
    }
    
    try {
      const ownerAddress = await contract.owner();
      const isOwnerWallet = ownerAddress.toLowerCase() === address.toLowerCase();
      
      // TEMPORARY: Enable owner interface for testing (remove this in production)
      const testOwnerMode = false; // Set to false in production
      const finalIsOwner = testOwnerMode || isOwnerWallet;
      
      setIsOwner(finalIsOwner);
      console.log('Owner check:', { 
        ownerAddress, 
        connectedAddress: address, 
        isActualOwner: isOwnerWallet,
        testMode: testOwnerMode,
        finalIsOwner 
      });
    } catch (error) {
      console.error('Error checking owner status:', error);
      setIsOwner(false);
    }
  };

  // Process referral rewards (Owner only)
  const processReferralRewards = async () => {
    // IMMEDIATE DEBUG - This should appear no matter what
    console.log('🚨🚨🚨 IMMEDIATE DEBUG: processReferralRewards function called');
    console.log('🚨 DEBUG: Current timestamp:', new Date().toISOString());
    
    // Check critical state variables
    console.log('🔍 CRITICAL STATE CHECK:');
    console.log('  isOwner:', isOwner);
    console.log('  contract exists:', !!contract);
    console.log('  contract object:', contract);
    console.log('  wallet address:', address);
    console.log('  mounted:', mounted);
    
    // Also set a notification to track this
    setNotification(`🚨 FUNCTION CALLED: isOwner=${isOwner}, contract=${!!contract}`);
    setNotificationType('info');
    setShowNotification(true);
    
    if (!isOwner || !contract) {
      console.log('❌❌❌ EARLY EXIT: Access denied - not owner or no contract');
      console.log('  isOwner value:', isOwner);
      console.log('  contract value:', contract);
      setNotification(`❌ EARLY EXIT: isOwner=${isOwner}, contract=${!!contract}. Click to dismiss.`);
      setNotificationType('error');
      setShowNotification(true);
      return;
    }
    
    console.log('✅✅✅ PASSED OWNER CHECK - Continuing...');
    setNotification('✅ PASSED OWNER CHECK - Processing referral rewards...');
    setNotificationType('info');
    setShowNotification(true);

    const referralData = getReferralData();
    console.log('🔍 Referral data for processing:', referralData);
    alert(`🔍 Found ${referralData.length} referral entries`);
    
    if (referralData.length === 0) {
      console.log('❌ No referral data found');
      alert('❌ No referral data found');
      setNotification('❌ No referral data found to process. Click to dismiss.');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }

    console.log('✅ Starting referral reward processing...');
    alert('✅ Starting referral reward processing...');
    setProcessingRewards(true);
    
    // Show processing start notification
    setNotification('🔄 Starting referral reward processing... This may take a few moments.');
    setNotificationType('info');
    setShowNotification(true);
    
    try {
      // Group referrals by referrer address to count how many shards each should get
      const referrerCounts: { [key: string]: number } = {};
      referralData.forEach((data: any) => {
        if (data.passType === 'Full Pass') { // Only Full Pass mints qualify for rewards
          referrerCounts[data.referrerAddress] = (referrerCounts[data.referrerAddress] || 0) + 1;
        }
      });

      console.log('🔍🔍🔍 Processing referral rewards:', referrerCounts);
      console.log('🔍 About to start blockchain transactions...');
      
      // Process each referrer
      for (const [referrerAddress, count] of Object.entries(referrerCounts)) {
        console.log(`🔍 Processing referrer: ${referrerAddress}, count: ${count}`);
        if (count > 0) {
          console.log(`🚀🚀🚀 Minting ${count} referral shards to ${referrerAddress}`);
          console.log('🔍 Contract object before call:', contract);
          console.log('🔍 Contract signer:', contract.signer);
          
          try {
            // Call mintReferralShard function for each referral (one call per shard)
            console.log('📝📝📝 About to call contract.mintReferralShard - MetaMask should prompt now!');
            setNotification(`📝 Minting ${count} shards for ${referrerAddress.slice(0, 6)}...${referrerAddress.slice(-4)}`);
            setNotificationType('info');
            setShowNotification(true);
            
            // Call mintReferralShard once for each shard (contract only accepts 1 shard per call)
            for (let i = 0; i < count; i++) {
              console.log(`📝 Calling mintReferralShard ${i + 1}/${count} for ${referrerAddress}`);
              const tx = await contract.mintReferralShard(referrerAddress);
              console.log(`Transaction ${i + 1}/${count} sent for ${referrerAddress}:`, tx.hash);
              
              // Wait for confirmation before next transaction
              console.log(`⏳ Waiting for transaction ${i + 1}/${count} confirmation...`);
              await tx.wait();
              console.log(`✅ Transaction ${i + 1}/${count} confirmed for ${referrerAddress}`);
            }
            
            console.log(`✅ Successfully minted ${count} referral shards to ${referrerAddress}`);
            setNotification(`✅ Successfully minted ${count} shards for ${referrerAddress.slice(0, 6)}...${referrerAddress.slice(-4)}`);
            setNotificationType('success');
            setShowNotification(true);
            
          } catch (error) {
            console.error(`❌ Failed to mint referral shards to ${referrerAddress}:`, error);
            alert(`❌ Transaction failed: ${error.message || error}`);
            // Show persistent error notification for individual failures
            setNotification(`❌ Failed to process rewards for ${referrerAddress.slice(0, 6)}...${referrerAddress.slice(-4)}: ${error.message || error}. Click to dismiss.`);
            setNotificationType('error');
            setShowNotification(true);
          }
        }
      }
      
      // Show persistent success notification
      setNotification(`✅ Referral reward processing completed successfully! Processed rewards for ${Object.keys(referrerCounts).length} referrer(s). Click to dismiss.`);
      setNotificationType('success');
      setShowNotification(true);
      
      await loadContractData(); // Refresh contract data
      
    } catch (error) {
      console.error('Error processing referral rewards:', error);
      // Show persistent error notification
      setNotification(`❌ Error processing referral rewards: ${error.message || error}. Click to dismiss.`);
      setNotificationType('error');
      setShowNotification(true);
    } finally {
      setProcessingRewards(false);
    }
  };

  // Clean up invalid referral entries (Owner only)
  const cleanupInvalidEntries = () => {
    if (!isOwner) {
      setNotification('❌ Only the contract owner can clean up invalid entries. Click to dismiss.');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }

    const referralData = getReferralData();
    const validEntries = referralData.filter((data: any) => 
      data.referrerAddress !== "Unknown - Needs Manual Verification" && 
      !data.needsVerification
    );
    
    const invalidCount = referralData.length - validEntries.length;
    
    if (invalidCount === 0) {
      setNotification('ℹ️ No invalid entries found to clean up. Click to dismiss.');
      setNotificationType('info');
      setShowNotification(true);
      return;
    }

    // Save cleaned data back to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('referralData', JSON.stringify(validEntries));
    }
    
    console.log(`🧹 Cleaned up ${invalidCount} invalid referral entries`);
    setNotification(`✅ Successfully cleaned up ${invalidCount} invalid referral entries! Click to dismiss.`);
    setNotificationType('success');
    setShowNotification(true);
  };

  // Handle referrer from URL
  useEffect(() => {
    if (mounted && router.query.ref && typeof router.query.ref === 'string') {
      setReferrerAddress(router.query.ref);
      setReferralFromUrl(true);
      setShowManualEntry(true);
    }
  }, [mounted, router.query.ref]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      checkWalletConnection();
    }
  }, []);

  useEffect(() => {
    if (contract) {
      loadContractData();
    }
  }, [contract]);

  // Check owner status when contract and address are available
  useEffect(() => {
    if (contract && address) {
      checkOwnerStatus();
    }
  }, [contract, address]);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          setProvider(provider);
          setSigner(signer);
          setAddress(address);
          setIsConnected(true);
          
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
            KNYT_CONTRACT_ABI,
            signer
          );
          setContract(contract);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setProvider(provider);
        setSigner(signer);
        setAddress(address);
        setIsConnected(true);
        
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          KNYT_CONTRACT_ABI,
          signer
        );
        setContract(contract);
        
        console.log('Wallet connected:', address);
        loadContractData();
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setProvider(null);
    setContract(null);
  };

  // Load contract data
  const loadContractData = async () => {
    if (!contract) return;
    
    try {
      console.log('🔄 Loading contract data from:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
      
      const [
        fullMinted,
        shardMinted,
        referralShardsMinted,
        saleActive
      ] = await Promise.all([
        contract.fullMinted(),
        contract.shardMinted(),
        contract.referralShardsMinted(),
        contract.saleIsActive()
      ]);
      
      const contractState = {
        maxFullSupply: 18, // Hardcoded from contract design
        fullMinted: Number(fullMinted),
        maxShardSupply: 21, // Hardcoded from contract design  
        shardsMinted: Number(shardMinted),
        referralShardsMinted: Number(referralShardsMinted)
      };
      
      // DETAILED CONTRACT STATE LOGGING
      console.log('🏗️ CONTRACT STATE ANALYSIS:');
      console.log('Max Full Supply:', contractState.maxFullSupply);
      console.log('Full Passes Minted:', contractState.fullMinted);
      console.log('Max Shard Supply:', contractState.maxShardSupply);
      console.log('Regular Shards Minted:', contractState.shardsMinted);
      console.log('Referral Shards Minted:', contractState.referralShardsMinted);
      console.log('TOTAL TOKENS MINTED:', contractState.fullMinted + contractState.shardsMinted + contractState.referralShardsMinted);
      console.log('🚀 SALE STATUS:', saleActive ? 'ACTIVE' : 'INACTIVE');
      
      setContractData(contractState);
      setSaleIsActive(saleActive);
      
      // NEW: Load user token balance from blockchain
      if (address) {
        const tokenBalance = await getUserTokenBalance();
        setUserTokenBalance(tokenBalance);
        console.log('✅ User token balance loaded:', tokenBalance);
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      loadContractData();
    }
  }, [contract]);

  // Enhanced minting function with user feedback
  const handleMint = async () => {
    console.log('Attempting to mint:', passType);
    console.log('Contract address:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    console.log('Is connected:', isConnected);
    console.log('User address:', address);
    console.log('Sale is active:', saleIsActive);
    
    if (!isConnected || !contract) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!saleIsActive) {
      alert('Sale is not currently active');
      return;
    }
    
    setIsMinting(true);
    
    try {
      let tx;
      
      if (passType === 'full') {
        const ethValue = ethers.parseEther(fullPrice.toString());
        console.log('ETH value being sent (wei):', ethValue.toString());
        console.log('ETH value being sent (ETH):', ethers.formatEther(ethValue));
        tx = await contract.mintFull(1, { value: ethValue });
      } else {
        console.log('Minting Shard KNYT');
        const ethValue = ethers.parseEther(shardPrice.toString());
        console.log('ETH value being sent (wei):', ethValue.toString());
        console.log('ETH value being sent (ETH):', ethers.formatEther(ethValue));
        tx = await contract.mintShard(1, { value: ethValue });
      }
      
      console.log('Transaction sent:', tx.hash);
      
      // Remove any existing notifications first
      const existingNotifications = document.querySelectorAll('[data-notification="mint-status"]');
      existingNotifications.forEach(notification => notification.remove());
      
      // Declare successDiv in outer scope
      let successDiv: HTMLDivElement | null = null;
      
      // Function to show transaction message
      const showTransactionMessage = () => {
        // Show persistent success message with close button
        successDiv = document.createElement('div');
        successDiv.setAttribute('data-notification', 'mint-status');
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 999999;
          background: #4CAF50; color: white; padding: 15px 20px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: Arial, sans-serif; font-size: 14px;
          max-width: 400px; word-wrap: break-word;
        `;
        successDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong>🎉 Transaction Sent!</strong><br>
              Hash: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" style="color: #E8F5E8; text-decoration: underline;">${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}</a><br>
              <small>Waiting for confirmation...</small>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px; line-height: 1;">×</button>
          </div>
        `;
        document.body.appendChild(successDiv);
      };

      // Show referral confirmation first if there's a referrer
      if (passType === 'full' && referrerAddress && referrerAddress.trim() !== '') {
        const referralDiv = document.createElement('div');
        referralDiv.setAttribute('data-notification', 'mint-status');
        referralDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 999999;
          background: #007bff; color: white; padding: 15px 20px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: Arial, sans-serif; font-size: 14px;
          max-width: 400px; word-wrap: break-word;
        `;
        referralDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong>🎯 Referral Tracked!</strong><br>
              Referrer: ${referrerAddress.slice(0, 6)}...${referrerAddress.slice(-4)}<br>
              <small>You'll receive a Shard reward after sale ends</small>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px; line-height: 1;">×</button>
          </div>
        `;
        document.body.appendChild(referralDiv);
        
        // Auto-replace with transaction message after 3 seconds
        setTimeout(() => {
          referralDiv.remove();
          showTransactionMessage();
        }, 3000);
      } else {
        showTransactionMessage();
      }
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Extract token ID from transaction logs
      let tokenId = 'Unknown';
      try {
        const transferEvent = receipt.logs.find((log: any) => 
          log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event
        );
        if (transferEvent) {
          tokenId = parseInt(transferEvent.topics[3], 16).toString();
        }
      } catch (e) {
        console.log('Could not extract token ID:', e);
      }
      
      // Update success message with final details (only if successDiv exists)
      if (successDiv) {
        successDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong>✅ Minting Successful!</strong><br>
              Token ID: <strong>#${tokenId}</strong><br>
              <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" style="color: #E8F5E8; text-decoration: underline;">View on Etherscan</a><br>
              <small>Import token ID #${tokenId} to your wallet if needed</small>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 2px 6px; margin: 0; line-height: 1; border-radius: 3px; min-width: 24px; flex-shrink: 0;">×</button>
          </div>
        `;
      }
      
      // Reload contract data
      await loadContractData();
      
      // Track referral data for Full Pass mints with referrer
      if (passType === 'full' && referrerAddress && referrerAddress.trim() !== '') {
        saveReferralData(address, referrerAddress, tx.hash, 'Full Pass');
        console.log('✅ Referral data saved for processing');
      }
      
    } catch (error) {
      console.error('Mint error:', error);
      
      // Remove any existing notifications first
      const existingNotifications = document.querySelectorAll('[data-notification="mint-status"]');
      existingNotifications.forEach(notification => notification.remove());
      
      // Show persistent error message
      const errorDiv = document.createElement('div');
      errorDiv.setAttribute('data-notification', 'mint-status');
      errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 999999;
        background: #f44336; color: white; padding: 15px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif; font-size: 14px;
        max-width: 400px; word-wrap: break-word;
      `;
      
      let errorMessage = 'Unknown error occurred';
      
      // Handle specific error types
      if ((error as Error).message.includes('user rejected action') || (error as Error).message.includes('User denied transaction')) {
        errorMessage = '🚫 Transaction Cancelled<br><small>You cancelled the transaction in MetaMask</small>';
      } else if ((error as Error).message.includes('execution reverted')) {
        errorMessage = '❌ Transaction Failed<br><small>Possible causes:</small><br>• Insufficient ETH balance<br>• Supply limits reached<br>• Sale not active';
      } else if ((error as Error).message.includes('insufficient funds')) {
        errorMessage = '💰 Insufficient Funds<br><small>You don\'t have enough ETH for this transaction</small>';
      } else if ((error as Error).message.includes('network')) {
        errorMessage = '🌐 Network Error<br><small>Please check your internet connection and try again</small>';
      } else {
        errorMessage = `⚠️ Error: ${(error as Error).message}`;
      }
      
      errorDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; padding-right: 10px;">
            <strong>❌ Minting Failed</strong><br>
            ${errorMessage}
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 2px 6px; margin: 0; line-height: 1; border-radius: 3px; min-width: 24px; flex-shrink: 0;">×</button>
        </div>
      `;
      document.body.appendChild(errorDiv);
    } finally {
      setIsMinting(false);
    }
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${address}`;
    
    const showCopySuccess = () => {
      // Show persistent success notification
      const successDiv = document.createElement('div');
      successDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 999999;
        background: #28a745; color: white; padding: 15px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif; font-size: 14px;
        max-width: 400px; word-wrap: break-word;
      `;
      successDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <strong>📋 Copied to Clipboard!</strong><br>
            Your referral link is ready to share:<br>
            <small style="opacity: 0.9;">${referralLink.length > 50 ? referralLink.slice(0, 50) + '...' : referralLink}</small>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 2px 6px; margin: 0; line-height: 1; border-radius: 3px; min-width: 24px; flex-shrink: 0;">×</button>
        </div>
      `;
      document.body.appendChild(successDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.remove();
        }
      }, 5000);
    };
    
    navigator.clipboard.writeText(referralLink).then(() => {
      showCopySuccess();
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showCopySuccess();
    });
  };

  const toggleReferralDetails = () => {
    setShowReferralDetails(!showReferralDetails);
  };

  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
    if (!showManualEntry) {
      setReferrerAddress('');
    }
  };

  const toggleAvailabilityDetails = () => {
    setShowAvailabilityDetails(!showAvailabilityDetails);
  };

  // Calculate supply remaining
  const fullSupplyRemaining = contractData.maxFullSupply - contractData.fullMinted;
  const shardSupplyRemaining = contractData.maxShardSupply - contractData.shardsMinted;

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      
      {/* Persistent Notification */}
      {mounted && showNotification && (
        <div 
          onClick={dismissNotification}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            maxWidth: '400px',
            padding: '15px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: notificationType === 'success' ? '#d4edda' : 
                           notificationType === 'error' ? '#f8d7da' : '#d1ecf1',
            border: `1px solid ${notificationType === 'success' ? '#c3e6cb' : 
                                 notificationType === 'error' ? '#f5c6cb' : '#bee5eb'}`,
            color: notificationType === 'success' ? '#155724' : 
                   notificationType === 'error' ? '#721c24' : '#0c5460'
          }}
        >
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            {notification}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            Click to dismiss
          </div>
        </div>
      )}
      
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          color: '#333',
          margin: '0'
        }}>
          21 Sats – Reservation Portal
        </h1>
      </div>

      {/* Wallet Connection Section */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {mounted && !isConnected ? (
          <>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333', margin: '0 0 15px 0' }}>Connect Your Wallet</h3>
            <button 
              onClick={connectWallet}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Connect MetaMask
            </button>
          </>
        ) : mounted && isConnected ? (
          <>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', color: '#333' }}>Wallet Connected</h3>
            <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
              <strong>Address:</strong> {address}
            </p>
            <button 
              onClick={disconnectWallet}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Disconnect Wallet
            </button>
          </>
        ) : null}
      </div>

      {/* Availability Section */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
      onClick={toggleAvailabilityDetails}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>Availability</h3>
          {mounted && <span style={{ fontSize: '1.2rem', color: '#666' }}>{showAvailabilityDetails ? '▼' : '▶'}</span>}
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Full Passes:</strong> {fullSupplyRemaining} available</p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Shard Passes:</strong> {shardSupplyRemaining} available</p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Full Pass Price:</strong> {fullPrice} ETH</p>
        <p style={{ margin: '0 0 0 0', fontSize: '14px' }}><strong>Shard Price:</strong> {shardPrice} ETH</p>
        
        {/* Detailed Availability Information */}
        {mounted && showAvailabilityDetails && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            padding: '15px',
            marginTop: '15px',
            fontSize: '0.9rem'
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#495057' }}>Token Supply Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Full Passes (KNYT)</h5>
                <p style={{ margin: '4px 0' }}>• <strong>Total Supply:</strong> {contractData.maxFullSupply}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Minted:</strong> {contractData.fullMinted}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Remaining:</strong> {fullSupplyRemaining}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Price:</strong> {fullPrice} ETH</p>
              </div>
              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Shard Passes</h5>
                <p style={{ margin: '4px 0' }}>• <strong>Total Supply:</strong> {contractData.maxShardSupply}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Minted:</strong> {contractData.shardsMinted}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Remaining:</strong> {shardSupplyRemaining}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Price:</strong> {shardPrice} ETH</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Referral Shards</h5>
              <p style={{ margin: '4px 0' }}>• <strong>Total Referral Rewards:</strong> 18</p>
              <p style={{ margin: '4px 0' }}>• <strong>Distributed:</strong> {contractData.referralShardsMinted}</p>
              <p style={{ margin: '4px 0' }}>• <strong>Available:</strong> {18 - contractData.referralShardsMinted}</p>
              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#6c757d' }}>Referral shards are earned by referring Full Pass mints</p>
            </div>
          </div>
        )}
      </div>


      {/* Referral Program Section */}
      {mounted && isConnected && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🔗 Referral Program</h3>
            <button 
              onClick={toggleReferralDetails}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Details
            </button>
          </div>
          
          {/* Referral Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px' 
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                {mounted ? (() => {
                  const referralData = getReferralData();
                  // Show total VALID referrals recorded (exclude unknown/unverified entries)
                  const validReferrals = referralData.filter((data: any) => 
                    data.referrerAddress !== 'Unknown - Needs Manual Verification' &&
                    !data.needsVerification
                  );
                  return validReferrals.length;
                })() : '0'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Successful Rewards</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px' 
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>{mounted ? (() => {
                // Query blockchain for minted referral shards
                console.log('🔍 Contract data for rewards minted:', contractData);
                return contractData.referralShardsMinted || 0;
              })() : 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Rewards Minted</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px' 
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                {Math.max(0, contractData.maxFullSupply - contractData.fullMinted)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Rewards Available</div>
            </div>
          </div>

          {/* Your Referral Link */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Your Referral Link</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={mounted ? `${window.location.origin}/?ref=${address}` : ''}
                readOnly
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <button
                onClick={copyReferralLink}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Copy Link
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px', margin: '8px 0 0 0' }}>
              Share this link with friends. When they mint a Full KNYT, you'll receive a free Shard! (18 rewards remaining)
            </p>
          </div>

          {/* Detailed Referral Program Information */}
          {mounted && showReferralDetails && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '15px',
              marginTop: '15px',
              fontSize: '0.9rem'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#495057' }}>How Referral Rewards Work</h4>
              
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>📋 Process Overview</h5>
                <ol style={{ margin: '0', paddingLeft: '18px', lineHeight: '1.6' }}>
                  <li><strong>Share your referral link</strong> with friends who want to mint Full Passes</li>
                  <li><strong>Friend visits your link</strong> and their referral field auto-populates</li>
                  <li><strong>Friend mints a Full Pass</strong> (0.01 ETH) using your referral</li>
                  <li><strong>You earn 1 Shard reward</strong> that will be distributed after sale ends</li>
                  <li><strong>Owner processes rewards</strong> manually in batches for security</li>
                </ol>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>🎯 Reward Details</h5>
                <div style={{ backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '10px' }}>
                  <p style={{ margin: '4px 0' }}>• <strong>Reward Type:</strong> Free Shard Pass (worth 0.001 ETH)</p>
                  <p style={{ margin: '4px 0' }}>• <strong>Eligibility:</strong> Only Full Pass mints qualify (not Shard mints)</p>
                  <p style={{ margin: '4px 0' }}>• <strong>Limit:</strong> 18 total referral rewards available</p>
                  <p style={{ margin: '4px 0' }}>• <strong>Distribution:</strong> After sale ends, processed manually by owner</p>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>⚠️ Important Notes</h5>
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', padding: '10px' }}>
                  <p style={{ margin: '4px 0' }}>• Referral rewards are processed <strong>off-chain</strong> for security</p>
                  <p style={{ margin: '4px 0' }}>• Rewards are distributed <strong>after the sale ends</strong></p>
                  <p style={{ margin: '4px 0' }}>• Only <strong>Full Pass mints</strong> earn referral rewards</p>
                  <p style={{ margin: '4px 0' }}>• Limited to <strong>18 total rewards</strong> - first come, first served</p>
                </div>
              </div>

              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>📊 Your Referral Stats</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                      {mounted ? (() => {
                        const referralData = getReferralData();
                        console.log(' Referral stats calculation for address:', address);
                        console.log(' All referral data:', referralData);
                        
                        // Count all referrals where connected wallet is the referrer (minted + pending)
                        const userReferrals = referralData.filter((data: any) => 
                          data.referrerAddress === address
                        );
                        
                        console.log(' User referrals (all):', userReferrals);
                        console.log(' Total user referrals count:', userReferrals.length);
                        
                        return userReferrals.length;
                      })() : '0'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Successful Referrals</div>
                  </div>
                  <div style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>
                      {mounted ? (() => {
                        const referralData = getReferralData();
                        // Count referrals where this user is the referrer but rewards haven't been processed yet
                        const pendingCount = referralData.filter((data: any) => 
                          data.referrerAddress === address && 
                          (!data.verified || data.needsVerification || data.referrerAddress === 'Unknown - Needs Manual Verification')
                        ).length;
                        return pendingCount;
                      })() : '0'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Pending Rewards</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Program Details - Expandable */}
          {mounted && showReferralDetails && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '15px',
              marginTop: '15px',
              fontSize: '0.9rem'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#495057' }}>How Referrals Work</h4>
              <ul style={{ marginBottom: '10px', paddingLeft: '20px' }}>
                <li>Share your referral link with friends</li>
                <li>When someone mints a <strong>Full Pass</strong> using your link, you earn a <strong>Shard reward</strong></li>
                <li>Shard rewards are distributed manually by the owner after the sale ends</li>
                <li>Only Full Pass mints count toward referral rewards (Shard mints do not)</li>
                <li>Maximum 18 referral rewards available total</li>
              </ul>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.8rem' }}>
                <strong>Note:</strong> Referral rewards are processed manually for security and supply control.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Minting Section */}
      {mounted && isConnected && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#333', margin: '0 0 20px 0' }}>Reserve Your Pass</h3>
          
          {/* Pass Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#333', margin: '0 0 15px 0' }}>Pass Type</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="passType"
                  value="full"
                  checked={passType === 'full'}
                  onChange={(e) => setPassType(e.target.value as 'full' | 'shard')}
                  style={{ marginRight: '8px' }}
                />
                <span>Full Pass ({fullPrice} ETH)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="passType"
                  value="shard"
                  checked={passType === 'shard'}
                  onChange={(e) => setPassType(e.target.value as 'full' | 'shard')}
                  style={{ marginRight: '8px' }}
                />
                <span>Shard ({shardPrice} ETH)</span>
              </label>
            </div>
          </div>

          {/* Referral Rewards Limited Notice - Only show for Full Pass */}
          {passType === 'full' && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '6px', 
              padding: '15px', 
              marginBottom: '15px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#856404' }}>⚠️ Referral Rewards Limited</span>
                <button
                  onClick={toggleManualEntry}
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: showManualEntry ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  {showManualEntry ? 'Hide Entry' : 'Manual Entry'}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                If someone referred you, enter their address below. Referral rewards may be limited
              </p>
              {mounted && showManualEntry && (
                <div style={{ marginTop: '12px' }}>
                  {referralFromUrl && (
                    <div style={{
                      backgroundColor: '#d4edda',
                      border: '1px solid #c3e6cb',
                      borderRadius: '6px',
                      padding: '10px',
                      marginBottom: '12px',
                      fontSize: '0.85rem'
                    }}>
                      <strong style={{ color: '#155724' }}>✅ Referral Auto-Detected!</strong><br/>
                      <span style={{ color: '#155724' }}>The referrer address has been automatically filled from your referral link.</span>
                    </div>
                  )}
                  <div style={{
                    backgroundColor: '#e7f3ff',
                    border: '1px solid #b3d9ff',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '0.85rem'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#0066cc' }}>📋 Manual Referral Process</h5>
                    <ul style={{ margin: '0', paddingLeft: '18px', lineHeight: '1.4' }}>
                      <li><strong>Step 1:</strong> Get the referrer's wallet address</li>
                      <li><strong>Step 2:</strong> Paste it in the field below</li>
                      <li><strong>Step 3:</strong> Complete your Full Pass mint</li>
                      <li><strong>Step 4:</strong> Referrer gets notified of pending reward</li>
                      <li><strong>Step 5:</strong> Owner distributes Shard reward after sale ends</li>
                    </ul>
                    <div style={{ 
                      backgroundColor: '#fff3cd', 
                      border: '1px solid #ffeaa7', 
                      borderRadius: '4px', 
                      padding: '8px', 
                      marginTop: '8px',
                      fontSize: '0.8rem'
                    }}>
                      <strong>⚠️ Important:</strong> Only Full Pass mints earn referral rewards. Shard mints do not qualify for referral rewards.
                    </div>
                  </div>
                  <input
                    type="text"
                    value={referrerAddress}
                    onChange={(e) => {
                      setReferrerAddress(e.target.value);
                      // Clear the auto-detected flag if user manually changes
                      if (referralFromUrl && e.target.value !== router.query.ref) {
                        setReferralFromUrl(false);
                      }
                    }}
                    placeholder="0x8417498f0f3b6347a7e2352b2e7d3b2e7d4389d56613b"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: referralFromUrl ? '2px solid #28a745' : '2px solid #007bff',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      backgroundColor: referralFromUrl ? '#f8fff9' : 'white'
                    }}
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#6c757d' }}>
                    💡 <strong>Tip:</strong> Make sure the address starts with "0x" and is 42 characters long
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email Input */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dele@metame.com"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={isMinting || !saleIsActive}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isMinting ? '#ccc' : (saleIsActive ? '#28a745' : '#6c757d'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isMinting || !saleIsActive ? 'not-allowed' : 'pointer'
            }}
          >
            {mounted ? (isMinting ? 'Processing...' : (saleIsActive ? `Reserve ${passType === 'shard' ? 'Shard' : 'Full Pass'}` : 'Sale Not Active')) : 'Loading...'}
          </button>
        </div>
      )}

      {/* Tokens Purchased Section */}
      {mounted && address && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333', margin: '0 0 15px 0' }}>Your Tokens</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px' 
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                {(() => {
                  // NEW: Use blockchain data first, fallback to localStorage
                  if (userTokenBalance.fullPasses > 0) {
                    return userTokenBalance.fullPasses;
                  }
                  // Fallback: Count Full Passes purchased by this wallet from localStorage
                  const referralData = getReferralData();
                  return referralData.filter((data: any) => 
                    data.userAddress?.toLowerCase() === address.toLowerCase() && 
                    data.passType === 'Full Pass'
                  ).length;
                })()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Full Passes Purchased</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px' 
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                {(() => {
                  // NEW: Use blockchain data first, fallback to localStorage
                  if (userTokenBalance.shards > 0) {
                    return userTokenBalance.shards;
                  }
                  // Fallback: Count Shards purchased by this wallet from localStorage
                  const referralData = getReferralData();
                  return referralData.filter((data: any) => 
                    data.userAddress?.toLowerCase() === address.toLowerCase() && 
                    data.passType === 'Shard'
                  ).length;
                })()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Shards Purchased</div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: '#666',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '4px 0' }}>
          <strong>Contract:</strong> 0x8C3be4d...{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(-7)}
        </p>
        <p style={{ margin: '4px 0' }}><strong>Network:</strong> Sepolia Testnet</p>
        <p style={{ margin: '4px 0' }}><strong>Sale Status:</strong> {mounted ? (saleIsActive ? 'Active' : 'Checking...') : 'Loading...'}</p>
        <p style={{ margin: '4px 0' }}>
          <strong>Available Full Passes:</strong> {fullSupplyRemaining} | <strong>Available Shards:</strong> {shardSupplyRemaining}
        </p>
        <button
          onClick={loadContractData}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          🔄 Force Refresh Data
        </button>
      </div>

      {/* Referral Data Display (for owner verification) */}
      {mounted && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#666',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📋 Referral Data (Owner Verification)</h4>
          {(() => {
            // For now, use localStorage data but we'll add a sync button to load blockchain data
            const referralData = getReferralData();
          if (referralData.length === 0) {
            return <p style={{ margin: '4px 0', fontStyle: 'italic' }}>No referral data stored yet</p>;
          }
          
          const updateReferrerAddress = (txHash: string, newReferrerAddress: string) => {
            if (typeof window === 'undefined') return;
            const existingData = JSON.parse(localStorage.getItem('referralData') || '[]');
            const updatedData = existingData.map((item: any) => 
              item.txHash === txHash 
                ? { ...item, referrerAddress: newReferrerAddress, needsVerification: false, verified: true }
                : item
            );
            localStorage.setItem('referralData', JSON.stringify(updatedData));
            // Trigger a re-render by updating contract data
            loadContractData();
          };
          
          return (
            <div>
              <p style={{ margin: '4px 0' }}><strong>Total Referrals:</strong> {referralData.length}</p>
              {referralData.map((data: any, index: number) => (
                <div key={index} style={{ 
                  backgroundColor: data.needsVerification ? '#fff3cd' : '#f8f9fa', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  margin: '4px 0',
                  fontSize: '0.75rem',
                  border: data.needsVerification ? '1px solid #ffeaa7' : '1px solid #e9ecef'
                }}>
                  <div><strong>User:</strong> {data.userAddress.slice(0, 6)}...{data.userAddress.slice(-4)}</div>
                  
                  {data.needsVerification ? (
                    <div style={{ margin: '4px 0' }}>
                      <strong>Referrer:</strong> 
                      <input
                        type="text"
                        placeholder="Enter referrer address (0x...)"
                        style={{
                          width: '100%',
                          padding: '2px 4px',
                          fontSize: '0.7rem',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          marginTop: '2px'
                        }}
                        onBlur={(e) => {
                          const address = e.target.value.trim();
                          if (address && address.startsWith('0x') && address.length === 42) {
                            updateReferrerAddress(data.txHash, address);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const address = (e.target as HTMLInputElement).value.trim();
                            if (address && address.startsWith('0x') && address.length === 42) {
                              updateReferrerAddress(data.txHash, address);
                            }
                          }
                        }}
                      />
                      <div style={{ fontSize: '0.65rem', color: '#856404', marginTop: '2px' }}>
                        ⚠️ Enter the correct referrer address for this transaction
                      </div>
                    </div>
                  ) : (
                    <div><strong>Referrer:</strong> {data.referrerAddress.slice(0, 6)}...{data.referrerAddress.slice(-4)} 
                      {data.verified && <span style={{ color: '#28a745', marginLeft: '4px' }}>✅</span>}
                    </div>
                  )}
                  
                  <div><strong>TX:</strong> {data.txHash.slice(0, 10)}...{data.txHash.slice(-8)}</div>
                  <div><strong>Date:</strong> {new Date(data.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          );
        })()}
        <button
          onClick={() => clearReferralData()}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            marginTop: '8px',
            marginRight: '8px'
          }}
        >
          🗑️ Clear Data
        </button>
      </div>
      )}

      {/* Owner Interface */}
      {mounted && isOwner && (
        <div style={{ 
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #ffc107',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: '0', color: '#856404', fontSize: '1.2rem' }}>
              👑 Owner Interface
            </h3>
            <button
              onClick={() => setShowOwnerInterface(!showOwnerInterface)}
              style={{
                marginLeft: 'auto',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#856404'
              }}
            >
              {showOwnerInterface ? '▼' : '▶'}
            </button>
          </div>
          
          {mounted && showOwnerInterface && (
            <div>
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '15px', 
                borderRadius: '6px',
                marginBottom: '15px',
                border: '1px solid #ffc107'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
                  🎁 Referral Reward Processing
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>
                  Process all pending referral rewards by minting referral shards to qualifying referrers.
                  Only Full Pass mints qualify for referral rewards.
                </p>
                
                {mounted && (() => {
                  const referralData = getReferralData();
                  console.log('🔍 Owner Interface - Referral Data:', referralData);
                  
                  // Filter out invalid/unverified entries AND self-purchases
                  const validReferrals = referralData.filter((data: any) => 
                    data.referrerAddress !== 'Unknown - Needs Manual Verification' &&
                    data.referrerAddress !== 'Self-Purchase (No Referrer)' &&
                    data.referrerAddress !== 'BULK_PROCESS' &&
                    !data.needsVerification &&
                    data.passType === 'Full Pass'
                  );
                  
                  // Calculate total referral rewards that should exist
                  const totalReferralRewards: { [key: string]: number } = {};
                  validReferrals.forEach((data: any) => {
                    console.log('🔍 Processing VALID referral entry:', data);
                    totalReferralRewards[data.referrerAddress] = (totalReferralRewards[data.referrerAddress] || 0) + 1;
                  });
                  console.log('🔍 Total Referral Rewards (all time):', totalReferralRewards);
                  
                  // Calculate pending rewards (total - already minted)
                  const totalEarned = Object.values(totalReferralRewards).reduce((sum: number, count: number) => sum + count, 0);
                  const alreadyMinted = contractData?.referralShardsMinted || 0;
                  const pendingRewards = Math.max(0, totalEarned - alreadyMinted);
                  
                  // For display purposes, show pending rewards proportionally distributed among referrers
                  const referrerCounts: { [key: string]: number } = {};
                  if (pendingRewards > 0) {
                    // Distribute pending rewards proportionally among referrers
                    const totalShares = Object.values(totalReferralRewards).reduce((sum, count) => sum + count, 0);
                    let remainingRewards = pendingRewards;
                    
                    Object.entries(totalReferralRewards).forEach(([address, count]) => {
                      const pendingForThisReferrer = Math.max(1, Math.floor((count / totalShares) * pendingRewards));
                      const actualPending = Math.min(pendingForThisReferrer, remainingRewards);
                      if (actualPending > 0) {
                        referrerCounts[address] = actualPending;
                        remainingRewards -= actualPending;
                      }
                    });
                  }
                  
                  console.log('🔍 Pending Referrer Counts:', referrerCounts);
                  console.log('🔍 Already minted:', alreadyMinted, 'Total earned:', totalEarned, 'Pending:', pendingRewards);
                  
                  const totalRewards = pendingRewards;
                  
                  return (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '10px', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '4px' 
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                            {Object.keys(totalReferralRewards).length}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Unique Referrers</div>
                        </div>
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '10px', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '4px' 
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                            {totalRewards}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Shards to Mint</div>
                        </div>
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '10px', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '4px' 
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                            {validReferrals.length}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Valid Referrals</div>
                        </div>
                      </div>
                      
                      {Object.keys(referrerCounts).length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>Pending Rewards:</h5>
                          {Object.entries(referrerCounts).map(([address, count]) => (
                            <div key={address} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              margin: '4px 0',
                              fontSize: '0.85rem'
                            }}>
                              <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                              <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                                {count} shard{count > 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show already processed rewards */}
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ margin: '0 0 8px 0', color: '#28a745' }}>✅ Already Processed:</h5>
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '10px', 
                          backgroundColor: '#d4edda', 
                          borderRadius: '4px',
                          border: '1px solid #c3e6cb'
                        }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#155724' }}>
                            {contractData.referralShardsMinted || 0} shards minted
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#155724' }}>
                            Total referral rewards processed on blockchain
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <button
                  onClick={() => {
                    console.log('🔍 Button click debug:');
                    console.log('  processingRewards:', processingRewards);
                    console.log('  mounted:', mounted);
                    console.log('  getReferralData().length:', getReferralData().length);
                    console.log('  button disabled:', processingRewards || (mounted && getReferralData().length === 0));
                    processReferralRewards();
                  }}
                  disabled={processingRewards || (mounted && getReferralData().length === 0)}
                  style={{
                    backgroundColor: processingRewards ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: processingRewards ? 'not-allowed' : 'pointer',
                    width: '100%',
                    fontWeight: 'bold'
                  }}
                >
                  {processingRewards ? '⏳ Processing Rewards...' : '🎁 Process All Referral Rewards'}
                </button>
                
                {mounted && getReferralData().length === 0 && (
                  <p style={{ 
                    margin: '10px 0 0 0', 
                    fontSize: '0.8rem', 
                    color: '#856404',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    No referral data available to process
                  </p>
                )}
              </div>
              
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '15px', 
                borderRadius: '6px',
                border: '1px solid #ffc107'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
                  ⚠️ Owner Actions
                </h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666' }}>
                  Additional owner-only functions for contract management.
                </p>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={loadContractData}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '220px'
                    }}
                  >
                    🔄 Refresh Contract Data
                  </button>
                  
                  <button
                    onClick={syncReferralDataFromBlockchain}
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '220px'
                    }}
                  >
                    🔗 Sync from Blockchain
                  </button>
                  
                  <button
                    onClick={cleanupInvalidEntries}
                    style={{
                      backgroundColor: '#ffc107',
                      color: '#212529',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '220px'
                    }}
                  >
                    🧹 Clean Invalid Entries
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all referral data? This cannot be undone.')) {
                        clearReferralData();
                        alert('All referral data has been cleared.');
                      }
                    }}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '220px'
                    }}
                  >
                    🗑️ Clear All Referral Data
                  </button>
                  
                  <button
                    onClick={() => {
                      try {
                        const referralData = getReferralData();
                        const dataStr = JSON.stringify(referralData, null, 2);
                        navigator.clipboard.writeText(dataStr).then(() => {
                          alert(`✅ Copied ${referralData.length} referral records to clipboard!\n\nPaste into a text file and save as .json`);
                        }).catch(() => {
                          // Fallback for older browsers
                          const textArea = document.createElement('textarea');
                          textArea.value = dataStr;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          alert(`✅ Copied ${referralData.length} referral records to clipboard!\n\nPaste into a text file and save as .json`);
                        });
                      } catch (error) {
                        console.error('❌ Copy error:', error);
                        alert('❌ Copy failed. Check console for details.');
                      }
                    }}
                    style={{
                      backgroundColor: '#6f42c1',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '220px'
                    }}
                  >
                    📋 Copy to Clipboard
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('🔄 Paste Import button clicked');
                      
                      // Create a modal-like overlay for stable paste input
                      const overlay = document.createElement('div');
                      overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.8);
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      `;
                      
                      const modal = document.createElement('div');
                      modal.style.cssText = `
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        width: 80%;
                        max-width: 600px;
                        max-height: 80%;
                      `;
                      
                      modal.innerHTML = `
                        <h3 style="margin-top: 0;">📋 Import Referral Data</h3>
                        <p>Paste your referral data JSON below:</p>
                        <textarea id="pasteArea" style="width: 100%; height: 200px; margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Paste your JSON data here..."></textarea>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                          <button id="cancelBtn" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                          <button id="importBtn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Import</button>
                        </div>
                      `;
                      
                      overlay.appendChild(modal);
                      document.body.appendChild(overlay);
                      
                      const textarea = document.getElementById('pasteArea');
                      const cancelBtn = document.getElementById('cancelBtn');
                      const importBtn = document.getElementById('importBtn');
                      
                      // Focus the textarea for immediate pasting
                      setTimeout(() => textarea.focus(), 100);
                      
                      cancelBtn.onclick = () => {
                        document.body.removeChild(overlay);
                        console.log('❌ Import cancelled by user');
                      };
                      
                      importBtn.onclick = () => {
                        const jsonData = textarea.value.trim();
                        console.log('📋 User provided data:', jsonData ? 'Data provided' : 'No data provided');
                        
                        if (jsonData) {
                          try {
                            const importedData = JSON.parse(jsonData);
                            console.log('📊 Parsed data:', importedData);
                            if (Array.isArray(importedData)) {
                              localStorage.setItem('referralData', JSON.stringify(importedData));
                              console.log('✅ Data saved to localStorage');
                              document.body.removeChild(overlay);
                              alert(`✅ Successfully imported ${importedData.length} referral records!\n\nPage will refresh to show imported data.`);
                              setTimeout(() => window.location.reload(), 1000);
                            } else {
                              console.log('❌ Data is not an array:', typeof importedData);
                              alert('❌ Invalid data format. Please ensure you pasted valid JSON data.');
                            }
                          } catch (error) {
                            console.log('❌ JSON parse error:', error);
                            alert('❌ Invalid JSON format. Please check the pasted data and try again.');
                          }
                        } else {
                          alert('❌ Please paste some data before importing.');
                        }
                      };
                      
                      // Allow Escape key to close
                      overlay.onkeydown = (e) => {
                        if (e.key === 'Escape') {
                          document.body.removeChild(overlay);
                          console.log('❌ Import cancelled with Escape key');
                        }
                      };
                    }}
                    style={{
                      backgroundColor: '#fd7e14',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '220px'
                    }}
                  >
                    📋 Paste Import
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
