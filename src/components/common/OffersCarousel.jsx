import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Sparkles,
  Check,
  Copy,
  X,
  Gift,
  Calendar,
  Users,
  BookOpen,
  Info,
  Phone,
  ExternalLink
} from 'lucide-react';

export const DEFAULT_SPECIAL_OFFERS = [
  {
    title: 'Campus Student Scholar Pass',
    description: 'Special concession for currently enrolled college engineering students with verified college ID.',
    validity: 'Academic Year 2026',
    discount: '30% SCHOLARSHIP',
    discountText: '30% SCHOLARSHIP',
    type: 'Student',
    offerType: 'Course Discount',
    applicableStudentCategory: 'Student',
    couponCode: 'SCHOLAR30',
    termsAndConditions: 'Valid for currently enrolled college students with valid institutional student ID.',
    applyUrl: '/contact',
    badgeColor: 'amber'
  },
  {
    title: 'Early Bird Tech Enrollment',
    description: 'Flat 25% waiver on industry full stack and cloud certifications for new students this semester.',
    validity: 'Valid till month end',
    discount: 'FLAT 25% OFF',
    discountText: 'FLAT 25% OFF',
    type: 'Early Bird',
    offerType: 'Early Bird',
    applicableStudentCategory: 'New Students',
    couponCode: 'EARLYBIRD25',
    termsAndConditions: 'Applicable for the first 50 registrations across all tech certification domains.',
    applyUrl: '/contact',
    badgeColor: 'amber'
  },
  {
    title: 'Dual Internship Fast-Track',
    description: 'Enrol in any development internship track and get a complementary live industry capstone project.',
    validity: 'First 50 Applicants',
    discount: 'FREE CAPSTONE',
    discountText: 'FREE CAPSTONE',
    type: 'Internship',
    offerType: 'Bundle',
    applicableStudentCategory: 'All Students',
    couponCode: 'DUALTRACK',
    termsAndConditions: 'Includes mentorship access and verifiable live capstone certification.',
    applyUrl: '/contact',
    badgeColor: 'amber'
  },
  {
    title: 'Full Stack + Cloud DevOps Super Combo',
    description: 'Complete end-to-end development plus infrastructure mastering bundle with lifetime practice sandbox access.',
    validity: 'Limited Seats',
    discount: 'COMBO 35% OFF',
    discountText: 'COMBO 35% OFF',
    type: 'Combo',
    offerType: 'Bundle',
    applicableStudentCategory: 'All Students',
    couponCode: 'COMBO35',
    termsAndConditions: 'Combined pack including practical labs, live sessions, and continuous code reviews.',
    applyUrl: '/contact',
    badgeColor: 'amber'
  }
];

