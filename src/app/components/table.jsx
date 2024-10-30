// components/UserTable.js
 // Use "client" if you are using React hooks like useEffect
'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';


export default async function UserTable() {
  //const response = await axios.get('http://localhost:3000/api/users');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <table className='border border-gray-500'>
      <thead className='border border-gray-500'>
        <tr>
          <th className='border border-gray-500'>ID</th>
          <th className='border border-gray-500'>Name</th>
          <th className='border border-gray-500'>Email</th>
          <th className='border border-gray-500'>Password</th>
          <th className='border border-gray-500'>Action</th>
        </tr>
      </thead>
      <tbody className='border border-gray-500'>
        {users.length === 0 ? (
          <tr>
            <td colSpan="5" className='border border-gray-500 text-center'>No users found</td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user._id}>
              <td className='border border-gray-500'>{user._id}</td>
              <td className='border border-gray-500'>{user.name}</td>
              <td className='border border-gray-500'>{user.email}</td>
              <td className='border border-gray-500'>{user.password}</td>
              <td className='border border-gray-500'>
                <button className='mr-2'>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}