import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, FaClock, FaTimesCircle, FaSpinner, 
  FaSatellite, FaChartLine, FaMapMarkedAlt, FaCalendarAlt,
  FaMoneyBillWave, FaExclamationTriangle, FaRobot, FaFileAlt
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ClaimsDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims');
      if (res.data?.success) {
        setClaims(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch claims error:', err);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'green', icon: <FaCheckCircle />, label: 'Approved' },
      processing: { color: 'blue', icon: <FaSpinner className="animate-spin" />, label: 'Processing' },
      under_review: { color: 'yellow', icon: <FaClock />, label: 'Under Review' },
      rejected: { color: 'red', icon: <FaTimesCircle />, label: 'Rejected' },
      paid: { color: 'emerald', icon: <FaCheckCircle />, label: 'Paid' }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.processing;

    return (
      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-200`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      CRITICAL: 'red',
      HIGH: 'orange',
      MEDIUM: 'yellow',
      LOW: 'green'
    };
    const color = colors[severity] || 'gray';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                  <FaFileAlt className="mr-3 text-primary-600" />
                  Insurance Claims
                </h1>
                <p className="text-gray-600">Track your GeoAI verified insurance claims</p>
              </div>
              <div className="mt-4 md:mt-0 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{claims.filter(c => c.status === 'approved' || c.status === 'paid').length}</div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{claims.filter(c => c.status === 'processing' || c.status === 'under_review').length}</div>
                  <div className="text-xs text-gray-600">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{claims.filter(c => c.status === 'rejected').length}</div>
                  <div className="text-xs text-gray-600">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="spinner w-12 h-12" />
              </div>
            ) : claims.length === 0 ? (
              <div className="card bg-white text-center py-20">
                <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Claims Yet</h3>
                <p className="text-gray-500 mb-6">You haven't filed any insurance claims</p>
                <a href="/insurance" className="btn-primary inline-flex items-center space-x-2">
                  <FaExclamationTriangle />
                  <span>File Your First Claim</span>
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {claims.map((claim, index) => (
                  <div
                    key={claim._id}
                    className="card bg-white hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Claim Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{claim.claimId}</h3>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-gray-600 text-sm">
                          Filed on {new Date(claim.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(claim.estimatedPayout || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">Estimated Payout</div>
                      </div>
                    </div>

                    {/* Claim Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Property Info */}
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-700 mb-2">
                          <FaMapMarkedAlt />
                          <span className="font-semibold text-sm">Property</span>
                        </div>
                        <div className="text-gray-800 font-medium">
                          {claim.property?.propertyName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {claim.property?.currentCrop} • {claim.property?.area} ha
                        </div>
                      </div>

                      {/* Damage Assessment */}
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-2 text-orange-700 mb-2">
                          <FaChartLine />
                          <span className="font-semibold text-sm">GeoAI Assessment</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                          {claim.damageScore || claim.claimedDamagePercent || 0}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {getSeverityBadge(claim.severity || 'MEDIUM')}
                        </div>
                      </div>

                      {/* Processing Time */}
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-2 text-purple-700 mb-2">
                          <FaClock />
                          <span className="font-semibold text-sm">Processing</span>
                        </div>
                        <div className="text-gray-800 font-medium">
                          {claim.processingTime || '45 seconds'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          GeoAI Verified ✓
                        </div>
                      </div>
                    </div>

                    {/* NDVI Evidence (if available) */}
                    {claim.evidence && (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 mb-6">
                        <div className="flex items-center space-x-2 text-gray-700 mb-3">
                          <FaSatellite className="text-primary-600" />
                          <span className="font-semibold">Satellite Evidence (NDVI)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Historical (Healthy)</div>
                            <div className="text-xl font-bold text-green-600">
                              {claim.evidence.historicalNDVI || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Current (Damaged)</div>
                            <div className="text-xl font-bold text-red-600">
                              {claim.evidence.currentNDVI || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Damage Reason */}
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                      <div className="flex items-start space-x-2">
                        <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-yellow-900 mb-1">Damage Reason</div>
                          <div className="text-sm text-gray-700">{claim.reason || 'Not specified'}</div>
                          {claim.description && (
                            <div className="text-xs text-gray-600 mt-2">{claim.description}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-green-600">
                          <FaCheckCircle />
                          <span>GeoAI Verified</span>
                        </div>
                        {claim.status === 'approved' || claim.status === 'paid' ? (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <FaClock />
                            <span>Payout in 3-5 days</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <FaClock />
                            <span>Under Review</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="flex-1 btn-primary py-2 text-sm"
                      >
                        View Full Report
                      </button>
                      <button className="flex-1 btn-outline py-2 text-sm">
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GeoAI Info Banner */}
          <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-200">
            <div className="flex items-start space-x-4">
              <FaRobot className="text-4xl text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  About GeoAI Verification
                </h3>
                <p className="text-gray-700 text-sm">
                  All claims are automatically verified using Sentinel-2 satellite imagery and NDVI analysis. 
                  Our AI system compares current crop health with historical baselines to accurately assess 
                  damage and detect potential fraud. This ensures fair and fast claim processing without 
                  manual field inspections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Detail Modal (if needed) */}
      {selectedClaim && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClaim(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Claim Details</h2>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>
              
              {/* Full claim details can be added here */}
              <div className="space-y-4">
                <p className="text-gray-600">Full claim report coming soon...</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      <Footer />
    </div>
  );
}
