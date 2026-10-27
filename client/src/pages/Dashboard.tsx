import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">OTMS Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">{user?.fullName} ({user?.role})</span>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Organ Transplant Management System</h2>
          <p className="text-gray-600">
            The system serves as a centralized clinical decision support platform for organ procurement and allocation.
            All allocation actions must be authorized by designated transplant medical officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/profile" className="block bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">My Profile</h3>
            <p className="text-gray-600 text-sm">Manage your personal and medical information.</p>
          </Link>

          {user?.role === 'DONOR' && (
            <Link to="/donate" className="block bg-green-50 p-6 rounded-lg shadow-sm border-t-4 border-green-500 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Pledge an Organ</h3>
              <p className="text-green-700 text-sm">Fill out the official form to donate an organ to the registry.</p>
            </Link>
          )}

          {user?.role === 'RECIPIENT' && (
            <Link to="/request" className="block bg-blue-50 p-6 rounded-lg shadow-sm border-t-4 border-blue-500 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Request Transplant</h3>
              <p className="text-blue-700 text-sm">Submit an organ transplant request for doctors to review.</p>
            </Link>
          )}
          
          {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
            <Link to="/organs" className="block bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Organ Inventory</h3>
              <p className="text-gray-600 text-sm">View available and allocated organs.</p>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="block bg-purple-50 p-6 rounded-lg shadow-sm border-t-4 border-indigo-500 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Admin Portal</h3>
              <p className="text-indigo-700 text-sm">System administration and user directory management.</p>
            </Link>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
            <>
              <Link to="/requests" className="block bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Transplant Requests</h3>
                <p className="text-gray-600 text-sm">Monitor and manage transplant matching workflows.</p>
              </Link>

              <Link to="/matching" className="block bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-500 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Matching Engine</h3>
                <p className="text-gray-600 text-sm">Run algorithm to calculate compatibility scores for organs.</p>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
