// RightPanel21Sats.tsx
// Purpose: Right-hand content column for the 21 Sats — Reservation Portal
// Framework: React with inline styles matching the left panel
// Usage: <RightPanel21Sats />

import React, { useState } from "react";

/** Expandable section matching left panel card styling */
const Section = ({ title, children, defaultOpen = false, icon = "" }) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  
  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isExpanded ? '15px' : '0'
        }}
      >
        <h3 style={{ 
          fontSize: '1.1rem', 
          margin: '0', 
          color: '#333',
          fontWeight: 'bold'
        }}>
          {icon} {title}
        </h3>
        <span style={{ 
          fontSize: '1.2rem', 
          color: '#666',
          fontWeight: 'bold'
        }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
          {children}
        </div>
      )}
    </div>
  );
};

/** Licensing modal matching left panel modal styling */
const LicensingModal = ({ open, onClose }) => {
  if (!open) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            margin: '0', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            SatoshiKNYT Licensing Agreement
          </h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#666', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Please review the licensing terms for SatoshiKNYT ownership and franchise usage. You can
            download the PDF for your records.
          </p>

          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            height: '300px',
            backgroundColor: '#f8f9fa',
            marginBottom: '15px'
          }}>
            <iframe
              title="SatoshiKNYT Licensing Agreement PDF"
              src="/assets/SatoshiKNYT_Licensing_Agreement.pdf#view=FitH"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="/assets/SatoshiKNYT_Licensing_Agreement.pdf"
              download
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Download PDF
            </a>
            <a
              href="/assets/SatoshiKNYT_Licensing_Agreement.pdf"
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Open in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RightPanel21Sats() {
  const [licensingOpen, setLicensingOpen] = useState(false);

  return (
    <div>
      {/* Header matching left panel style */}
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
          Own a Piece of the 21 Sats Legacy
        </h1>
        <p style={{ 
          margin: '15px 0 0 0', 
          color: '#666', 
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          When you mint a <strong>SatoshiKNYT Reservation Pass</strong>, you're not just buying
          an NFT — you're securing a living, evolving AI-powered franchise. Powered by the{" "}
          <a style={{ color: '#007bff', textDecoration: 'none' }} href="http://whitepaper.iqube.me/" target="_blank" rel="noreferrer">
            iQube Protocol
          </a>{" "}
          and the{" "}
          <a style={{ color: '#007bff', textDecoration: 'none' }} href="https://nakamoto.aigentz.me" target="_blank" rel="noreferrer">
            Aigent Nakamoto
          </a>{" "}
          engine, your SatoshiKNYT fuses original lore, cinematic storytelling, and
          blockchain-native economics into a single asset you own and control.
        </p>
      </div>

      {/* Section 1: What You Get */}
      <Section title="What You Get" icon="🎁" defaultOpen>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Unique SatoshiKNYT AI Agent</strong> — Based on Aigent Nakamoto, tailored to
            your lore, identity, and data via iQubes.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>3:06 Cinematic Origin Film</strong> — Produced by Metaiye Media and distributed
            as part of the metaKnyts QryptoGraphic Movie.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Revenue Sharing (On-Chain)</strong> — 21% from your short film;{" "}
            <strong>79% from your SatoshiKNYT's commercial activities</strong> (with 21% contributed to the SatoshiKNYT DAO).
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Derivative Licensing Rights</strong> — Full commercial use rights for your SatoshiKNYT
            Aigent, plus <strong>rights to 2 additional metaKnyts characters</strong> in your franchise.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>DAO Benefits & Tokens</strong> — 100 transferrable SatoshiKNYT DAO governance tokens,
            10 non-transferrable governance votes, founder status, and community access.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Long-Horizon Token Emissions</strong> — Eligibility to earn QryptoCOYN emissions from
            protocol activity for the next decade.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>First-Mover Advantages</strong> — Priority in launching COYN-20 tokens, storyline inclusion,
            crossovers, and multiverse integrations.
          </li>
        </ul>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            href="https://github.com/iQube-Protocol/21SatoshiKNYTS-Reservation-Portal"
            target="_blank" rel="noreferrer"
          >
            View Portal Repo
          </a>
          <a
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            href="http://whitepaper.iqube.me/"
            target="_blank" rel="noreferrer"
          >
            Read Whitepaper
          </a>
        </div>
      </Section>

      {/* Section 2: How It Works */}
      <Section title="How It Works" icon="⚙️">
        <ol style={{ margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}><strong>Choose</strong> a Full Pass or Shard Pass from the mint panel (left).</li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Mint</strong> your Reservation Pass NFT. Full Pass secures 1 of 21 SatoshiKNYTs.
            A Shard Pass secures 1/21 ownership of a SatoshiKNYT.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Redeem</strong> your Pass after sale to claim your SatoshiKNYT (or shard). We'll
            collaborate on lore, voice, visuals, and utilities.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Launch</strong> your agent into the metaKnyts multiverse: appearances in content,
            events, crossovers, and DAO initiatives.
          </li>
        </ol>

        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>
            Referral rewards (if enabled) and shard distribution are processed off-chain for security
            and supply control. See the Owner Interface for live stats.
          </p>
        </div>
      </Section>

      {/* Section 3: The Value Engine */}
      <Section title="The Value Engine (Economics)" icon="💰">
        <p style={{ margin: '0 0 10px 0' }}>
          The 21 Sats are launched with fair-launch tokenomics that reward long-term contribution
          and community growth across the iQube and metaKnyts ecosystems.
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>QryptoCOYN Emissions</strong> — Eligibility to accrue emissions tied to protocol growth
            and the SatoshiKNYT DAO's activities.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>On-Chain Splits</strong> — 21% from your cinematic short's revenues; <strong>79% of derivative
            revenues</strong> generated by your SatoshiKNYT Aigent.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Composable Utilities</strong> — iQubes allow new tools, models, and media to be added over time
            without breaking provenance or rights.
          </li>
        </ul>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            href="https://nakamoto.aigentz.me"
            target="_blank" rel="noreferrer"
          >
            Explore Aigent Nakamoto
          </a>
          <a
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
            href="https://metaknyts.me/"
            target="_blank"
            rel="noreferrer"
          >
            Discover metaKnyts
          </a>
        </div>
      </Section>

      {/* Section 4: The Universe You Join */}
      <Section title="The Universe You Join" icon="🌌">
        <p style={{ margin: '0 0 10px 0' }}>
          Your SatoshiKNYT becomes part of the official metaKnyts multiverse—spanning graphic novels,
          motion comics, micro-films, AR/VR, and live events.
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Crossovers and collaborations with other SatoshiKNYTs.</li>
          <li style={{ marginBottom: '8px' }}>Priority opportunities to feature in upcoming content drops.</li>
          <li style={{ marginBottom: '8px' }}>Inclusion in partner campaigns across the broader ecosystem.</li>
        </ul>
      </Section>

      {/* Section 5: Community, DAO & Guidelines */}
      <Section title="Community, DAO & Guidelines" icon="🤝">
        <h4 style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '14px' }}>DAO Participation</h4>
        <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '5px' }}>Founder status tethered to your SatoshiKNYT.</li>
          <li style={{ marginBottom: '5px' }}>100 transferrable governance tokens + 10 non-transferrable, irrevocable votes.</li>
          <li style={{ marginBottom: '5px' }}>Access to grants, emissions programs, and governance proposals.</li>
        </ul>

        <h4 style={{ fontWeight: 'bold', margin: '15px 0 8px 0', fontSize: '14px' }}>What You Don't Get</h4>
        <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '5px' }}>Licensing rights to other Metaiye Media or metaProof IP beyond what's explicitly granted.</li>
          <li style={{ marginBottom: '5px' }}>Ownership of the SatoshiKNYT world or metaKnyts characters used to launch it.</li>
        </ul>

        <h4 style={{ fontWeight: 'bold', margin: '15px 0 8px 0', fontSize: '14px' }}>Code of Conduct</h4>
        <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '5px' }}>No pornography.</li>
          <li style={{ marginBottom: '5px' }}>No hate speech.</li>
          <li style={{ marginBottom: '5px' }}>No illegal activities, including copyright infringement.</li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            onClick={() => setLicensingOpen(true)}
          >
            View Licensing Agreement
          </button>
          <span style={{ fontSize: '11px', color: '#6c757d' }}>
            By minting, you agree to the SatoshiKNYT Licensing Agreement.
          </span>
        </div>
      </Section>

      {/* Modal */}
      <LicensingModal open={licensingOpen} onClose={() => setLicensingOpen(false)} />

      {/* Footer helper */}
      <div style={{ 
        textAlign: 'center', 
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>
          Need help? Contact support from the Owner Interface.
        </p>
      </div>
    </div>
  );
}