export default function OffersCarousel({ offers = [], compact = false }) {
  const navigate = useNavigate();
  const activeOffers = (offers && offers.length > 0) ? offers : DEFAULT_SPECIAL_OFFERS;
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [claimOfferModal, setClaimOfferModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const timerRef = useRef(null);

  // Keep active index within bounds if offers change
  useEffect(() => {
    if (active >= activeOffers.length) {
      setActive(0);
    }
  }, [activeOffers.length, active]);

  const goTo = useCallback((idx) => {
    if (animating || activeOffers.length <= 1) return;
    setAnimating(true);
    setActive(idx);
    setTimeout(() => setAnimating(false), 400);
  }, [animating, activeOffers.length]);

  const next = useCallback(() => {
    if (activeOffers.length <= 1) return;
    goTo((active + 1) % activeOffers.length);
  }, [active, activeOffers.length, goTo]);

  const prev = useCallback(() => {
    if (activeOffers.length <= 1) return;
    goTo((active - 1 + activeOffers.length) % activeOffers.length);
  }, [active, activeOffers.length, goTo]);

  useEffect(() => {
    if (!paused && activeOffers.length > 1) {
      timerRef.current = setInterval(next, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, next, activeOffers.length]);

  if (!activeOffers || activeOffers.length === 0) return null;

  const currentOffer = activeOffers[active] || activeOffers[0];

  // Map values flexibly whether coming from DB or defaults
  const discountLabel = currentOffer.discountText || currentOffer.discount || (
    currentOffer.discountValue
      ? (currentOffer.discountType === 'fixed' ? `₹${currentOffer.discountValue} OFF` : `${currentOffer.discountValue}% OFF`)
      : 'Special Offer'
  );

  const categoryLabel = currentOffer.applicableStudentCategory || currentOffer.type || currentOffer.offerType || 'Student';

  const validityLabel = currentOffer.formattedValidity || currentOffer.validity || (
    currentOffer.endDate
      ? new Date(currentOffer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : (currentOffer.validUntil ? new Date(currentOffer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Limited Period')
  );

  const handleCopyCoupon = (code, e) => {
    if (e) e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaimClick = (offer, e) => {
    if (e) e.stopPropagation();
    setClaimOfferModal(offer);
  };

  const handleApplyNow = (offer) => {
    setClaimOfferModal(null);
    if (offer.couponCode) {
      navigate(`/courses?coupon=${encodeURIComponent(offer.couponCode)}`);
    } else {
      navigate(offer.applyUrl || '/contact');
    }
  };

  return (
    <>
      <div
        className="relative w-full h-full select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Main Card — Styled to exactly match Screenshot 4 layout */}
        <div
          key={active}
          className={`rounded-3xl border border-amber-200/90 bg-white ${ compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8 md:p-9' } flex flex-col justify-between h-full shadow-xs relative overflow-hidden transition-all duration-300`}
        >
          {/* Top Row: Badges on left, Validity on right */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between gap-2.5 flex-wrap">
              {/* Left Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Discount Pill (Screenshot 4 gold badge) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-sq-gradient font-extrabold text-xs tracking-wide shadow-xs border border-[#9333EA]">
                  <Sparkles className="w-3.5 h-3.5 text-[#a825c5]" />
                  {discountLabel}
                </span>

                {/* 2. Target Category / Offer Type Pill */}
                {categoryLabel && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-[#92400E] font-bold text-xs">
                    {categoryLabel}
                  </span>
                )}

                {/* 3. Coupon Code Badge (if present) */}
                {currentOffer.couponCode && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyCoupon(currentOffer.couponCode, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-amber-400 bg-white hover:bg-white text-amber-900 font-mono font-bold text-xs transition cursor-pointer"
                    title="Click to copy coupon code"
                  >
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>{currentOffer.couponCode}</span>
                    {copiedCode ? (
                      <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
                    ) : (
                      <Copy className="w-3 h-3 text-amber-500 opacity-60 ml-0.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Right: Clock Icon & Validity Text */}
              {validityLabel && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{validityLabel}</span>
                </div>
              )}
            </div>

            {/* Offer Title */}
            <h3 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl lg:text-[26px]'} font-black text-slate-900 leading-tight tracking-tight mt-3`}>
              {currentOffer.title}
            </h3>

            {/* Offer Description */}
            {currentOffer.description && (
              <p className={`${compact ? 'text-xs line-clamp-2' : 'text-xs sm:text-sm max-w-xl'} text-slate-600 leading-relaxed mt-2.5 whitespace-pre-line`}>
                {currentOffer.description}
              </p>
            )}
          </div>

          {/* Bottom Bar: Claim Offer Button on Left, Limited Period on Right */}
          <div className="pt-4 flex items-center justify-between gap-3 relative z-10">
            <button
              type="button"
              onClick={(e) => handleClaimClick(currentOffer, e)}
              className="bg-white px-6 py-2.5 text-sq-gradient font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-2 cursor-pointer border border-[#9333EA]"
            >
              <span>Claim Offer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs text-[#DB2777] font-semibold inline-flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#DB2777]" />
              Limited Period Exclusive
            </span>
          </div>
        </div>

        {/* Carousel Navigation Arrows — Positioned inside card matching Screenshot 4 */}
        <button
          type="button"
          onClick={prev}
          disabled={activeOffers.length <= 1}
          className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition z-20 ${ activeOffers.length <= 1 ? 'opacity-70 cursor-default' : 'cursor-pointer hover:shadow-md' }`}
          aria-label="Previous offer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={activeOffers.length <= 1}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition z-20 ${ activeOffers.length <= 1 ? 'opacity-70 cursor-default' : 'cursor-pointer hover:shadow-md' }`}
          aria-label="Next offer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Pagination Dots — Matches Screenshot 4 pink indicator */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {activeOffers.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`rounded-full transition-all duration-300 ${ idx === active ? 'bg-white w-5 h-1.5' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400' }`}
              aria-label={`Offer ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CLAIM OFFER MODAL — Rich Interactive Details & Claim Flow
         ══════════════════════════════════════════════════════════════ */}
      {claimOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 relative animate-scale-up">
            {/* Modal Header */}
            <div className="bg-white p-6 relative border-b border-purple-200">
              <button
                type="button"
                onClick={() => setClaimOfferModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#9333EA] hover:border-[#9333EA] transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white border border-purple-200 px-2.5 py-0.5 rounded-full text-[#9333EA]">
                  <Gift className="w-3.5 h-3.5 text-[#9333EA]" />
                  Special Promotional Offer
                </span>
              </div>

              <h3 className="text-2xl font-black tracking-tight leading-snug text-sq-gradient">
                {claimOfferModal.title}
              </h3>

              <div className="mt-3 inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-base font-black text-amber-700">
                  {claimOfferModal.discountText || claimOfferModal.discount || 'Special Discount'}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Validity Period</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {claimOfferModal.formattedValidity || claimOfferModal.validity || 'Limited Period'}
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Users className="w-3.5 h-3.5 text-pink-600" />
                    <span>Eligible Audience</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {claimOfferModal.applicableStudentCategory || claimOfferModal.type || 'All Students'}
                  </p>
                </div>
              </div>

              {/* Coupon Code Box */}
              {claimOfferModal.couponCode && (
                <div className="p-4 bg-white border border-purple-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-600" />
                      Promo Coupon Code
                    </span>
                    <span className="text-[11px] text-purple-600 font-medium">Click copy to use</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                    <span className="text-lg font-mono font-black text-purple-900 tracking-wider">
                      {claimOfferModal.couponCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon(claimOfferModal.couponCode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${ copiedCode ? 'bg-white text-emerald-700 border border-emerald-600' : 'bg-white text-sq-gradient border border-[#9333EA]' }`}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              {claimOfferModal.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Offer Details & Highlights
                  </h4>
                  <div className="p-3.5 bg-white border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {claimOfferModal.description}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {claimOfferModal.termsAndConditions && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Terms & Conditions
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed bg-white border border-amber-200/60 p-3 rounded-xl">
                    {claimOfferModal.termsAndConditions}
                  </p>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleApplyNow(claimOfferModal)}
                  className="bg-white w-full sm:flex-1 py-3 px-4 hover:opacity-95 text-sq-gradient font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-[#9333EA]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Apply Offer to Courses</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setClaimOfferModal(null);
                    navigate('/contact');
                  }}
                  className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-white text-slate-700 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>Contact Team</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
