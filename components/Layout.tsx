import { useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black">
      <nav className="bg-black/80 backdrop-blur-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Qrypto Logo"
                width={40}
                height={40}
                className="mr-4"
              />
              <h1 className="text-white text-xl font-bold">Qrypto Reservation Pass</h1>
            </div>
            <div className="flex items-center">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white">{chain?.name}</span>
                  <ConnectButton showBalance={false} />
                </div>
              ) : (
                <ConnectButton showBalance={false} />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-black/80 backdrop-blur-lg fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-gray-400 text-center">
            © 2025 Qrypto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
