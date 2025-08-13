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

  // Handle referrer from URL
  useEffect(() => {
    if (router.query.ref && typeof router.query.ref === 'string') {
      setReferrerAddress(router.query.ref);
      setReferralFromUrl(true);
      setShowManualEntry(true);
    }
  }, [router.query.ref]);

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
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
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
        maxFullSupply,
        maxShardSupply,
        fullMinted,
        shardMinted,
        referralShardsMinted,
        saleActive,
        fullPriceWei,
        shardPriceWei
      ] = await Promise.all([
        contract.MAX_FULL_SUPPLY(),
        contract.MAX_SHARD_SUPPLY(),
        contract.fullMinted(),
        contract.shardMinted(),
        contract.referralShardsMinted(),
        contract.saleIsActive(),
        contract.fullPrice(),
        contract.shardPrice()
      ]);

      const contractInfo = {
        maxFullSupply: Number(maxFullSupply),
        maxShardSupply: Number(maxShardSupply),
        fullMinted: Number(fullMinted),
        shardMinted: Number(shardMinted),
        referralShardsMinted: Number(referralShardsMinted)
      };

      setContractData(contractInfo);
      setSaleIsActive(saleActive);
      setFullPrice(Number(ethers.formatEther(fullPriceWei)));
      setShardPrice(Number(ethers.formatEther(shardPriceWei)));
      
      console.log('✅ Contract data loaded successfully:', contractInfo);
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
      
      // Show persistent success message with close button
      const successDiv = document.createElement('div');
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
      
      // Update success message with final details
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
      
      // Reload contract data
      await loadContractData();
      
    } catch (error) {
      console.error('Mint error:', error);
      
      // Show persistent error message
      const errorDiv = document.createElement('div');
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

  // Show/hide referral program details
  const [showReferralDetails, setShowReferralDetails] = useState(false);
  const toggleReferralDetails = () => {
    setShowReferralDetails(!showReferralDetails);
  };

  // Handle manual entry toggle
  const [showManualEntry, setShowManualEntry] = useState(false);
  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
    if (!showManualEntry) {
      setReferrerAddress('');
    }
  };

  // Show/hide availability details
  const [showAvailabilityDetails, setShowAvailabilityDetails] = useState(false);
  const toggleAvailabilityDetails = () => {
    setShowAvailabilityDetails(!showAvailabilityDetails);
  };

  // Calculate supply remaining
  const fullSupplyRemaining = contractData.maxFullSupply - contractData.fullMinted;
  const shardSupplyRemaining = contractData.maxShardSupply - contractData.shardMinted;

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      
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
        {!isConnected ? (
          <>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>Connect Your Wallet</h2>
            <p style={{ marginBottom: '15px', color: '#666' }}>Please connect your MetaMask wallet to continue.</p>
            <button 
              onClick={connectWallet}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Connect MetaMask
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>Wallet Connected</h2>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Address: <code style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>{address}</code>
            </p>
            <button 
              onClick={disconnectWallet}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Disconnect Wallet
            </button>
          </>
        )}
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
          <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#333' }}>Availability</h2>
          <span style={{ fontSize: '1.2rem', color: '#666' }}>{showAvailabilityDetails ? '▼' : '▶'}</span>
        </div>
        <p style={{ margin: '8px 0' }}><strong>Full Passes:</strong> {fullSupplyRemaining} available</p>
        <p style={{ margin: '8px 0' }}><strong>Shard Passes:</strong> {shardSupplyRemaining} available</p>
        <p style={{ margin: '8px 0' }}><strong>Full Pass Price:</strong> {fullPrice.toFixed(4)} ETH</p>
        <p style={{ margin: '8px 0' }}><strong>Shard Price:</strong> {shardPrice.toFixed(4)} ETH</p>
        
        {/* Detailed Availability Information */}
        {showAvailabilityDetails && (
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
                <p style={{ margin: '4px 0' }}>• <strong>Price:</strong> {fullPrice.toFixed(4)} ETH</p>
              </div>
              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Shard Passes</h5>
                <p style={{ margin: '4px 0' }}>• <strong>Total Supply:</strong> {contractData.maxShardSupply}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Minted:</strong> {contractData.shardMinted}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Remaining:</strong> {shardSupplyRemaining}</p>
                <p style={{ margin: '4px 0' }}>• <strong>Price:</strong> {shardPrice.toFixed(4)} ETH</p>
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
      {isConnected && (
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
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {showReferralDetails ? 'Hide Details' : 'Details'}
            </button>
          </div>
          
          {/* Referral Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px' 
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>0</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Successful Rewards</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px' 
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>0</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Rewards Earned</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px' 
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>18</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Rewards Available</div>
            </div>
          </div>

          {/* Your Referral Link */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Your Referral Link</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}${typeof window !== 'undefined' ? window.location.pathname : ''}?ref=${address}`}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <button
                onClick={copyReferralLink}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Copy Link
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
              Share this link with friends. When they mint a Full KNYT, you'll receive a free Shard! (18 rewards remaining)
            </p>
          </div>

          {/* Referral Program Details - Expandable */}
          {showReferralDetails && (
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

      {/* Reserve Your Pass Section */}
      {isConnected && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>Reserve Your Pass</h2>
          
          {/* Pass Type Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Pass Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="passType"
                  value="full"
                  checked={passType === 'full'}
                  onChange={(e) => setPassType(e.target.value as 'full' | 'shard')}
                  style={{ marginRight: '8px' }}
                />
                Full Pass ({fullPrice.toFixed(4)} ETH)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="passType"
                  value="shard"
                  checked={passType === 'shard'}
                  onChange={(e) => setPassType(e.target.value as 'full' | 'shard')}
                  style={{ marginRight: '8px' }}
                />
                Shard ({shardPrice.toFixed(4)} ETH)
              </label>
            </div>
          </div>

          {/* Referral Rewards Limited Notice - Only show for Full Pass */}
          {passType === 'full' && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '6px', 
              padding: '12px', 
              marginBottom: '15px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>⚠️</span>
                <strong>Referral Rewards Limited</strong>
                <button
                  onClick={toggleManualEntry}
                  style={{
                    backgroundColor: showManualEntry ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  {showManualEntry ? 'Hide Entry' : 'Manual Entry'}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                If someone referred you, enter their address below. Referral rewards may be limited
              </p>
              {showManualEntry && (
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
                      <strong style={{ color: '#155724' }}>✅ Referral Auto-Detected!</strong><br>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dele@metame.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
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
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isMinting || !saleIsActive ? 'not-allowed' : 'pointer'
            }}
          >
            {isMinting ? 'Processing...' : (saleIsActive ? `Reserve ${passType === 'full' ? 'Full Pass' : 'Shard'}` : 'Sale Not Active')}
          </button>
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
          <strong>Contract:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 10)}...{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(-10)}
        </p>
        <p style={{ margin: '4px 0' }}><strong>Network:</strong> Sepolia Testnet</p>
        <p style={{ margin: '4px 0' }}><strong>Sale Status:</strong> {saleIsActive ? 'Active' : 'Checking...'}</p>
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
            fontSize: '0.8rem',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          🔄 Force Refresh Data
        </button>
      </div>
    </div>
  );
}
