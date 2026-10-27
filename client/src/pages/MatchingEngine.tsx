import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

interface Match {
  id: string;
  compatibilityScore: number;
  bloodGroupScore: number;
  urgencyScore: number;
  medicalPriorityScore: number;
  status: string;
  organ: { organType: string; bloodGroup: string; hospital?: { name: string } };
  recipient: { bloodGroup?: string; urgencyLevel?: number; user: { fullName: string } };
}

interface Organ {
  id: string;
  organType: string;
  bloodGroup: string;
  hospital?: { name: string };
}

export default function MatchingEngine() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  
  // Interactive Modal & Alert States
  const [reviewModalMatch, setReviewModalMatch] = useState<Match | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchMatches();
    fetchAvailableOrgans();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches');
      setMatches(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAvailableOrgans = async () => {
    try {
      const res = await api.get('/organs');
      const available = (res.data.data || []).filter((o: any) => o.availabilityStatus === 'AVAILABLE');
      setOrgans(available);
    } catch (error) {
      console.error(error);
    }
  };

  const runEngine = async () => {
    if (!selectedOrgan) {
      setFeedback({ type: 'error', message: 'Please select an available organ from the dropdown first.' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post('/matches/run', { organId: selectedOrgan });
      setFeedback({ type: 'success', message: res.data.message || 'Matching algorithm completed successfully.' });
      await fetchMatches();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Error executing matching engine.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (match: Match) => {
    setReviewModalMatch(match);
    setFeedback(null);
  };

  const handleConfirmAllocation = async () => {
    if (!reviewModalMatch) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/matches/${reviewModalMatch.id}/allocate`);
      setFeedback({
        type: 'success',
        message: res.data.message || `Organ successfully allocated to ${reviewModalMatch.recipient.user.fullName}.`
      });
      setReviewModalMatch(null);
      await fetchMatches();
      await fetchAvailableOrgans();
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to allocate organ. Please verify permissions.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (statusFilter === 'ALL') return true;
    return match.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Matching Engine & Allocation Console</h2>
            <p className="text-sm text-slate-500 mt-0.5">Automated clinical scoring, donor-recipient compatibility & organ allocation</p>
          </div>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-sm ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{feedback.type === 'success' ? '✓' : '⚠️'}</span>
              <span className="text-sm font-medium">{feedback.message}</span>
            </div>
            <button 
              onClick={() => setFeedback(null)} 
              className="text-xs px-2 py-1 rounded hover:bg-black/5 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Run Allocation Algorithm Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Run Allocation Algorithm</h3>
              <p className="text-xs text-slate-500">Select an available donor organ to rank all waitlisted candidates via multi-factor compatibility matrix</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {organs.length} Organs Available
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              className="border border-slate-300 rounded-xl px-4 py-2.5 flex-grow text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={selectedOrgan}
              onChange={(e) => setSelectedOrgan(e.target.value)}
            >
              <option value="">-- Select Available Organ to Match --</option>
              {organs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.organType} (Blood: {o.bloodGroup}) &bull; {o.hospital?.name || o.location || 'Donor Hospital'}
                </option>
              ))}
            </select>
            <button 
              onClick={runEngine}
              disabled={loading || organs.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing Algorithm...
                </>
              ) : (
                'Run Matching Engine'
              )}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-4">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map(tab => {
            const count = tab === 'ALL' ? matches.length : matches.filter(m => m.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  statusFilter === tab 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Matches Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Organ</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Recipient</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Compatibility Score</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No matching records found for this filter. Run the engine with an available organ above to generate candidates.
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>{match.organ.organType}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700">
                          {match.organ.bloodGroup}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                      {match.recipient?.user?.fullName || 'Registered Patient'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-emerald-600 min-w-[36px]">
                          {match.compatibilityScore}
                        </span>
                        <div className="w-28 bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(match.compatibilityScore, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                        match.status === 'ACCEPTED' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : match.status === 'REJECTED' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {match.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleOpenReview(match)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
                        >
                          Review & Allocate
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Review & Allocate Dialog */}
        {reviewModalMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Authorize Organ Allocation</h3>
                  <p className="text-xs text-slate-500">Review candidate matching parameters before final clinical lock</p>
                </div>
                <button 
                  onClick={() => setReviewModalMatch(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  &times;
                </button>
              </div>

              {/* Match Highlights */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-400 block">Candidate Recipient</span>
                    <span className="text-base font-bold text-slate-900">{reviewModalMatch.recipient?.user?.fullName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold uppercase text-slate-400 block">Compatibility Score</span>
                    <span className="text-xl font-extrabold text-emerald-600">{reviewModalMatch.compatibilityScore} / 100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200/70 bg-white">
                    <span className="text-slate-400 uppercase font-semibold block">Organ Requested</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{reviewModalMatch.organ.organType}</span>
                    <span className="text-slate-500">Donor Blood: <strong className="font-mono text-slate-700">{reviewModalMatch.organ.bloodGroup}</strong></span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/70 bg-white">
                    <span className="text-slate-400 uppercase font-semibold block">Donor Hospital</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
                      {reviewModalMatch.organ.hospital?.name || 'Authorized Donor Center'}
                    </span>
                    <span className="text-slate-500">Status: <strong className="text-blue-600">Verified Available</strong></span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <span className="font-semibold block mb-1 text-blue-950">Algorithmic Scoring Breakdown:</span>
                  <div className="flex justify-between">
                    <span>Blood Group Compatibility:</span>
                    <span className="font-bold">{reviewModalMatch.bloodGroupScore} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Urgency Weight:</span>
                    <span className="font-bold">{reviewModalMatch.urgencyScore} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clinical Priority Level:</span>
                    <span className="font-bold">{reviewModalMatch.medicalPriorityScore} pts</span>
                  </div>
                </div>

                {/* Irreversible Action Warning */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <span className="text-sm">⚠️</span>
                  <span>
                    Confirming this allocation permanently assigns this organ to the patient, updates waitlist status to <strong>MATCHED</strong>, and rejects other candidate pairs for this organ.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalMatch(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAllocation}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? 'Allocating...' : 'Confirm & Authorize Allocation'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
