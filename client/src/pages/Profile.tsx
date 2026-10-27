import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // In a real app, you would have a specific endpoint to fetch the detailed profile 
      // based on whether they are a DONOR or RECIPIENT.
      const res = await api.get('/auth/me');
      setProfileData(res.data.data.user);
    } catch (error) {
      console.error(error);
    }
  };

  if (!profileData) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{profileData.fullName}</h3>
            <p className="text-gray-500 uppercase font-medium tracking-wide text-sm">{profileData.role}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profileData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profileData.phone || 'Not provided'}</p>
            </div>
            
            {/* If the user is a normal person (donor/recipient), show a placeholder for medical info */}
            {(profileData.role === 'DONOR' || profileData.role === 'RECIPIENT') && (
              <div className="col-span-2 mt-4 p-4 bg-blue-50 rounded border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Medical Status</h4>
                <p className="text-sm text-blue-600">
                  Your detailed medical and compatibility records are securely stored and managed by your registered hospital.
                  Please contact your designated Doctor to update your clinical parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
