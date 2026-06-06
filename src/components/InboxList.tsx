"use client";

import { Email } from "@/lib/db";
import { Mail, Clock, Inbox } from "lucide-react";

interface Props {
  emails: Email[];
  isLoading: boolean;
  onSelect: (id: string) => void;
  activeAddress: string;
}

export function InboxList({ emails, isLoading, onSelect, activeAddress }: Props) {
  if (isLoading && emails.length === 0) {
    return (
      <div className="empty-state">
        <div className="scanner-animation">
          <div className="radar"></div>
        </div>
        <p>Подключение...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="empty-state">
        <div className="scanner-animation">
          <div className="radar"></div>
        </div>
        <h3>Ожидание писем...</h3>
        <p>Письма, отправленные на <strong>{activeAddress}</strong>, появятся здесь автоматически.</p>
      </div>
    );
  }

  return (
    <div className="inbox-list">
      <div className="inbox-header">
        <h2><Inbox size={20} /> Входящие ({emails.length})</h2>
      </div>
      <div className="emails-container">
        {emails.map((email) => {
          const date = new Date(email.date);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div 
              key={email.id} 
              className="email-item"
              onClick={() => onSelect(email.id)}
            >
              <div className="email-item-icon">
                <Mail size={20} />
              </div>
              <div className="email-item-content">
                <div className="email-item-top">
                  <span className="email-sender">{email.from}</span>
                  <span className="email-time"><Clock size={12} /> {timeString}</span>
                </div>
                <div className="email-subject">{email.subject}</div>
                <div className="email-preview">{email.text.substring(0, 60)}...</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
