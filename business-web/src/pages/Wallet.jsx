import { useState, useEffect, useRef } from 'react';
import { walletAPI } from '../services/api';

// ── Helper: convert File to base64 data URL ────────────────────────────────────
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// ── Step indicator ─────────────────────────────────────────────────────────────
const StepDot = ({ step, current, label }) => {
    const done = current > step;
    const active = current === step;
    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {done ? '✓' : step}
            </div>
            <span className={`text-xs ${active ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
        </div>
    );
};

// ── Payment method selector card ───────────────────────────────────────────────
const MethodCard = ({ icon, title, subtitle, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
            ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0
            ${selected ? 'bg-blue-100' : 'bg-gray-100'}`}>{icon}</div>
        <div>
            <p className={`font-semibold ${selected ? 'text-blue-700' : 'text-gray-800'}`}>{title}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {selected && <div className="ml-auto text-blue-500 text-xl shrink-0">✓</div>}
    </button>
);

// ── Multi-step Top-Up Modal ────────────────────────────────────────────────────
const TopUpModal = ({ onClose, onSuccess, paymentDetails }) => {
    const [step, setStep] = useState(1);           // 1=Amount  2=PayMode  3=Screenshot  4=Done
    const [amount, setAmount] = useState('');
    const [payMethod, setPayMethod] = useState('');  // 'BANK_TRANSFER' | 'UPI'
    const [transactionId, setTransactionId] = useState('');
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setScreenshotFile(file);
        setScreenshotPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!screenshotFile) { alert('Please upload a payment screenshot.'); return; }
        setSubmitting(true);
        try {
            const base64 = await fileToBase64(screenshotFile);
            await walletAPI.requestTopUp({
                amount: parseFloat(amount),
                paymentMethod: payMethod,
                paymentScreenshotUrl: base64,
                transactionId: transactionId.trim() || undefined,
            });
            setStep(4);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit request. Please try again.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const pd = paymentDetails || {};
    const amtFormatted = amount ? `₹${parseFloat(amount).toLocaleString()}` : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Top Up Wallet</h2>
                    <button onClick={onClose} className="text-white hover:text-blue-200 text-3xl leading-none w-8 h-8 flex items-center justify-center">×</button>
                </div>

                {/* Step indicator (only steps 1–3) */}
                {step < 4 && (
                    <div className="flex items-center justify-center gap-4 px-8 py-4 border-b border-gray-100">
                        <StepDot step={1} current={step} label="Amount" />
                        <div className="flex-1 h-0.5 bg-gray-200" />
                        <StepDot step={2} current={step} label="Payment" />
                        <div className="flex-1 h-0.5 bg-gray-200" />
                        <StepDot step={3} current={step} label="Screenshot" />
                    </div>
                )}

                <div className="p-6">

                    {/* ── STEP 1: Enter Amount ──────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Top-Up Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold select-none">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            {/* Quick-pick amounts */}
                            <div>
                                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Quick Select</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[500, 1000, 2500, 5000].map(v => (
                                        <button key={v} type="button"
                                            onClick={() => setAmount(String(v))}
                                            className={`py-2 rounded-lg text-sm font-medium border transition
                                                ${amount === String(v) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                                            ₹{v.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!amount || parseFloat(amount) <= 0) { alert('Please enter a valid amount.'); return; }
                                    setStep(2);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                            >
                                Next: Choose Payment Method →
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: Choose Payment Mode & View Details ─────────── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                                <span>Top-up amount</span>
                                <span className="font-bold text-blue-600 text-lg">{amtFormatted}</span>
                            </div>

                            <p className="text-sm font-semibold text-gray-700">Select Payment Method</p>

                            <MethodCard
                                icon="🏦"
                                title="Bank Transfer / NEFT / RTGS"
                                subtitle="Transfer directly to our bank account"
                                selected={payMethod === 'BANK_TRANSFER'}
                                onClick={() => setPayMethod('BANK_TRANSFER')}
                            />
                            <MethodCard
                                icon="📱"
                                title="UPI / QR Code"
                                subtitle="Pay via GPay, PhonePe, Paytm or any UPI app"
                                selected={payMethod === 'UPI'}
                                onClick={() => setPayMethod('UPI')}
                            />

                            {/* Bank details */}
                            {payMethod === 'BANK_TRANSFER' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
                                    <p className="font-semibold text-blue-800 mb-1">Bank Account Details</p>
                                    <div className="grid grid-cols-2 gap-y-1 text-gray-700">
                                        <span className="font-medium text-gray-500">Bank</span>
                                        <span>{pd.company_bank_name || '—'}</span>
                                        <span className="font-medium text-gray-500">Account No</span>
                                        <span className="font-mono font-bold">{pd.company_account_number || '—'}</span>
                                        <span className="font-medium text-gray-500">IFSC</span>
                                        <span className="font-mono">{pd.company_ifsc || '—'}</span>
                                        <span className="font-medium text-gray-500">Account Name</span>
                                        <span>{pd.company_account_holder || pd.company_bank_name || '—'}</span>
                                    </div>
                                    <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded p-2">
                                        ⚠ Transfer exactly <strong>{amtFormatted}</strong> and note your UTR / reference number.
                                    </p>
                                </div>
                            )}

                            {/* UPI / QR details */}
                            {payMethod === 'UPI' && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-center">
                                    <p className="font-semibold text-purple-800 mb-3">UPI / QR Code Payment</p>
                                    {pd.company_qr_code_url ? (
                                        <img src={pd.company_qr_code_url} alt="QR Code"
                                            className="w-40 h-40 mx-auto rounded-lg border border-purple-200 mb-3 object-contain" />
                                    ) : (
                                        <div className="w-40 h-40 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-3 text-purple-300 text-sm">
                                            No QR available
                                        </div>
                                    )}
                                    <p className="font-medium text-gray-700">
                                        UPI ID: <span className="font-mono text-purple-700">{pd.company_upi_id || '—'}</span>
                                    </p>
                                    <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded p-2">
                                        ⚠ Pay exactly <strong>{amtFormatted}</strong> and note your UPI transaction ID.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setStep(1)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => { if (!payMethod) { alert('Please select a payment method.'); return; } setStep(3); }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
                                    I've Paid →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Upload Screenshot ─────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {/* Summary bar */}
                            <div className="bg-gray-50 rounded-xl p-3 text-sm grid grid-cols-2 gap-1">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-blue-600 text-right">{amtFormatted}</span>
                                <span className="text-gray-500">Method</span>
                                <span className="font-medium text-right">{payMethod === 'UPI' ? 'UPI / QR Code' : 'Bank Transfer'}</span>
                            </div>

                            {/* Screenshot upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Payment Screenshot <span className="text-red-500">*</span>
                                </label>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                {screenshotPreview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-green-400">
                                        <img src={screenshotPreview} alt="Screenshot"
                                            className="w-full max-h-52 object-contain bg-gray-50" />
                                        <button type="button"
                                            onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); fileRef.current.value = ''; }}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow">
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => fileRef.current.click()}
                                        className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition">
                                        <span className="text-4xl">📷</span>
                                        <span className="text-sm font-medium">Tap to upload screenshot</span>
                                        <span className="text-xs">JPG, PNG supported</span>
                                    </button>
                                )}
                            </div>

                            {/* Optional transaction ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Transaction / UTR / UPI Ref ID
                                    <span className="text-gray-400 font-normal ml-1">(optional but recommended)</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="e.g. T2025021300012345"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setStep(2)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !screenshotFile}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition">
                                    {submitting ? 'Submitting…' : '✓ Submit Request'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Success ───────────────────────────────────── */}
                    {step === 4 && (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
                            <h3 className="text-xl font-bold text-gray-800">Request Submitted!</h3>
                            <p className="text-gray-600 text-sm">
                                Your top-up request of <strong className="text-blue-600">{amtFormatted}</strong> has been submitted successfully.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left">
                                <p className="font-semibold mb-1">⏳ Pending Admin Approval</p>
                                <p>Your wallet will be credited once the admin reviews and approves your payment. This typically takes a few hours.</p>
                            </div>
                            <button
                                onClick={() => { onSuccess(); onClose(); }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Wallet Page ───────────────────────────────────────────────────────────
const Wallet = () => {
    const [walletData, setWalletData] = useState({ balance: 0, total_received: 0, total_spent: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [walletRes, txnRes, pdRes] = await Promise.all([
                walletAPI.getBusinessBalance().catch(() => ({ data: { balance: 0 } })),
                walletAPI.getTransactions().catch(() => ({ data: { transactions: [] } })),
                walletAPI.getPaymentDetails().catch(() => ({ data: null })),
            ]);

            setWalletData({
                balance: walletRes.data?.balance ?? 0,
                total_received: walletRes.data?.total_received ?? 0,
                total_spent: walletRes.data?.total_spent ?? 0,
            });
            setTransactions(txnRes.data?.transactions || []);
            if (pdRes.data?.success && pdRes.data?.paymentDetails) {
                setPaymentDetails(pdRes.data.paymentDetails);
            }
        } catch (error) {
            console.error('Failed to load wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm opacity-80 mb-1">Available Balance</p>
                        <p className="text-5xl font-bold mb-4">₹{(walletData.balance || 0).toLocaleString()}</p>
                        <div className="flex gap-3 flex-wrap">
                            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                <p className="text-xs opacity-75">Total Received</p>
                                <p className="font-bold">₹{(walletData.total_received || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                <p className="text-xs opacity-75">Total Spent</p>
                                <p className="font-bold">₹{(walletData.total_spent || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTopUpModal(true)}
                        className="shrink-0 bg-white text-blue-600 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow transition flex items-center gap-2"
                    >
                        <span className="text-xl leading-none">+</span> Top Up
                    </button>
                </div>
            </div>

            {/* How-to info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-800">
                <span className="text-xl mt-0.5 shrink-0">ℹ️</span>
                <div>
                    <p className="font-semibold">How to top up</p>
                    <p className="mt-0.5 text-blue-700">Click <strong>Top Up</strong> → enter amount → pay via Bank Transfer or UPI → upload your payment screenshot → submit. Your balance will be credited after admin approval.</p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>

                {transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📜</div>
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                        <p className="text-sm text-gray-400 mt-1">Top up your wallet to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((txn) => {
                            const isCredit = txn.type === 'CREDIT' || txn.entryType === 'CREDIT';
                            return (
                                <div key={txn.id || txn._id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold
                                            ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {isCredit ? '↓' : '↑'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{txn.description || txn.referenceType || 'Transaction'}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(txn.created_at || txn.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-lg font-bold shrink-0 ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCredit ? '+' : '-'}₹{(txn.amount || 0).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <TopUpModal
                    onClose={() => setShowTopUpModal(false)}
                    onSuccess={loadData}
                    paymentDetails={paymentDetails}
                />
            )}
        </div>
    );
};

export default Wallet;
