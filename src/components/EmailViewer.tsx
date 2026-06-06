"use client";

import { Email } from "@/lib/db";
import { ArrowLeft, User, Calendar, Type, Code, Paperclip } from "lucide-react";
import { useState } from "react";

interface Props {
  email: Email;
  onBack: () => void;
}

export function EmailViewer({ email, onBack }: Props) {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  
  const date = new Date(email.date);
  const formattedDate = date.toLocaleString('ru-RU', { 
    day: 'numeric', month: 'long', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="email-viewer">
      <div className="viewer-header">
        <button className="btn-icon-text" onClick={onBack}>
          <ArrowLeft size={18} /> Назад
        </button>
        <div className="view-toggles">
          {email.html && (
            <button 
              className={`toggle-btn ${viewMode === 'html' ? 'active' : ''}`}
              onClick={() => setViewMode('html')}
            >
              <Code size={14} /> HTML
            </button>
          )}
          <button 
            className={`toggle-btn ${viewMode === 'text' || !email.html ? 'active' : ''}`}
            onClick={() => setViewMode('text')}
          >
            <Type size={14} /> Текст
          </button>
        </div>
      </div>
      
      <div className="email-meta">
        <h2 className="email-title">{email.subject}</h2>
        <div className="meta-row">
          <div className="meta-item">
            <User size={16} /> <span className="meta-label">От:</span> {email.from}
          </div>
          <div className="meta-item">
            <Calendar size={16} /> <span className="meta-label">Дата:</span> {formattedDate}
          </div>
        </div>
      </div>

      {email.attachments && email.attachments.length > 0 && (
        <div className="attachments-list">
          <div className="attachments-header">
            <Paperclip size={14} /> Вложения ({email.attachments.length})
          </div>
          <div className="attachments-grid">
            {email.attachments.map((att, i) => (
              <a 
                key={i} 
                href={att.content} 
                download={att.filename}
                className="attachment-item"
              >
                {att.contentType.startsWith('image/') ? (
                  <img src={att.content} alt={att.filename} className="attachment-thumb" />
                ) : (
                  <div className="attachment-icon">
                    <Paperclip size={20} />
                  </div>
                )}
                <span className="attachment-name">{att.filename}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="email-body-container">
        {viewMode === 'html' && email.html ? (
          <div className="html-content-wrapper">
            <iframe 
              srcDoc={email.html} 
              className="email-iframe" 
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
              title="Email content"
            />
          </div>
        ) : (
          <div className="text-content-wrapper">
            {email.text || 'Нет текстовой версии'}
          </div>
        )}
      </div>
    </div>
  );
}
