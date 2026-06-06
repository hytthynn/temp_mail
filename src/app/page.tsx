"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MailboxManager } from "@/components/MailboxManager";
import { InboxList } from "@/components/InboxList";
import { EmailViewer } from "@/components/EmailViewer";
import { Email } from "@/lib/db";
import { Mail, Shield, Zap } from "lucide-react";

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [activeAddress, setActiveAddress] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Initialize random email on first load
  useEffect(() => {
    const randomString = Math.random().toString(36).substring(2, 10);
    setActiveAddress(`${randomString}@hexsad.ru`);
  }, []);

  // Poll for new emails every 3 seconds
  const { data, error, isLoading, mutate } = useSWR<{ emails: Email[] }>(
    activeAddress ? `/api/emails?address=${activeAddress}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const emails = data?.emails || [];
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null;

  const handleSendTest = async () => {
    if (!activeAddress) return;
    try {
      await fetch("/api/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: activeAddress }),
      });
      mutate(); // manually trigger an immediate re-fetch
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="container">
      <header className="header glass-panel">
        <div className="logo-area">
          <div className="logo-icon">
            <Mail size={24} color="var(--accent-cyan)" />
          </div>
          <h1>Aura<span className="gradient-text">Mail</span></h1>
        </div>
        <div className="header-badges">
          <div className="badge"><Shield size={14} /> Без спама</div>
          <div className="badge"><Zap size={14} /> Мгновенно</div>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="sidebar">
          <MailboxManager 
            activeAddress={activeAddress} 
            onChangeAddress={setActiveAddress}
            onSendTest={handleSendTest}
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
