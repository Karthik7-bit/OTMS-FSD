import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';

export default function DonateOrgan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: '',
    organType: 'KIDNEY',
    bloodGroup: 'O_POS',
    location: '',
  });

  useEffect(() => {
    api.get('/organs/hospitals').then(res => setHospitals(res.data.data)).catch(console.error);
  }, []);

  if (user?.role !== 'DONOR') return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hospital = hospitals.find(h => String(h.id) === String(formData.hospitalId));
      if (!hospital) {
        alert("Please select a hospital");
        setLoading(false);
        return;
      }

      await api.post('/organs', {
        ...formData,
        location: hospital.name,
        expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // dummy expiry
      });
      alert('Pledge successful! The organ has been added to the inventory.');
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error pledging organ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Donate an Organ</h2>
          <Link to="/" className="text-blue-600 hover:underline">Cancel</Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">Thank you for your generous pledge. Please specify the details below to add your organ directly to the inventory.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
              <select required className="w-full border rounded px-3 py-2" value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
                <option value="">-- Choose Hospital --</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} - {h.city}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organ to Donate</label>
              <select required className="w-full border rounded px-3 py-2" value={formData.organType} onChange={e => setFormData({...formData, organType: e.target.value})}>
                <option value="KIDNEY">Kidney</option>
                <option value="LIVER">Liver</option>
                <option value="HEART">Heart</option>
                <option value="LUNG">Lung</option>
                <option value="PANCREAS">Pancreas</option>
                <option value="INTESTINE">Intestine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Blood Group</label>
              <select required className="w-full border rounded px-3 py-2" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                <option value="O_POS">O+</option>
                <option value="O_NEG">O-</option>
                <option value="A_POS">A+</option>
                <option value="A_NEG">A-</option>
                <option value="B_POS">B+</option>
                <option value="B_NEG">B-</option>
                <option value="AB_POS">AB+</option>
                <option value="AB_NEG">AB-</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-6 disabled:opacity-50">
              {loading ? 'Pledging...' : 'Confirm Organ Donation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
