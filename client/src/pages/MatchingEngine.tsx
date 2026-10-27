import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Match {
  id: string;
  compatibilityScore: number;
  bloodGroupScore: number;
  urgencyScore: number;
  medicalPriorityScore: number;
  status: string;
  organ: { organType: string; bloodGroup: string };
  recipient: { user: { fullName: string } };
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

  useEffect(() => {
    fetchMatches();
    fetchAvailableOrgans();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches');
      setMatches(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAvailableOrgans = async () => {
    try {
      const res = await api.get('/organs');
      const available = res.data.data.filter((o: any) => o.availabilityStatus === 'AVAILABLE');
      setOrgans(available);
    } catch (error) {
      console.error(error);
    }
  };

  const runEngine = async () => {
    if (!selectedOrgan) return alert('Select an organ first');
    setLoading(true);
    try {
      const res = await api.post('/matches/run', { organId: selectedOrgan });
      alert(res.data.message);
      fetchMatches();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error running matching engine');
    } finally {
      setLoading(false);
    }
  };

  const allocateMatch = async (matchId: string) => {
    if (!window.confirm("Are you sure you want to authorize this allocation? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await api.post(`/matches/${matchId}/allocate`);
      alert(res.data.message);
      fetchMatches();
      fetchAvailableOrgans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error allocating organ');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (statusFilter === 'ALL') return true;
    return match.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Matching Engine</h2>
          <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Run Allocation Algorithm</h3>
          <div className="flex gap-4">
            <select 
              className="border border-gray-300 rounded px-4 py-2 flex-grow"
              value={selectedOrgan}
              onChange={(e) => setSelectedOrgan(e.target.value)}
            >
              <option value="">-- Select Available Organ to Match --</option>
              {organs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.organType} (Blood: {o.bloodGroup}) - {o.hospital?.name || 'Local Hospital'}
                </option>
              ))}
            </select>
            <button 
              onClick={runEngine}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Engine'}
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
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  statusFilter === tab 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMatches.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No matches found for this filter.</td></tr>
              ) : (
                filteredMatches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{match.organ.organType} (Blood: {match.organ.bloodGroup})</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{match.recipient.user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600 mr-2">{match.compatibilityScore}</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(match.compatibilityScore, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${match.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : match.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {match.status === 'PENDING' ? (
                        <button 
                          onClick={() => allocateMatch(match.id)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded disabled:opacity-50"
                        >
                          Review & Allocate
                        </button>
                      ) : (
                        <span className="text-gray-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
