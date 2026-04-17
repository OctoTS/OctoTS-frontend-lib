import React, { useState, useEffect } from 'react';

const ChartCard = ({ 
  title, 
  library, 
  children, 
  description, 
  badgeText, 
  badgeStyle, 
  disabled, 
  lang, 
  requirements 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReq, setShowReq] = useState(false);

  const translations = {
    pl: {
      unsupported: 'Nieobsługiwany format',
      close: 'Zamknij (ESC)',
      lib: 'Biblioteka',
      reqTitle: 'Minimalne wymagane dane'
    },
    en: {
      unsupported: 'Unsupported format',
      close: 'Close (ESC)',
      lib: 'Library',
      reqTitle: 'Minimum required data'
    }
  };

  const t = translations[lang] || translations.en;

  const toggleExpansion = () => {
    if (!disabled) setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsExpanded(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? 'hidden' : 'auto';
  }, [isExpanded]);

  return (
    <>
      <div className="octo-chart-card">
        {disabled && (
          <div className="octo-overlay" style={{ zIndex: 15 }}>
            <div className="octo-overlay-content">
              <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 'bold' }}>{t.unsupported}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!disabled && (
              <button onClick={toggleExpansion} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </button>
            )}
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: '700' }}>{title}</h3>
            {badgeText && <span className="octo-badge" style={badgeStyle}>{badgeText}</span>}
          </div>
          <span className="octo-badge" style={{ color: '#3b82f6', background: '#eff6ff', border: '1px solid #dbeafe' }}>{library}</span>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setShowReq(!showReq)} 
            style={{ background: 'none', border: 'none', color: '#646cff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {t.reqTitle} {showReq ? '▲' : '▼'}
          </button>
          {showReq && requirements && (
            <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569' }}>
              <ul style={{ margin: 0, paddingLeft: '15px' }}>
                {requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>
          )}
        </div>
        
        <div className="octo-chart-content" style={{ filter: disabled ? 'grayscale(1) opacity(0.2)' : 'none' }}>
          {children}
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{description}</p>
        </div>
      </div>

      {isExpanded && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: '#0f172a', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#1e293b' }}>
            <h2 style={{ color: '#fff', margin: 0 }}>{title}</h2>
            <button onClick={toggleExpansion} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{t.close}</button>
          </div>
          <div style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '20px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartCard;
