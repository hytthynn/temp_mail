"use client";

import { useState } from "react";
import { Copy, RefreshCw, Plus, AlertTriangle } from "lucide-react";

interface Props {
  activeAddress: string;
  onChangeAddress: (addr: string) => void;
}

export function MailboxManager({ activeAddress, onChangeAddress }: Props) {
  const [copied, setCopied] = useState(false);
  const [customPrefix, setCustomPrefix] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateRandom = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    onChangeAddress(`${randomString}@hexsad.ru`);
  };

  const handleCreateCustom = () => {
    if (customPrefix.trim()) {
      const clean = customPrefix.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
      if (clean) {
        onChangeAddress(`${clean}@hexsad.ru`);
        setCustomPrefix("");
      }
    }
  };

  return (
    <div className="mailbox-manager glass-panel">
      <h3>Ваш временный адрес</h3>
      
      <div className="active-address-box">
        <input 
          type="text" 
          readOnly 
          value={activeAddress} 
          className="address-input" 
        />
        <button className="icon-button" onClick={handleCopy} title="Копировать">
          {copied ? <span style={{color: 'var(--accent-cyan)'}}>✓</span> : <Copy size={18} />}
        </button>
      </div>

      <div className="actions-grid">
        <button className="btn-secondary" onClick={handleGenerateRandom}>
          <RefreshCw size={16} /> Случайный
        </button>
      </div>

      <div className="custom-address">
        <h4 style={{marginTop: '20px', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)'}}>Свой адрес</h4>
        <div className="custom-input-group">
          <input 
            type="text" 
            placeholder="имя" 
            value={customPrefix}
            onChange={(e) => setCustomPrefix(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCustom()}
          />
          <span className="domain-suffix">@hexsad.ru</span>
          <button className="icon-button add-btn" onClick={handleCreateCustom}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="unsupported-notice">
        <AlertTriangle size={14} />
        <span>Вложения не поддерживаются</span>
      </div>
    </div>
  );
}
