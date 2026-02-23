import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../services/api';

// ── helpers ──────────────────────────────────────────────────────────────────
const APPROVAL_BADGE = {
    APPROVED: { label: 'Approved',      cls: 'bg-green-100 text-green-700 border-green-200' },
    PENDING:  { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    REJECTED: { label: 'Rejected',       cls: 'bg-red-100 text-red-700 border-red-200' },
    NEW:      { label: 'Under Review',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const InfoRow = ({ label, value, mono }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0 gap-1">
        <span className="text-sm font-medium text-gray-500 sm:w-44 shrink-0">{label}</span>
        <span className={`text-sm font-semibold text-gray-800 break-all ${mono ? 'font-mono' : ''}`}>
            {value || <span className="text-gray-300 font-normal">—</span>}
        </span>
    </div>
);

const SectionHeading = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-gray-100">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-gray-700">{title}</h2>
    </div>
);

// ── field helper for edit form ───────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm';

// ── component ──────────────────────────────────────────────────────────────────
const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});

    // Fetch real business profile from backend
    useEffect(() => {
        (async () => {
            try {
                const res = await businessAPI.getProfile();
                if (res.data?.success && res.data?.profile) {
                    setProfile(res.data.profile);
                    initForm(res.data.profile);
                }
            } catch (err) {
                console.error('Failed to load business profile:', err);
            } finally {
                setPageLoading(false);
            }
        })();
    }, []);

    const initForm = (p) => {
        setForm({
            businessName:       p.business_name       || '',
            businessType:       p.business_type       || '',
            registrationNumber: p.registration_number || '',
            pan:                p.pan                 || '',
            gst:                p.gst                 || '',
            address:            p.address             || '',
            city:               p.city                || '',
            state:              p.state               || '',
            pincode:            p.pincode             || '',
            contactPerson:      p.contact_person      || '',
            contactMobile:      p.contact_mobile      || '',
            contactEmail:       p.contact_email       || '',
            bankName:           p.bank_name           || '',
            accountNumber:      p.account_number      || '',
            ifscCode:           p.ifsc_code           || '',
        });
    };

    const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await businessAPI.updateProfile({ businessData: form });
            // Re-fetch to get latest server state
            const res = await businessAPI.getProfile();
            if (res.data?.success && res.data?.profile) {
                setProfile(res.data.profile);
                initForm(res.data.profile);
            }
            setEditing(false);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save. Please try again.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEditCancel = () => {
        if (profile) initForm(profile);
        setEditing(false);
    };

    // ── loading ───────────────────────────────────────────────────────────────
    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── no profile ────────────────────────────────────────────────────────────
    if (!profile) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Business Profile</h1>
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <p className="text-xl font-semibold text-gray-700">No Business Profile Found</p>
                    <p className="text-sm text-gray-400 mt-2">Complete your business onboarding to set up your profile.</p>
                </div>
            </div>
        );
    }

    const badge = APPROVAL_BADGE[profile.approval_status] || APPROVAL_BADGE['NEW'];

    // ── VIEW mode ─────────────────────────────────────────────────────────────
    if (!editing) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{profile.business_name || 'Business Profile'}</h1>
                        <p className="text-sm text-gray-500 mt-1">Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>
                            {badge.label}
                        </span>
                        <button
                            onClick={() => setEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition text-sm"
                        >
                            ✏ Edit Profile
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── Business Information ─── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHeading icon="🏢" title="Business Information" />
                        <InfoRow label="Business Name"    value={profile.business_name} />
                        <InfoRow label="Business Type"    value={profile.business_type} />
                        <InfoRow label="Reg. Number"      value={profile.registration_number} mono />
                        <InfoRow label="Account Email"    value={user?.email} />
                        <InfoRow label="Contact Person"   value={profile.contact_person} />
                        <InfoRow label="Contact Mobile"   value={profile.contact_mobile} />
                        <InfoRow label="Contact Email"    value={profile.contact_email} />
                    </div>

                    {/* ── Address ─── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHeading icon="📍" title="Address" />
                        <InfoRow label="Street / Area"    value={profile.address} />
                        <InfoRow label="City"             value={profile.city} />
                        <InfoRow label="State"            value={profile.state} />
                        <InfoRow label="Pincode"          value={profile.pincode} mono />
                    </div>

                    {/* ── Tax Information ─── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHeading icon="📄" title="Tax Information" />
                        <InfoRow label="PAN Number"       value={profile.pan} mono />
                        <InfoRow label="GST Number"       value={profile.gst} mono />
                    </div>

                    {/* ── Banking Information ─── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHeading icon="🏦" title="Banking Information" />
                        <InfoRow label="Bank Name"        value={profile.bank_name} />
                        <InfoRow label="Account Number"   value={profile.account_number} mono />
                        <InfoRow label="IFSC Code"        value={profile.ifsc_code} mono />
                    </div>

                </div>

                {/* Account status bar */}
                <div className={`rounded-xl border p-4 flex items-start gap-3 text-sm ${badge.cls}`}>
                    <span className="text-lg shrink-0">
                        {profile.approval_status === 'APPROVED' ? '✅' : profile.approval_status === 'REJECTED' ? '❌' : '⏳'}
                    </span>
                    <div>
                        <p className="font-semibold">Account Status: {badge.label}</p>
                        {profile.approval_status === 'APPROVED' && <p className="mt-0.5 opacity-80">Your business profile has been verified and approved. You have full access to all features.</p>}
                        {profile.approval_status === 'REJECTED' && <p className="mt-0.5 opacity-80">Your profile was rejected. Please update your details and re-submit.</p>}
                        {(!profile.approval_status || profile.approval_status === 'NEW' || profile.approval_status === 'PENDING') && (
                            <p className="mt-0.5 opacity-80">Your profile is pending review by our team. You will be notified once approved.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── EDIT mode ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-800">Edit Business Profile</h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Business Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <SectionHeading icon="🏢" title="Business Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Business Name">
                            <input type="text" value={form.businessName} onChange={f('businessName')} className={inputCls} placeholder="e.g. Acme Pvt Ltd" />
                        </Field>
                        <Field label="Business Type">
                            <select value={form.businessType} onChange={f('businessType')} className={inputCls}>
                                <option value="">Select type</option>
                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                <option value="Partnership">Partnership</option>
                                <option value="LLP">LLP</option>
                                <option value="Private Limited">Private Limited</option>
                                <option value="Public Limited">Public Limited</option>
                                <option value="Other">Other</option>
                            </select>
                        </Field>
                        <Field label="Registration Number">
                            <input type="text" value={form.registrationNumber} onChange={f('registrationNumber')} className={inputCls} placeholder="Company registration number" />
                        </Field>
                        <Field label="Contact Person">
                            <input type="text" value={form.contactPerson} onChange={f('contactPerson')} className={inputCls} placeholder="Primary contact name" />
                        </Field>
                        <Field label="Contact Mobile">
                            <input type="tel" value={form.contactMobile} onChange={f('contactMobile')} className={inputCls} placeholder="+91 XXXXX XXXXX" />
                        </Field>
                        <Field label="Contact Email">
                            <input type="email" value={form.contactEmail} onChange={f('contactEmail')} className={inputCls} placeholder="contact@yourbusiness.com" />
                        </Field>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <SectionHeading icon="📍" title="Address" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Street / Area">
                            <input type="text" value={form.address} onChange={f('address')} className={inputCls} placeholder="Street, area, locality" />
                        </Field>
                        <Field label="City">
                            <input type="text" value={form.city} onChange={f('city')} className={inputCls} placeholder="City" />
                        </Field>
                        <Field label="State">
                            <input type="text" value={form.state} onChange={f('state')} className={inputCls} placeholder="State" />
                        </Field>
                        <Field label="Pincode">
                            <input type="text" value={form.pincode} onChange={f('pincode')} className={inputCls} placeholder="6-digit pincode" maxLength={6} />
                        </Field>
                    </div>
                </div>

                {/* Tax Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <SectionHeading icon="📄" title="Tax Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="PAN Number">
                            <input type="text" value={form.pan} onChange={f('pan')} className={inputCls} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
                        </Field>
                        <Field label="GST Number">
                            <input type="text" value={form.gst} onChange={f('gst')} className={inputCls} placeholder="22ABCDE1234F1Z5" maxLength={15} style={{ textTransform: 'uppercase' }} />
                        </Field>
                    </div>
                </div>

                {/* Banking Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <SectionHeading icon="🏦" title="Banking Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Bank Name">
                            <input type="text" value={form.bankName} onChange={f('bankName')} className={inputCls} placeholder="Bank name" />
                        </Field>
                        <Field label="Account Number">
                            <input type="text" value={form.accountNumber} onChange={f('accountNumber')} className={inputCls} placeholder="Account number" />
                        </Field>
                        <Field label="IFSC Code">
                            <input type="text" value={form.ifscCode} onChange={f('ifscCode')} className={inputCls} placeholder="e.g. SBIN0001234" maxLength={11} style={{ textTransform: 'uppercase' }} />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
                    >
                        {saving ? 'Saving…' : '✓ Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={handleEditCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
