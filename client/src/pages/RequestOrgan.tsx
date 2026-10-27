import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';

export default function RequestOrgan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: '',
    organType: 'KIDNEY',
    urgencyLevel: '5',
    medicalPriority: '5',
    medicalInformation: ''
  });

  useEffect(() => {
    api.get('/organs/hospitals').then(res => setHospitals(res.data.data)).catch(console.error);
  }, []);

  if (user?.role !== 'RECIPIENT') return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.hospitalId) {
        alert("Please select a hospital");
        setLoading(false);
        return;
      }

      await api.post('/requests', formData);
      alert('Request submitted successfully! The doctors will review your case.');
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Request an Organ</h2>
          <Link to="/" className="text-blue-600 hover:underline">Cancel</Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">Submit a formal transplant request to a hospital. This request will be reviewed by doctors before you are placed in the matching pool.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Hospital</label>
              <select required className="w-full border rounded px-3 py-2" value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
                <option value="">-- Choose Hospital --</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} - {h.city}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organ Needed</label>
              <select required className="w-full border rounded px-3 py-2" value={formData.organType} onChange={e => setFormData({...formData, organType: e.target.value})}>
                <option value="KIDNEY">Kidney</option>
                <option value="LIVER">Liver</option>
                <option value="HEART">Heart</option>
                <option value="LUNG">Lung</option>
                <option value="PANCREAS">Pancreas</option>
                <option value="INTESTINE">Intestine</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level (1-10)</label>
                <input required type="number" min="1" max="10" className="w-full border rounded px-3 py-2" value={formData.urgencyLevel} onChange={e => setFormData({...formData, urgencyLevel: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Priority (1-10)</label>
                <input required type="number" min="1" max="10" className="w-full border rounded px-3 py-2" value={formData.medicalPriority} onChange={e => setFormData({...formData, medicalPriority: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Information / Notes</label>
              <textarea required rows={4} className="w-full border rounded px-3 py-2" value={formData.medicalInformation} onChange={e => setFormData({...formData, medicalInformation: e.target.value})} placeholder="Describe your current medical condition..."></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Request to Doctors'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
