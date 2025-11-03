import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle,
  FaRobot, FaSignOutAlt, FaEye, FaDownload, FaSearch, FaFilter, FaMapMarkedAlt, FaFilePdf
} from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AIChatbot from '../components/AIChatbot';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'properties'
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return;
    
    const initDashboard = async () => {
      const isAuth = checkAuth();
      if (isAuth) {
        await fetchDashboardData();
        await fetchPendingDocuments();
        await fetchProperties();
        isInitialized.current = true;
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
    
    // Only set admin data if not already set
    if (!adminData) {
      setAdminData(JSON.parse(admin));
    }
    
    // Set auth header for all API requests
    if (!api.defaults.headers.common['Authorization']) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Admin auth configured');
    }
    
    return true;
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
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

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const res = await api.get('/admin/properties');
      if (res.data?.success) {
        setProperties(res.data.data);
      }
    } catch (err) {
      console.error('Fetch properties error:', err);
      toast.error('Failed to load properties');
    } finally {
      setLoadingProperties(false);
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
                         doc.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              icon={<FaUsers className="text-4xl" />}
              title="Total Users"
              value={stats.totalUsers}
              color="blue"
            />
            <StatCard
              icon={<FaMapMarkedAlt className="text-4xl" />}
              title="Total Properties"
              value={stats.totalProperties}
              color="purple"
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition-all ${
                activeTab === 'documents'
                  ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Documents ({pendingDocuments.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition-all ${
                activeTab === 'properties'
                  ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaMapMarkedAlt className="inline mr-2" />
              Properties ({properties.length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'documents' ? "Search by document name or user..." : "Search by property name or farmer..."}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {activeTab === 'documents' && (
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
            )}
          </div>
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-yellow-200">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
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
                        <div className="font-medium text-gray-800">{doc.farmer?.name}</div>
                        <div className="text-sm text-gray-500">{doc.farmer?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {doc.verificationMethod || 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          doc.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.verificationStatus === 'verified' ? 'Verified' :
                           doc.verificationStatus === 'rejected' ? 'Rejected' :
                           doc.status || 'Pending'}
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
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaMapMarkedAlt className="mr-3 text-blue-600" />
                All Properties
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all registered farm properties
              </p>
            </div>

            {loadingProperties ? (
              <div className="p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="p-12 text-center">
                <FaMapMarkedAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Properties Yet</h3>
                <p className="text-gray-600">No properties have been registered!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Property Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Area
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Soil Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Current Crop
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {properties
                      .filter(prop => {
                        const matchesSearch = prop.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            prop.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                        return matchesSearch;
                      })
                      .map((property, index) => (
                        <motion.tr
                          key={property._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{property.propertyName}</div>
                            <div className="text-sm text-gray-500">{property.propertyType || 'Agricultural Land'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{property.farmer?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{property.farmer?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-800">
                              {property.area?.value} {property.area?.unit || 'acres'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {property.soilType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-800">{property.currentCrop || 'Not specified'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedProperty(property)}
                              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaEye />
                              <span>View</span>
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h3 className="text-2xl font-bold">Property Details</h3>
              <p className="text-blue-100">View property information</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Property Name</label>
                  <p className="text-gray-800 font-medium">{selectedProperty.propertyName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Property Type</label>
                  <p className="text-gray-800 font-medium">{selectedProperty.propertyType || 'Agricultural Land'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Farmer</label>
                  <p className="text-gray-800 font-medium">{selectedProperty.farmer?.name}</p>
                  <p className="text-sm text-gray-500">{selectedProperty.farmer?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Area</label>
                  <p className="text-gray-800 font-medium">
                    {selectedProperty.area?.value} {selectedProperty.area?.unit || 'acres'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Soil Type</label>
                  <p className="text-gray-800 font-medium">{selectedProperty.soilType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Current Crop</label>
                  <p className="text-gray-800 font-medium">{selectedProperty.currentCrop || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Irrigation Type</label>
                  <p className="text-gray-800 font-medium">{selectedProperty.irrigationType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Created Date</label>
                  <p className="text-gray-800 font-medium">
                    {new Date(selectedProperty.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedProperty.address && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <p className="text-gray-800">
                    {[
                      selectedProperty.address.village,
                      selectedProperty.address.district,
                      selectedProperty.address.state,
                      selectedProperty.address.pincode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
                  <p className="text-gray-800 font-medium">{selectedDoc.farmer?.name}</p>
                  <p className="text-sm text-gray-500">{selectedDoc.farmer?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Upload Date</label>
                  <p className="text-gray-800 font-medium">
                    {new Date(selectedDoc.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Document Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Document Preview</label>
                {selectedDoc.mimeType?.startsWith('image/') ? (
                  <img
                    src={`http://localhost:5000/api/documents/download/${selectedDoc.fileId}`}
                    alt={selectedDoc.documentName}
                    className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain bg-white"
                  />
                ) : selectedDoc.mimeType === 'application/pdf' ? (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <FaFilePdf className="text-6xl text-red-500 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-3">PDF Document</p>
                    <button
                      onClick={() => downloadDocument(selectedDoc.fileId, selectedDoc.filename)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                    >
                      <FaDownload />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-3">{selectedDoc.filename}</p>
                    <button
                      onClick={() => downloadDocument(selectedDoc.fileId, selectedDoc.filename)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                    >
                      <FaDownload />
                      <span>Download Document</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Remarks {(selectedDoc.status === 'Pending' || selectedDoc.status === 'Pending Verification') && <span className="text-red-500">*</span>}
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
                {(selectedDoc.verificationStatus === 'pending' || selectedDoc.status === 'Pending Verification') && (
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
      
      {/* AI Chatbot */}
      <AIChatbot />
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
