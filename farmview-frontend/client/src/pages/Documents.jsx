import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCloudUploadAlt, 
  FaFileAlt, 
  FaFilePdf, 
  FaFileImage, 
  FaFileWord,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaSearch,
  FaRobot,
  FaShieldAlt
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DocumentVerificationModal from '../components/DocumentVerificationModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Documents() {
  const { t } = useTranslation();
  const [files, setFiles] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [meta, setMeta] = useState({ 
    documentType: 'Land Documents', 
    documentName: '' 
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      if (res.data?.success) setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Fetch docs', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  const handleVerificationComplete = (verificationResult) => {
    // Refresh documents list after successful verification
    fetchDocuments();
    
    // Store verification data if needed for property registration
    if (verificationResult.status === 'verified') {
      localStorage.setItem('lastVerifiedDocument', JSON.stringify({
        extractedFields: verificationResult.extractedFields,
        verificationScore: verificationResult.matchScore,
        documentId: verificationResult.document?._id,
        timestamp: new Date().toISOString()
      }));
      
      toast.success('Document verified! You can now register your property.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(e.dataTransfer.files);
    }
  };

  function handleFileChange(e) {
    setFiles(e.target.files);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error('Please select a file');
      return;
    }
    if (!meta.documentName) {
      toast.error('Please provide a document name');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('documentType', meta.documentType);
      formData.append('documentName', meta.documentName);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        toast.success('Document uploaded successfully!');
        setFiles(null);
        setMeta({ documentType: 'Land Documents', documentName: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocuments();
      }
    } catch (err) {
      console.error('Upload error', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(id, name) {
    try {
      const res = await api.get(`/documents/file/${id}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (err) {
      console.error('Download error', err);
      toast.error('Failed to download document');
    }
  }

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FaFilePdf className="text-red-500 text-3xl" />;
    if (type?.includes('image')) return <FaFileImage className="text-blue-500 text-3xl" />;
    if (type?.includes('word') || type?.includes('doc')) return <FaFileWord className="text-blue-600 text-3xl" />;
    return <FaFileAlt className="text-gray-500 text-3xl" />;
  };

  const getStatusIcon = (status) => {
    if (status === 'Verified') return <FaCheckCircle className="text-green-500" />;
    if (status === 'Pending') return <FaClock className="text-yellow-500" />;
    return <FaTimes className="text-gray-400" />;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📄 {t('documents.title')}
            </h1>
            <p className="text-gray-600">Manage all your farm-related documents securely</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Documents List */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card bg-white"
              >
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Your Documents ({filteredDocuments.length})
                </h2>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="spinner w-10 h-10" />
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      {searchTerm ? 'No documents found' : 'No documents uploaded yet'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchTerm ? 'Try a different search term' : 'Upload your first document to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredDocuments.map((doc, index) => {
                        const isAIVerified = doc.verificationStatus === 'auto-verified' || doc.verificationMethod === 'ocr-ai';
                        const verificationScore = doc.verificationScore;
                        
                        return (
                          <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border ${
                              isAIVerified 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                : 'bg-gradient-to-r from-white to-gray-50 border-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-grow">
                                {getFileIcon(doc.fileType)}
                                <div className="flex-grow">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-800 text-lg">
                                      {doc.documentName}
                                    </span>
                                    {isAIVerified && (
                                      <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                                        <FaRobot />
                                        <span>AI Verified</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                      {doc.documentType}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(doc.status)}
                                      <span>{doc.status}</span>
                                    </div>
                                    {isAIVerified && verificationScore && (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                                        {verificationScore}% Match
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(doc._id, doc.documentName)}
                                className="btn-primary px-4 py-2 flex items-center space-x-2"
                              >
                                <FaDownload />
                                <span className="hidden sm:inline">Download</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Upload Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Verification Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card bg-gradient-to-br from-blue-600 to-purple-600 text-white sticky top-24"
              >
                <div className="flex items-center mb-4">
                  <FaRobot className="text-4xl mr-3" />
                  <div>
                    <h2 className="text-xl font-bold">AI Document Verification</h2>
                    <p className="text-sm text-blue-100">Automated fraud prevention</p>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="flex items-start mb-3">
                    <FaShieldAlt className="text-2xl mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">How it works:</h3>
                      <ul className="text-sm space-y-1 text-blue-100">
                        <li>• Upload land documents (7/12, Survey Doc)</li>
                        <li>• AI extracts text using OCR</li>
                        <li>• Validates data automatically</li>
                        <li>• Auto-approves if match &gt; 85%</li>
                        <li>• No manual verification needed!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setVerificationModalOpen(true)}
                  className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group"
                >
                  <FaRobot className="text-2xl group-hover:animate-pulse" />
                  <span>Start AI Verification</span>
                </button>
              </motion.div>

              {/* Regular Upload Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="card bg-white"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaCloudUploadAlt className="mr-2 text-primary-600" />
                  Manual Upload
                </h2>
                
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Name *
                    </label>
                    <input
                      value={meta.documentName}
                      onChange={e => setMeta({ ...meta, documentName: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Land Ownership Certificate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type *
                    </label>
                    <select
                      value={meta.documentType}
                      onChange={e => setMeta({ ...meta, documentType: e.target.value })}
                      className="input-field"
                    >
                      <option>Land Documents</option>
                      <option>Identity</option>
                      <option>Insurance</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    <FaCloudUploadAlt className={`text-5xl mx-auto mb-3 ${
                      dragActive ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <p className="text-sm text-gray-600 mb-2">
                      {files ? files[0]?.name : 'Drag & drop file here'}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">or</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn-outline cursor-pointer inline-block"
                    >
                      Browse Files
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary w-full py-3 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="spinner w-5 h-5" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt />
                        <span>Upload Document</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Verification Modal */}
      <DocumentVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onVerificationComplete={handleVerificationComplete}
      />

      <Footer />
    </div>
  );
}
