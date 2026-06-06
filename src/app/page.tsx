"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MailboxManager } from "@/components/MailboxManager";
import { InboxList } from "@/components/InboxList";
import { EmailViewer } from "@/components/EmailViewer";
import { Email } from "@/lib/db";
import { Mail, Zap } from "lucide-react";

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STORAGE_KEY = "hytthynnmail-address";

export default function Home() {
  const [activeAddress, setActiveAddress] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Load address from localStorage or generate random on first visit
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActiveAddress(saved);
    } else {
      const randomString = Math.random().toString(36).substring(2, 10);
      const addr = `${randomString}@hexsad.ru`;
      localStorage.setItem(STORAGE_KEY, addr);
      setActiveAddress(addr);
    }
  }, []);

  const handleChangeAddress = (addr: string) => {
    localStorage.setItem(STORAGE_KEY, addr);
    setActiveAddress(addr);
    setSelectedEmailId(null);
  };

  // Poll for new emails every 3 seconds
  const { data, error, isLoading, mutate } = useSWR<{ emails: Email[] }>(
    activeAddress ? `/api/emails?address=${activeAddress}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const emails = data?.emails || [];
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null;

  return (
    <main className="container">
      <header className="header glass-panel">
        <div className="logo-area">
          <div className="logo-icon">
            <Mail size={24} color="var(--accent-cyan)" />
          </div>
          <h1>Hytthynn<span className="gradient-text">Mail</span></h1>
        </div>
        <div className="header-badges">
          <div className="badge"><Zap size={14} /> Мгновенно</div>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="sidebar">
          <MailboxManager 
            activeAddress={activeAddress} 
            onChangeAddress={handleChangeAddress}
          />
        </aside>

        <section className="inbox-section glass-panel">
          {selectedEmail ? (
            <EmailViewer 
              email={selectedEmail} 
              onBack={() => setSelectedEmailId(null)} 
            />
          ) : (
            <InboxList 
              emails={emails} 
              isLoading={isLoading} 
              onSelect={setSelectedEmailId} 
              activeAddress={activeAddress}
            />
          )}
        </section>
      </div>
    </main>
  );
}
