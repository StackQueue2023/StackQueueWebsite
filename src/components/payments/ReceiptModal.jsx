import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden print:m-0 print:border-none print:shadow-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-purple-100 flex items-center justify-between print:hidden">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">
            Official E-Receipt • {receipt.receiptNumber}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-8 space-y-6 print:p-4 text-slate-800">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-purple-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white flex items-center justify-center font-black text-sm">
                  SQ
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  STACK QUEUE LMS
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Education & Technology Innovation Academy • Accounts & Finance
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                VERIFIED PAYMENT
              </span>
              <div className="text-xs font-mono font-bold text-purple-900 mt-1">
                Receipt #{receipt.receiptNumber}
              </div>
              <div className="text-[11px] text-slate-400">
                Date: {new Date(receipt.paymentDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Student & Program Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">Received From</span>
              <div className="font-bold text-sm text-slate-900">{receipt.studentName}</div>
              <div className="font-mono text-slate-600">ID: {receipt.studentCode}</div>
              {receipt.studentEmail && <div className="text-slate-500">{receipt.studentEmail}</div>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">Academic Enrollment</span>
              <div className="font-bold text-sm text-slate-900">{receipt.programName}</div>
              <div className="text-slate-600 font-medium">Category: {receipt.category}</div>
              <div className="font-mono text-slate-500">Ref: {receipt.paymentReference}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-purple-100 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/70 border-b border-purple-100 text-purple-900 font-mono uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Payment Method</th>
                  <th className="py-2.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                <tr>
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 font-bold block">{receipt.programName} – Monthly Installment</strong>
                    <span className="text-[11px] text-slate-500">Allocated to course principal fee balance</span>
                  </td>
                  <td className="py-3 px-4 font-mono">{receipt.paymentMethod || 'UPI'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{Number(receipt.principalAmount || receipt.amountReceived).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-purple-50/40 border-t border-purple-100 font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right uppercase font-mono text-[11px] text-slate-700">
                    Total Amount Received:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-purple-900 font-black">
                    ₹{Number(receipt.amountReceived).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Balance Statement */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Previous Balance</span>
              <strong className="text-slate-700">₹{(receipt.previousBalance || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Remaining Principal</span>
              <strong className="text-purple-700">₹{(receipt.remainingPrincipal || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Next Due Date</span>
              <span className="text-slate-700 font-semibold">
                {receipt.nextDueDate ? new Date(receipt.nextDueDate).toLocaleDateString() : 'Paid in Full'}
              </span>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              Generated electronically by {receipt.issuedBy || 'STACK QUEUE LMS Accounts Division'}.
            </div>
            <div className="flex items-center gap-1.5 text-purple-600 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tamper-evident record authenticated in LMS database.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
