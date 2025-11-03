import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaRobot, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaExclamationTriangle, FaFileAlt, FaMapMarkedAlt, FaUser
} from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function DocumentVerificationModal({ isOpen, onClose, onVerificationComplete }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Results
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: '',
    surveyNumber: '',
    area: '',
    village: '',
    district: '',
    documentType: 'Land Documents'
  });
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [processingStage, setProcessingStage] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a document to verify');
      return;
    }

    if (!formData.ownerName || !formData.surveyNumber || !formData.area) {
      toast.error('Please fill all required fields');
      return;
    }

    setVerifying(true);
    setStep(2);

    // Simulate processing stages
    const stages = [
      'Uploading document...',
      'Extracting text using OCR...',
      'Processing document data...',
      'Validating with AI...',
      'Comparing extracted data...',
      'Checking for duplicates...',
      'Generating verification report...'
    ];

    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        setProcessingStage(stages[stageIndex]);
        stageIndex++;
      }
    }, 1000);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('surveyNumber', formData.surveyNumber);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('village', formData.village);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('documentType', formData.documentType);

      const res = await api.post('/documents/verify', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(stageInterval);

      if (res.data?.success) {
        setVerificationResult(res.data);
        setStep(3);
        
        if (res.data.status === 'verified') {
          toast.success('Document verified successfully!');
        } else if (res.data.status === 'review') {
          toast('Document needs review', { icon: '⚠️' });
        } else {
          toast.error('Document verification failed');
        }
      }

    } catch (err) {
      clearInterval(stageInterval);
      console.error('Verification error:', err);
      toast.error(err.response?.data?.message || 'Verification failed');
      setStep(1);
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setFormData({
      ownerName: '',
      surveyNumber: '',
      area: '',
      village: '',
      district: '',
      documentType: 'Land Documents'
    });
    setVerificationResult(null);
    setProcessingStage('');
    onClose();
  };

  const handleComplete = () => {
    if (onVerificationComplete && verificationResult) {
      onVerificationComplete(verificationResult);
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <FaRobot className="mr-3" />
                OCR + AI Document Verification
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Automated verification with 85%+ accuracy
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Upload & Form */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaFileAlt className="inline mr-2 text-blue-600" />
                    Upload Land Document (7/12, Survey Doc, Land Records) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      {file ? (
                        <div className="text-green-600">
                          <FaCheckCircle className="text-4xl mx-auto mb-2" />
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <FaFileAlt className="text-4xl mx-auto mb-2" />
                          <p className="font-medium">Click to upload or drag and drop</p>
                          <p className="text-sm">JPG, PNG or PDF (max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2 text-blue-600" />
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Enter full name as per document"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Survey Number / Gat Number *
                    </label>
                    <input
                      type="text"
                      value={formData.surveyNumber}
                      onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
                      placeholder="e.g., 123/1A"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Area (in hectares) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g., 2.5"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkedAlt className="inline mr-2 text-blue-600" />
                      Village
                    </label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="Enter village name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Enter district name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                  <div className="flex items-start">
                    <FaRobot className="text-blue-600 text-xl mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">How It Works</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• AI extracts text from your document using OCR</li>
                        <li>• Compares extracted data with your input</li>
                        <li>• Auto-approves if match score &gt; 85%</li>
                        <li>• No manual verification needed!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={verifying}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FaRobot />
                    <span>Start AI Verification</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Processing */}
            {step === 2 && (
              <div className="py-12">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <FaRobot className="text-6xl text-blue-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    AI is Verifying Your Document...
                  </h3>
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                      <motion.div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 7, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="text-gray-600 mb-8">
                      <FaSpinner className="inline animate-spin mr-2" />
                      {processingStage || 'Processing...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && verificationResult && (
              <div className="space-y-6">
                {/* Status Header */}
                <div className={`text-center py-6 rounded-xl border-2 ${
                  verificationResult.status === 'verified'
                    ? 'bg-green-50 border-green-200'
                    : verificationResult.status === 'review'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  {verificationResult.status === 'verified' ? (
                    <>
                      <FaCheckCircle className="text-5xl text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-900 mb-2">
                        Document Verified! ✅
                      </h3>
                    </>
                  ) : verificationResult.status === 'review' ? (
                    <>
                      <FaExclamationTriangle className="text-5xl text-yellow-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-yellow-900 mb-2">
                        Needs Review ⚠️
                      </h3>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-red-900 mb-2">
                        Verification Failed ❌
                      </h3>
                    </>
                  )}
                  <p className="text-gray-700">{verificationResult.message}</p>
                </div>

                {/* Match Score */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-4 text-center">Match Score</h4>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          AI Confidence
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          {verificationResult.matchScore}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${verificationResult.matchScore}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          verificationResult.matchScore >= 85
                            ? 'bg-green-500'
                            : verificationResult.matchScore >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Extracted Fields */}
                {verificationResult.extractedFields && Object.keys(verificationResult.extractedFields).length > 0 && (
                  <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4">Extracted from Document (OCR)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(verificationResult.extractedFields).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded-lg">
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                          <div className="font-semibold text-gray-800">{value || 'N/A'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Field Comparison */}
                {verificationResult.comparison && (
                  <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4">Field-by-Field Analysis</h4>
                    <div className="space-y-3">
                      {Object.entries(verificationResult.comparison).map(([field, data]) => {
                        if (field === 'overall') return null;
                        return (
                          <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold text-gray-800 capitalize">{field}</div>
                              <div className="text-sm text-gray-600">{data.reason}</div>
                            </div>
                            <div className={`text-xl font-bold ${
                              data.match >= 85 ? 'text-green-600' : data.match >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {data.match}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  {verificationResult.status === 'verified' ? (
                    <button
                      onClick={handleComplete}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                    >
                      Continue with Verified Document
                    </button>
                  ) : verificationResult.status === 'review' ? (
                    <>
                      <button
                        onClick={handleComplete}
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                      >
                        Submit for Manual Review
                      </button>
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                      >
                        Try Again
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
                    >
                      Upload Different Document
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
