import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Gift,
  Clock,
  Sparkles,
  Layers,
  BookOpen,
  Info
} from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedback, setFeedback] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetOffer, setDeleteTargetOffer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offerType: 'Course Discount',
    discountType: 'percentage',
    discountValue: '',
    applicableCourses: [],
    applicableStudentCategory: 'All Students',
    startDate: '',
    endDate: '',
    couponCode: '',
    termsAndConditions: '',
    bannerUrl: '',
    isActive: true,
    isDraft: false
  });

  const offerTypes = [
    'Course Discount',
    'Early Bird',
    'Seasonal',
    'Bundle',
    'Special',
    'Festival',
    'Student Referral'
  ];

  const studentCategories = [
    'All Students',
    'New Students',
    'Existing Students',
    'College Training',
    'LMS Students'
  ];

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/offers');
      if (res.data.success) {
        setOffers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch offers.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/lms/courses');
      if (res.data.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      try {
        const fallback = await api.get('/admin/domain-management/courses');
        if (fallback.data.success) setCourses(fallback.data.data || []);
      } catch (e) {
        console.error('Failed to load courses:', e);
      }
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormData({
      title: '',
      description: '',
      offerType: 'Course Discount',
      discountType: 'percentage',
      discountValue: '',
      applicableCourses: [],
      applicableStudentCategory: 'All Students',
      startDate: today,
      endDate: thirtyDaysLater,
      couponCode: '',
      termsAndConditions: '',
      bannerUrl: '',
      isActive: true,
      isDraft: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    const sDate = offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '';
    const eDate = offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '';

    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      offerType: offer.offerType || 'Course Discount',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue !== undefined ? offer.discountValue : '',
      applicableCourses: offer.applicableCourses || [],
      applicableStudentCategory: offer.applicableStudentCategory || 'All Students',
      startDate: sDate,
      endDate: eDate,
      couponCode: offer.couponCode || '',
      termsAndConditions: offer.termsAndConditions || '',
      bannerUrl: offer.bannerUrl || '',
      isActive: offer.isActive !== undefined ? offer.isActive : true,
      isDraft: offer.isDraft || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingOffer) {
        const res = await api.put(`/admin/offers/${editingOffer._id || editingOffer.id}`, formData);
        if (res.data.success) {
          setFeedback({ type: 'success', message: res.data.message || 'Offer updated successfully!' });
          setIsModalOpen(false);
          fetchOffers();
        }
      } else {
        const res = await api.post('/admin/offers', formData);
        if (res.data.success) {
          setFeedback({ type: 'success', message: res.data.message || 'Offer created successfully!' });
          setIsModalOpen(false);
          fetchOffers();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error saving offer. Please check input values.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (offerId) => {
    try {
      const res = await api.patch(`/admin/offers/${offerId}/toggle-status`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Offer status toggled.'
        });
        fetchOffers();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle status.'
      });
    }
  };

  const handleDeleteOffer = async () => {
    if (!deleteTargetOffer) return;
    setDeleting(true);
    const id = deleteTargetOffer._id || deleteTargetOffer.id;
    try {
      const res = await api.delete(`/admin/offers/${id}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Offer deleted successfully.'
        });
        setDeleteTargetOffer(null);
        fetchOffers();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete offer.'
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search logic
  const filteredOffers = offers.filter(o => {
    const matchesSearch =
      !searchQuery.trim() ||
      o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.couponCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.offerType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Active</span></span>;
      case 'Scheduled':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Scheduled</span></span>;
      case 'Expired':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>Expired</span></span>;
      case 'Inactive':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">Inactive</span>;
      case 'Draft':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Draft</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-purple-600" />
            <span>Promotions & Rewards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Special Offers & Coupon Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Create and manage promotional discounts, seasonal sales, referral coupons, and course offers across regular LMS and college training programs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="relative z-10 px-6 py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center space-x-2 text-xs sm:text-sm shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offers by title, coupon code, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center space-x-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {['All', 'Active', 'Scheduled', 'Expired', 'Inactive', 'Draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-bold text-slate-600">Loading promotional offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
            <Tag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No Offers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'No promotional offers match your current filter criteria. Try resetting the search or filter.'
              : 'There are no promotional offers in the system. Click "Create New Offer" to launch a campaign.'}
          </p>
          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const isPercentage = offer.discountType === 'percentage';
            const discountLabel = isPercentage
              ? `${offer.discountValue}% OFF`
              : `₹${Number(offer.discountValue).toLocaleString()} OFF`;

            return (
              <div
                key={offer._id || offer.id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  !offer.isActive ? 'border-slate-200 opacity-75' : 'border-purple-200 shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header Banner / Tag */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-b border-purple-100 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                        {offer.offerType || 'Course Discount'}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5 leading-snug line-clamp-1">
                        {offer.title}
                      </h3>
                    </div>
                    <div>{getStatusBadge(offer.status)}</div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Big Discount Value Display */}
                    <div className="flex items-baseline space-x-2 bg-purple-500/5 p-3 rounded-xl border border-purple-100">
                      <span className="text-2xl font-black text-purple-700 tracking-tight">
                        {discountLabel}
                      </span>
                      {offer.couponCode && (
                        <span className="text-xs font-mono font-bold bg-purple-700 text-white px-2 py-0.5 rounded uppercase tracking-widest ml-auto">
                          {offer.couponCode}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {offer.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    )}

                    {/* Meta Details */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Validity:</span>
                        </span>
                        <span className="font-semibold text-slate-700">
                          {new Date(offer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>Category:</span>
                        </span>
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                          {offer.applicableStudentCategory || 'All Students'}
                        </span>
                      </div>

                      {offer.applicableCourses && offer.applicableCourses.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>Courses:</span>
                          </span>
                          <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                            {offer.applicableCourses.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(offer._id || offer.id)}
                    className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition ${
                      offer.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                    }`}
                    title={offer.isActive ? 'Deactivate Offer' : 'Activate Offer'}
                  >
                    {offer.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                    <span>{offer.isActive ? 'Active' : 'Disabled'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(offer)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-300 rounded-lg transition"
                      title="Edit Offer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetOffer(offer)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 rounded-lg transition"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {editingOffer ? 'Edit Promotional Offer' : 'Create New Promotional Offer'}
                </h3>
                <p className="text-purple-100 text-xs mt-0.5">
                  Set discount parameters, coupon codes, validity dates, and target audiences.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Offer Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Diwali Tech Learning Super Fest - 30% OFF"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Offer Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Type
                  </label>
                  <select
                    value={formData.offerType}
                    onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {offerTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., FESTIVE30"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Discount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 25 (for 25%)' : 'e.g., 5000 (for ₹5,000)'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Target Audience */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Student Category
                  </label>
                  <select
                    value={formData.applicableStudentCategory}
                    onChange={(e) => setFormData({ ...formData, applicableStudentCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {studentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description & Highlights
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief details about the promotional offer..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Terms, eligibility criteria, or redemption rules..."
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Status Toggles */}
                <div className="md:col-span-2 flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Is Active</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDraft}
                      onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Save as Draft</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Publish Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL OVERLAY */}
      {deleteTargetOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Delete Offer?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{deleteTargetOffer.title}"</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeleteTargetOffer(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteOffer}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
