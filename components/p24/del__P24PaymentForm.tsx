// components/P24PaymentForm.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────
type PaymentMethod = 'blik' | 'google-pay' | 'gateway';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'blik-confirm';

interface PaymentFormData {
    amount: string;
    email: string;
    description: string;
    client: string;
}

// ─── Component ───────────────────────────────────────────────────
export default function P24PaymentForm() {
    const [method, setMethod] = useState<PaymentMethod>('blik');
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [error, setError] = useState('');
    const [blikCode, setBlikCode] = useState(['', '', '', '', '', '']);
    const [transactionToken, setTransactionToken] = useState('');
    const blikRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [form, setForm] = useState<PaymentFormData>({
        amount: '',
        email: '',
        description: '',
        client: '',
    });

    const updateForm = (key: keyof PaymentFormData, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // ─── BLIK Input Handling ─────────────────────────────────────
    const handleBlikInput = useCallback(
        (index: number, value: string) => {
            if (!/^\d*$/.test(value)) return;

            const newCode = [...blikCode];
            newCode[index] = value.slice(-1);
            setBlikCode(newCode);

            if (value && index < 5) {
                blikRefs.current[index + 1]?.focus();
            }
        },
        [blikCode]
    );

    const handleBlikKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent) => {
            if (e.key === 'Backspace' && !blikCode[index] && index > 0) {
                blikRefs.current[index - 1]?.focus();
            }
        },
        [blikCode]
    );

    const handleBlikPaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setBlikCode(pasted.split(''));
            blikRefs.current[5]?.focus();
        }
    }, []);

    // ─── Validate Form ──────────────────────────────────────────
    const isFormValid = () => {
        if (!form.amount || parseFloat(form.amount) <= 0) return false;
        if (!form.email || !form.email.includes('@')) return false;
        if (method === 'blik' && blikCode.join('').length !== 6) return false;
        return true;
    };

    // ─── BLIK Payment ──────────────────────────────────────────
    const handleBlikPayment = async () => {
        setStatus('processing');
        setError('');

        try {
            // Step 1: Register transaction with BLIK method
            const registerRes = await fetch('/api/p24/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(form.amount),
                    email: form.email,
                    description: form.description || 'Płatność BLIK',
                    client: form.client,
                    method: 154, // BLIK
                }),
            });

            const registerData = await registerRes.json();
            if (!registerRes.ok) throw new Error(registerData.error);

            setTransactionToken(registerData.token);

            // Step 2: Charge by BLIK code
            const blikRes = await fetch('/api/p24/blik', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: registerData.token,
                    blikCode: blikCode.join(''),
                }),
            });

            const blikData = await blikRes.json();
            if (!blikRes.ok) throw new Error(blikData.error);

            // BLIK wymaga potwierdzenia w aplikacji bankowej
            setStatus('blik-confirm');

            // Po 3 sekundach symulujemy powrót do idle (w produkcji polling lub webhook)
            setTimeout(() => {
                setStatus('success');
            }, 5000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Błąd płatności BLIK');
            setStatus('error');
        }
    };

    // ─── Google Pay Payment ────────────────────────────────────
    const handleGooglePayPayment = async () => {
        setStatus('processing');
        setError('');

        try {
            const res = await fetch('/api/p24/google-pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(form.amount),
                    email: form.email,
                    description: form.description || 'Płatność Google Pay',
                    client: form.client,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Redirect to P24 Google Pay gateway
            window.location.href = data.redirectUrl;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Błąd Google Pay');
            setStatus('error');
        }
    };

    // ─── Gateway Redirect Payment ──────────────────────────────
    const handleGatewayPayment = async () => {
        setStatus('processing');
        setError('');

        try {
            const res = await fetch('/api/p24/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(form.amount),
                    email: form.email,
                    description: form.description || 'Płatność Przelewy24',
                    client: form.client,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Redirect to P24 payment wall
            window.location.href = data.redirectUrl;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Błąd rejestracji transakcji');
            setStatus('error');
        }
    };

    // ─── Submit Handler ────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        switch (method) {
            case 'blik':
                handleBlikPayment();
                break;
            case 'google-pay':
                handleGooglePayPayment();
                break;
            case 'gateway':
                handleGatewayPayment();
                break;
        }
    };

    const resetForm = () => {
        setStatus('idle');
        setError('');
        setBlikCode(['', '', '', '', '', '']);
        setTransactionToken('');
    };

    // ─── Render ────────────────────────────────────────────────
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoRow}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
                            <rect width="32" height="32" rx="8" fill="#D42F2F" />
                            <text x="6" y="22" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui">P24</text>
                        </svg>
                        <div>
                            <h1 style={styles.title}>Płatność</h1>
                            <p style={styles.subtitle}>Przelewy24 • Bezpieczna transakcja</p>
                        </div>
                    </div>
                </div>

                {/* Success State */}
                {status === 'success' && (
                    <div style={styles.statusBox}>
                        <div style={styles.successIcon}>✓</div>
                        <h2 style={styles.statusTitle}>Płatność przyjęta</h2>
                        <p style={styles.statusText}>
                            Transakcja została zarejestrowana pomyślnie. Sprawdź potwierdzenie na e-mail.
                        </p>
                        <button style={styles.btnPrimary} onClick={resetForm}>
                            Nowa płatność
                        </button>
                    </div>
                )}

                {/* BLIK Confirm State */}
                {status === 'blik-confirm' && (
                    <div style={styles.statusBox}>
                        <div style={styles.blikSpinner}>
                            <div style={styles.spinnerRing} />
                        </div>
                        <h2 style={styles.statusTitle}>Potwierdź w aplikacji</h2>
                        <p style={styles.statusText}>
                            Otwórz aplikację bankową i zatwierdź płatność BLIK.
                            <br />
                            Masz 2 minuty na potwierdzenie.
                        </p>
                    </div>
                )}

                {/* Form */}
                {(status === 'idle' || status === 'error' || status === 'processing') && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Amount & Email */}
                        <div style={styles.fieldGroup}>
                            <div style={styles.field}>
                                <label style={styles.label}>Kwota (PLN)</label>
                                <div style={styles.amountInputWrap}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={(e) => updateForm('amount', e.target.value)}
                                        style={styles.amountInput}
                                        required
                                    />
                                    <span style={styles.amountCurrency}>PLN</span>
                                </div>
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>E-mail</label>
                                <input
                                    type="email"
                                    placeholder="jan@example.com"
                                    value={form.email}
                                    onChange={(e) => updateForm('email', e.target.value)}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <div style={styles.field}>
                                <label style={styles.label}>Opis (opcjonalnie)</label>
                                <input
                                    type="text"
                                    placeholder="Zamówienie #123"
                                    value={form.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Imię i nazwisko</label>
                                <input
                                    type="text"
                                    placeholder="Jan Kowalski"
                                    value={form.client}
                                    onChange={(e) => updateForm('client', e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={styles.divider} />

                        {/* Payment Method Selection */}
                        <label style={styles.label}>Metoda płatności</label>
                        <div style={styles.methodGrid}>
                            {/* BLIK */}
                            <button
                                type="button"
                                onClick={() => setMethod('blik')}
                                style={{
                                    ...styles.methodCard,
                                    ...(method === 'blik' ? styles.methodCardActive : {}),
                                }}
                            >
                                <div style={styles.methodIcon}>
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                        <rect width="28" height="28" rx="6" fill={method === 'blik' ? '#000' : '#E8E8E8'} />
                                        <rect x="4" y="8" width="6" height="12" rx="1" fill={method === 'blik' ? '#fff' : '#666'} />
                                        <rect x="11" y="6" width="6" height="16" rx="1" fill={method === 'blik' ? '#E8352D' : '#999'} />
                                        <rect x="18" y="10" width="6" height="8" rx="1" fill={method === 'blik' ? '#fff' : '#666'} />
                                    </svg>
                                </div>
                                <span style={styles.methodLabel}>BLIK</span>
                                <span style={styles.methodDesc}>Kod 6-cyfrowy</span>
                            </button>

                            {/* Google Pay */}
                            <button
                                type="button"
                                onClick={() => setMethod('google-pay')}
                                style={{
                                    ...styles.methodCard,
                                    ...(method === 'google-pay' ? styles.methodCardActive : {}),
                                }}
                            >
                                <div style={styles.methodIcon}>
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                        <rect width="28" height="28" rx="6" fill={method === 'google-pay' ? '#000' : '#E8E8E8'} />
                                        <text x="4" y="19" fill={method === 'google-pay' ? '#fff' : '#666'} fontSize="13" fontWeight="600" fontFamily="system-ui">
                                            G
                                        </text>
                                        <text x="13" y="19" fill={method === 'google-pay' ? '#4CAF50' : '#999'} fontSize="10" fontWeight="500" fontFamily="system-ui">
                                            Pay
                                        </text>
                                    </svg>
                                </div>
                                <span style={styles.methodLabel}>Google Pay</span>
                                <span style={styles.methodDesc}>Szybka płatność</span>
                            </button>

                            {/* Gateway */}
                            <button
                                type="button"
                                onClick={() => setMethod('gateway')}
                                style={{
                                    ...styles.methodCard,
                                    ...(method === 'gateway' ? styles.methodCardActive : {}),
                                }}
                            >
                                <div style={styles.methodIcon}>
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                        <rect width="28" height="28" rx="6" fill={method === 'gateway' ? '#D42F2F' : '#E8E8E8'} />
                                        <path
                                            d="M7 11h14M7 14h10M7 17h12"
                                            stroke={method === 'gateway' ? '#fff' : '#666'}
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <span style={styles.methodLabel}>Bramka P24</span>
                                <span style={styles.methodDesc}>Przelew / karta</span>
                            </button>
                        </div>

                        {/* BLIK Code Input */}
                        {method === 'blik' && (
                            <div style={styles.blikSection}>
                                <label style={styles.label}>Kod BLIK</label>
                                <p style={styles.blikHint}>
                                    Wpisz 6-cyfrowy kod z aplikacji bankowej
                                </p>
                                <div style={styles.blikInputRow} onPaste={handleBlikPaste}>
                                    {blikCode.map((digit, i) => (
                                        <React.Fragment key={i}>
                                            <input
                                                ref={(el) => { blikRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleBlikInput(i, e.target.value)}
                                                onKeyDown={(e) => handleBlikKeyDown(i, e)}
                                                style={{
                                                    ...styles.blikDigit,
                                                    ...(digit ? styles.blikDigitFilled : {}),
                                                }}
                                                disabled={status === 'processing'}
                                            />
                                            {i === 2 && <span style={styles.blikSeparator}>–</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Google Pay Info */}
                        {method === 'google-pay' && (
                            <div style={styles.infoBox}>
                                <span style={styles.infoIcon}>ℹ</span>
                                <p style={styles.infoText}>
                                    Po kliknięciu „Zapłać" zostaniesz przekierowany na stronę Przelewy24,
                                    gdzie dokończysz płatność przez Google Pay.
                                </p>
                            </div>
                        )}

                        {/* Gateway Info */}
                        {method === 'gateway' && (
                            <div style={styles.infoBox}>
                                <span style={styles.infoIcon}>ℹ</span>
                                <p style={styles.infoText}>
                                    Zostaniesz przekierowany na bezpieczną stronę Przelewy24, gdzie
                                    wybierzesz bank lub inną metodę płatności.
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div style={styles.errorBox}>
                                <span style={styles.errorIcon}>⚠</span>
                                <p style={styles.errorText}>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isFormValid() || status === 'processing'}
                            style={{
                                ...styles.btnPrimary,
                                ...((!isFormValid() || status === 'processing') ? styles.btnDisabled : {}),
                            }}
                        >
                            {status === 'processing' ? (
                                <span style={styles.btnLoading}>
                                    <span style={styles.btnSpinner} />
                                    Przetwarzanie...
                                </span>
                            ) : (
                                <>
                                    {method === 'blik' && `Zapłać BLIK${form.amount ? ` • ${parseFloat(form.amount).toFixed(2)} PLN` : ''}`}
                                    {method === 'google-pay' && `Zapłać Google Pay${form.amount ? ` • ${parseFloat(form.amount).toFixed(2)} PLN` : ''}`}
                                    {method === 'gateway' && `Przejdź do Przelewy24${form.amount ? ` • ${parseFloat(form.amount).toFixed(2)} PLN` : ''}`}
                                </>
                            )}
                        </button>

                        {/* Security Badge */}
                        <div style={styles.securityBadge}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M7 1L2 3.5V6.5C2 9.55 4.14 12.37 7 13C9.86 12.37 12 9.55 12 6.5V3.5L7 1Z"
                                    fill="#22C55E"
                                    opacity="0.2"
                                />
                                <path
                                    d="M7 1L2 3.5V6.5C2 9.55 4.14 12.37 7 13C9.86 12.37 12 9.55 12 6.5V3.5L7 1Z"
                                    stroke="#22C55E"
                                    strokeWidth="1.2"
                                />
                            </svg>
                            <span style={styles.securityText}>
                                Szyfrowane połączenie SSL • Przelewy24 by PayPro S.A.
                            </span>
                        </div>
                    </form>
                )}
            </div>

            {/* Inline keyframes */}
            <style>{`
        @keyframes p24spin {
          to { transform: rotate(360deg); }
        }
        @keyframes p24pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#F5F5F0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
        width: '100%',
        maxWidth: '520px',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.06)',
        overflow: 'hidden',
    },
    header: {
        padding: '24px 28px 20px',
        borderBottom: '1px solid #F0F0F0',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: 700,
        color: '#111',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        margin: '2px 0 0',
        fontSize: '13px',
        color: '#888',
        fontWeight: 400,
    },
    form: {
        padding: '24px 28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    fieldGroup: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#555',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    input: {
        padding: '10px 12px',
        fontSize: '14px',
        border: '1.5px solid #E0E0E0',
        borderRadius: '10px',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        color: '#111',
        background: '#FAFAFA',
    },
    amountInputWrap: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
    },
    amountInput: {
        width: '100%',
        padding: '10px 50px 10px 12px',
        fontSize: '14px',
        border: '1.5px solid #E0E0E0',
        borderRadius: '10px',
        outline: 'none',
        color: '#111',
        background: '#FAFAFA',
    },
    amountCurrency: {
        position: 'absolute' as const,
        right: '12px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#999',
        pointerEvents: 'none' as const,
    },
    divider: {
        height: '1px',
        background: '#F0F0F0',
        margin: '4px 0',
    },
    methodGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginTop: '6px',
    },
    methodCard: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '8px',
        padding: '16px 8px 14px',
        border: '1.5px solid #E8E8E8',
        borderRadius: '12px',
        background: '#FAFAFA',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    methodCardActive: {
        borderColor: '#111',
        background: '#FFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    methodIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodLabel: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#222',
        lineHeight: 1,
    },
    methodDesc: {
        fontSize: '11px',
        color: '#999',
        lineHeight: 1,
    },

    // BLIK
    blikSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    blikHint: {
        margin: 0,
        fontSize: '13px',
        color: '#777',
    },
    blikInputRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    blikDigit: {
        width: '48px',
        height: '56px',
        textAlign: 'center' as const,
        fontSize: '22px',
        fontWeight: 700,
        border: '2px solid #E0E0E0',
        borderRadius: '12px',
        outline: 'none',
        color: '#111',
        background: '#FAFAFA',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        caretColor: '#D42F2F',
    },
    blikDigitFilled: {
        borderColor: '#111',
        background: '#FFF',
    },
    blikSeparator: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#CCC',
        margin: '0 2px',
    },

    // Info / Error boxes
    infoBox: {
        display: 'flex',
        gap: '10px',
        padding: '12px 14px',
        background: '#F0F7FF',
        borderRadius: '10px',
        border: '1px solid #D0E3FF',
    },
    infoIcon: {
        flexShrink: 0,
        fontSize: '14px',
        color: '#3B82F6',
    },
    infoText: {
        margin: 0,
        fontSize: '13px',
        color: '#3B72C0',
        lineHeight: '1.5',
    },
    errorBox: {
        display: 'flex',
        gap: '10px',
        padding: '12px 14px',
        background: '#FFF5F5',
        borderRadius: '10px',
        border: '1px solid #FECACA',
    },
    errorIcon: {
        flexShrink: 0,
        fontSize: '14px',
    },
    errorText: {
        margin: 0,
        fontSize: '13px',
        color: '#DC2626',
        lineHeight: '1.5',
    },

    // Button
    btnPrimary: {
        padding: '14px 20px',
        fontSize: '15px',
        fontWeight: 600,
        color: '#FFF',
        background: '#111',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background 0.2s, transform 0.1s',
        marginTop: '4px',
    },
    btnDisabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
    },
    btnLoading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    btnSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#FFF',
        borderRadius: '50%',
        animation: 'p24spin 0.6s linear infinite',
    },

    // Security
    securityBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '4px',
    },
    securityText: {
        fontSize: '11px',
        color: '#AAA',
        fontWeight: 400,
    },

    // Status states
    statusBox: {
        padding: '48px 28px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center' as const,
    },
    successIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#ECFDF5',
        color: '#22C55E',
        fontSize: '28px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: 700,
        color: '#111',
    },
    statusText: {
        margin: 0,
        fontSize: '14px',
        color: '#777',
        lineHeight: 1.6,
        maxWidth: '320px',
    },
    blikSpinner: {
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerRing: {
        width: '48px',
        height: '48px',
        border: '3px solid #E8E8E8',
        borderTopColor: '#D42F2F',
        borderRadius: '50%',
        animation: 'p24spin 0.8s linear infinite',
    },
};
