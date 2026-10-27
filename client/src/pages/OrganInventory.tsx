import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Organ {
  id: string | number;
  organType: string;
  bloodGroup: string;
  location: string;
  availabilityStatus: string;
  expiryDate: string;
  hospital: { name: string };
  donor: { user: { fullName: string } };
}

export default function OrganInventory() {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrgans();
  }, []);

  const fetchOrgans = async () => {
    try {
      const res = await api.get('/organs');
      setOrgans(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getOrganStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ALLOCATED': return 'bg-purple-100 text-purple-800';
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800';
      case 'TRANSPLANTED': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Organ Inventory</h2>
          <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No organs available.</td></tr>
              ) : (
                organs.map((organ) => (
                  <tr key={organ.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{organ.organType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{organ.bloodGroup}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{organ.hospital?.name || organ.location || 'Local Hospital'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrganStatusColor(organ.availabilityStatus)}`}>
                        {organ.availabilityStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(organ.expiryDate).toLocaleDateString()}
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
