'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function Table() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      console.log('Fetched users:', response.data); // Debug log
      setData(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (userId) => {
    try {
      setLoading(true);
      await axios.delete('/api/users', { data: { id: userId } });
      await fetchUsers(); // Refresh the list
      setError('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (user) => {
    console.log('Editing user:', user); // Debug log
    setEditingId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role // Make sure to set the current role
    });
  };

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError("");

      console.log('Updating user with data:', { ...formData, id: editingId }); // Debug log

      const response = await axios.put('/api/users', {
        id: editingId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role, // Make sure role is included
        ...(formData.password && { password: formData.password })
      });

      console.log('Update response:', response.data); // Debug log

      // Update local data
      setData(prevData => 
        prevData.map(user => 
          user._id === editingId ? { ...user, ...response.data.user } : user
        )
      );

      // Reset form
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student'
      });

      setError("User updated successfully!");
      setTimeout(() => setError(""), 3000);

    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.error || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!editingId && !formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (!formData.role) {
      setError("Role is required");
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    // Password length validation (only for new users or if password is provided)
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  // Handle form submission for adding new user
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError("");

      // Validate role
      if (!formData.role || !['student', 'teacher'].includes(formData.role)) {
        setError("Please select a valid role");
        return;
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      };

      console.log('Submitting user data:', { ...userData, password: '[HIDDEN]' }); // Debug log

      const response = await axios.post('/api/users', userData);
      console.log('Server response:', response.data); // Debug log

      // Refresh the user list immediately after creating new user
      await fetchUsers();

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ''
      });

      setError("User created successfully!");
      setTimeout(() => setError(""), 3000);

    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on selected role
  const filteredUsers = data.filter(user => 
    selectedRole === 'all' ? true : user.role === selectedRole
  );

  // Calculate role statistics from the data
  const roleStats = data.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = 0;
    acc[user.role]++;
    return acc;
  }, { student: 0, teacher: 0 });

  // Handle navigation
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'settings') {
      router.push('/settings');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>
          
          {/* Role Statistics */}
          <div className="mb-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-600 uppercase">Users Overview</h2>
            
            {/* All Users Card */}
            <div 
              onClick={() => setSelectedRole('all')}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'all' 
                  ? 'bg-blue-50 border border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {data.length}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {roleStats.student} students, {roleStats.teacher} teachers
              </div>
            </div>

            {/* Students Card */}
            <div 
              onClick={() => setSelectedRole('student')}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'student' 
                  ? 'bg-green-50 border border-green-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-medium">Students</span>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {roleStats.student}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {selectedRole === 'student' 
                  ? `Showing ${filteredUsers.length} of ${roleStats.student}` 
                  : `${roleStats.student} registered students`}
              </div>
            </div>

            {/* Teachers Card */}
            <div 
              onClick={() => setSelectedRole('teacher')}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'teacher' 
                  ? 'bg-purple-50 border border-purple-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-medium">Teachers</span>
                </div>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {roleStats.teacher}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {selectedRole === 'teacher' 
                  ? `Showing ${filteredUsers.length} of ${roleStats.teacher}` 
                  : `${roleStats.teacher} registered teachers`}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            <div className="text-sm font-semibold text-gray-600 uppercase mb-4">Navigation</div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('users')}
                  className={`flex items-center w-full p-2 rounded transition-colors ${
                    activeTab === 'users' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Users</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('settings')}
                  className={`flex items-center w-full p-2 rounded transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex gap-8">
          {/* Table Section */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedRole === 'all' 
                    ? 'All Users' 
                    : selectedRole === 'student' 
                      ? 'Students' 
                      : 'Teachers'
                  }
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredUsers.length})
                  </span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {user.role === 'teacher' ? (
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'teacher'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            <span className="h-2 w-2 mr-2 rounded-full bg-current"></span>
                            {user.role === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-96">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
              {error && (
                <div className={`p-3 rounded-md mb-4 ${
                  error.includes('successfully') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {error}
                </div>
              )}
              <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingId && '(Leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={editingId ? "Leave blank to keep current" : "Enter Password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingId}
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : editingId ? 'Update User' : 'Add User'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        role: 'student'
                      });
                      setError('');
                    }}
                    className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;