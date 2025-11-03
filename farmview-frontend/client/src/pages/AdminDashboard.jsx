import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle,
  FaRobot, FaSignOutAlt, FaEye, FaDownload, FaSearch, FaFilter
} from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const initDashboard = async () => {
      const isAuth = checkAuth();
      if (isAuth) {
        await fetchDashboardData();
        await fetchPendingDocuments();
      }
    };
    initDashboard();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('adminData');
    
    if (!token || !admin) {
      toast.error('Please login as admin');
      navigate('/admin/login');
      return false;
    }
    
    setAdminData(JSON.parse(admin));
    
    // Set auth header for all API requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Admin auth configured');
    
    return true;
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔑 Admin token:', token ? 'Present' : 'Missing');
      console.log('📡 Fetching dashboard stats...');
      
      const res = await api.get('/admin/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
        console.log('✅ Dashboard stats loaded');
      }
    } catch (err) {
      console.error('❌ Fetch stats error:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Admin session expired. Please login again.');
        handleLogout();
      }
    }
  };

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/documents/pending');
      if (res.data?.success) {
        setPendingDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Fetch pending documents error:', err);
      toast.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId, status) => {
    if (!remarks && status === 'Rejected') {
      toast.error('Please provide remarks for rejection');
      return;
    }

    setVerifyingDoc(documentId);
    try {
      const res = await api.put(`/admin/documents/${documentId}/verify`, {
        status,
        remarks: remarks || (status === 'Verified' ? 'Manually verified by admin' : '')
      });

      if (res.data?.success) {
        toast.success(`Document ${status.toLowerCase()} successfully!`);
        setSelectedDoc(null);
        setRemarks('');
        fetchDashboardData();
        fetchPendingDocuments();
      }
    } catch (err) {
      console.error('Verify document error:', err);
      toast.error(err.response?.data?.message || 'Failed to verify document');
    } finally {
      setVerifyingDoc(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const downloadDocument = async (docId, filename) => {
    try {
      const res = await api.get(`/documents/download/${docId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  const filteredDocuments = pendingDocuments.filter(doc => {
    const matchesSearch = doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!adminData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100">Welcome back, {adminData.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-all"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FaUsers className="text-4xl" />}
              title="Total Users"
              value={stats.totalUsers}
              color="blue"
            />
            <StatCard
              icon={<FaFileAlt className="text-4xl" />}
              title="Total Documents"
              value={stats.totalDocuments}
              color="purple"
            />
            <StatCard
              icon={<FaClock className="text-4xl" />}
              title="Pending (Manual)"
              value={stats.pendingDocuments}
              color="yellow"
            />
            <StatCard
              icon={<FaCheckCircle className="text-4xl" />}
              title="Verified"
              value={stats.verifiedDocuments}
              color="green"
            />
          </div>
        )}

        {/* AI Verified Info */}
        {stats && stats.aiVerifiedDocuments > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <FaRobot className="text-3xl text-green-600" />
              <div>
                <h3 className="font-bold text-green-900">AI Auto-Verified Documents</h3>
                <p className="text-sm text-green-700">
                  {stats.aiVerifiedDocuments} documents were automatically verified by AI (OCR + Gemini).
                  These don't require manual verification.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by document name or user..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pending Documents Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaClock className="mr-3 text-yellow-600" />
              Pending Documents for Manual Verification
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Only manually uploaded documents are shown here. AI-verified documents are automatically processed.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Documents</h3>
              <p className="text-gray-600">All documents have been verified or filtered out!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc, index) => (
                    <motion.tr
                      key={doc._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{doc.documentName}</div>
                        <div className="text-sm text-gray-500">{doc.documentType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{doc.uploadedBy?.name}</div>
                        <div className="text-sm text-gray-500">{doc.uploadedBy?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {doc.verificationMethod || 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                          doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FaEye />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(doc.fileId, doc.filename)}
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Verification Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h3 className="text-2xl font-bold">Document Verification</h3>
              <p className="text-blue-100">Review and verify document details</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Document Name</label>
                  <p className="text-gray-800 font-medium">{selectedDoc.documentName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Document Type</label>
                  <p className="text-gray-800 font-medium">{selectedDoc.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Uploaded By</label>
                  <p className="text-gray-800 font-medium">{selectedDoc.uploadedBy?.name}</p>
                  <p className="text-sm text-gray-500">{selectedDoc.uploadedBy?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Upload Date</label>
                  <p className="text-gray-800 font-medium">
                    {new Date(selectedDoc.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Remarks {selectedDoc.status === 'Pending' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter your remarks or reason for rejection..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                {selectedDoc.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleVerify(selectedDoc._id, 'Verified')}
                      disabled={verifyingDoc === selectedDoc._id}
                      className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <FaCheckCircle />
                      <span>Verify Document</span>
                    </button>
                    <button
                      onClick={() => handleVerify(selectedDoc._id, 'Rejected')}
                      disabled={verifyingDoc === selectedDoc._id || !remarks}
                      className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <FaTimesCircle />
                      <span>Reject Document</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setRemarks('');
                  }}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// StatCard Component
function StatCard({ icon, title, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </motion.div>
  );
}
