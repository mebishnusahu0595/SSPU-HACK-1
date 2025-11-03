import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, FaCheckCircle, FaClock, FaTimesCircle, FaPlus,
  FaCalendarAlt, FaMoneyBillWave, FaFileContract, FaExclamationCircle
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClaimModal from '../components/ClaimModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Insurance() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState(null);
  const [form, setForm] = useState({ 
    policyNumber: '', 
    policyType: 'Crop Insurance', 
    providerName: '', 
    providerContact: '',
    providerEmail: '',
    coverageAmount: '', 
    premiumAmount: '', 
    premiumFrequency: 'Annual',
    startDate: '', 
    endDate: '', 
    propertyId: '' 
  });

  useEffect(() => { fetchPolicies(); }, []);

  async function fetchPolicies() {
    setLoading(true);
    try {
      const res = await api.get('/insurance');
      if (res.data?.success) setPolicies(res.data.data || []);
    } catch (err) {
      console.error('Fetch policies', err);
      toast.error('Failed to load policies');
    } finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.policyNumber || !form.providerName || !form.coverageAmount || !form.premiumAmount) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      // Format data according to Insurance model schema
      const payload = {
        policyNumber: form.policyNumber,
        policyType: form.policyType,
        provider: {
          name: form.providerName,
          contactNumber: form.providerContact,
          email: form.providerEmail
        },
        coverageAmount: parseFloat(form.coverageAmount),
        premium: {
          amount: parseFloat(form.premiumAmount),
          frequency: form.premiumFrequency
        },
        startDate: form.startDate,
        endDate: form.endDate,
        property: form.propertyId || undefined
      };

      const res = await api.post('/insurance', payload);
      if (res.data?.success) {
        toast.success('Insurance policy created!');
        setForm({ 
          policyNumber: '', 
          policyType: 'Crop Insurance', 
          providerName: '', 
          providerContact: '',
          providerEmail: '',
          coverageAmount: '', 
          premiumAmount: '', 
          premiumFrequency: 'Annual',
          startDate: '', 
          endDate: '', 
          propertyId: '' 
        });
        setShowForm(false);
        fetchPolicies();
      }
    } catch (err) {
      console.error('Create policy', err);
      toast.error(err.response?.data?.message || 'Failed to create policy');
    } finally { setCreating(false); }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'expired': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const handleFileClaimClick = (policy) => {
    setSelectedPolicyForClaim(policy);
    setClaimModalOpen(true);
  };

  const handleClaimModalClose = () => {
    setClaimModalOpen(false);
    setSelectedPolicyForClaim(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                  <FaShieldAlt className="mr-3 text-purple-600" />Insurance Policies
                </h1>
                <p className="text-gray-600">Manage your farm insurance coverage</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)} className="mt-4 md:mt-0 btn-primary flex items-center space-x-2 px-6 py-3">
                <FaPlus /><span>Add New Policy</span>
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-8 overflow-hidden">
                <div className="card bg-white p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FaFileContract className="mr-2 text-purple-600" />Create New Policy</h2>
                  <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Policy Number *</label><input placeholder="e.g., CROP-2025-001234" value={form.policyNumber} onChange={e => setForm({...form, policyNumber: e.target.value})} className="input-field" required /></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type *</label>
                      <select value={form.policyType} onChange={e => setForm({...form, policyType: e.target.value})} className="input-field" required>
                        <option value="Crop Insurance">Crop Insurance</option>
                        <option value="Weather-Based Insurance">Weather-Based Insurance</option>
                        <option value="Livestock Insurance">Livestock Insurance</option>
                        <option value="Farm Equipment Insurance">Farm Equipment Insurance</option>
                        <option value="Multi-Peril Crop Insurance">Multi-Peril Crop Insurance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider Name *</label><input placeholder="e.g., Agriculture Insurance Company" value={form.providerName} onChange={e => setForm({...form, providerName: e.target.value})} className="input-field" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Provider Contact</label><input placeholder="e.g., +91 9876543210" value={form.providerContact} onChange={e => setForm({...form, providerContact: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Provider Email</label><input type="email" placeholder="e.g., support@insurance.com" value={form.providerEmail} onChange={e => setForm({...form, providerEmail: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Coverage Amount (₹) *</label><input type="number" placeholder="e.g., 500000" value={form.coverageAmount} onChange={e => setForm({...form, coverageAmount: e.target.value})} className="input-field" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Premium Amount (₹) *</label><input type="number" placeholder="e.g., 15000" value={form.premiumAmount} onChange={e => setForm({...form, premiumAmount: e.target.value})} className="input-field" required /></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Premium Frequency *</label>
                      <select value={form.premiumFrequency} onChange={e => setForm({...form, premiumFrequency: e.target.value})} className="input-field" required>
                        <option value="Annual">Annual</option>
                        <option value="Semi-Annual">Semi-Annual</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="One-Time">One-Time</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Property ID (Optional)</label><input placeholder="Link to property" value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" required /></div>
                    <div className="md:col-span-2 flex gap-4">
                      <button type="submit" disabled={creating} className="btn-primary px-6 py-3 disabled:opacity-50 flex items-center space-x-2">{creating ? <><div className="spinner w-5 h-5" /><span>Creating...</span></> : <><FaPlus /><span>Create Policy</span></>}</button>
                      <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-6 py-3">Cancel</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Policies ({policies.length})</h2>
            {loading ? (
              <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>
            ) : policies.length === 0 ? (
              <div className="text-center py-12">
                <FaShieldAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No insurance policies yet</p>
                <p className="text-gray-500 text-sm mb-6">Protect your farm with comprehensive insurance coverage</p>
                <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center space-x-2 px-6 py-3"><FaPlus /><span>Add Your First Policy</span></button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {policies.map((policy, index) => (
                  <motion.div key={policy._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5, scale: 1.02 }} className="p-6 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100">
                    <div className="flex justify-between items-start mb-4">
                      <div><h3 className="text-xl font-bold text-gray-800 mb-1">{policy.policyNumber}</h3><p className="text-gray-600">{policy.provider?.name || policy.provider || 'N/A'}</p></div>
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(policy.status)}`}>{getStatusIcon(policy.status)}<span>{policy.status || 'Active'}</span></span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-700"><FaFileContract className="text-purple-600" /><span className="text-sm"><span className="font-medium">Type:</span> {policy.policyType}</span></div>
                      <div className="flex items-center space-x-2 text-gray-700"><FaMoneyBillWave className="text-green-600" /><span className="text-sm"><span className="font-medium">Coverage:</span> ₹{Number(policy.coverageAmount).toLocaleString('en-IN')}</span></div>
                      <div className="flex items-center space-x-2 text-gray-700"><FaMoneyBillWave className="text-blue-600" /><span className="text-sm"><span className="font-medium">Premium:</span> ₹{Number(policy.premium?.amount || policy.premium || 0).toLocaleString('en-IN')}/{policy.premium?.frequency || 'year'}</span></div>
                      <div className="flex items-center space-x-2 text-gray-700"><FaCalendarAlt className="text-orange-600" /><span className="text-sm"><span className="font-medium">Valid:</span> {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}</span></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200 flex gap-2">
                      <button className="btn-primary flex-1 py-2 text-sm">View Details</button>
                      <button 
                        onClick={() => handleFileClaimClick(policy)}
                        className="btn-outline flex-1 py-2 text-sm hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all flex items-center justify-center space-x-1"
                      >
                        <FaExclamationCircle />
                        <span>File Claim</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={handleClaimModalClose}
        policyId={selectedPolicyForClaim?._id}
        propertyId={selectedPolicyForClaim?.property}
      />

      <Footer />
    </div>
  );
}
