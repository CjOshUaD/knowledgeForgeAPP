'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { connectMongoDB } from "@/app/lib/mongodb";

function Table() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [userType, setUserType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      await connectMongoDB();
      const response = await axios.get('http://localhost:5000/users');
      
      // Ensure data is an array
      const userData = response.data;
      if (Array.isArray(userData)) {
        setData(userData);
      } else {
        console.error('Invalid data format received:', userData);
        setData([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    // try {
    //   await axios.post('http://localhost:5000/users', formData);
    //   // Clear form
    //   setFormData({
    //     name: '',
    //     email: '',
    //     password: ''
    //   });
    //   // Refresh user list
    //   fetchUsers();
    // } catch (error) {
    //   console.error('Error adding user:', error);
    // }
  // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/users', formData);
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }

    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }
    

    try{

      const resUserExists = await fetch("api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();



      if (user) {
        setError("User already exists.");
        return;
      }

      setPending(true);
      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType,
          name,
          email,
          password,
        }),
      });
       if (res.ok) {
        setPending(false);
        const form = e.target;
        form.reset();
        router.push("/");
      } else {
        const errorData = await res.json();
        console.log("User registration failed")
        setPending(false);
      }

      router.push("/admin")
    } catch (error){
      console.log("Error during registration: ", error);
    }
  };

  return(
    <div>
      <h1>POST</h1>
      <div>
        <table className='border border-gray-500'>
          <thead className='border border-gray-500'>
            <tr >
              <td className='border border-gray-500'>ID</td>
              <td className='border border-gray-500'>NAME</td>
              <td className='border border-gray-500'>EMAIL</td>
              <td className='border border-gray-500'>PASSWORD</td>
              <td className='border border-gray-500'>ACTION</td>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key={index}>
                <td className='border border-gray-500'>{index + 1}</td>
                <td className='border border-gray-500'>{user.name}</td>
                <td className='border border-gray-500'>{user.email}</td>
                <td className='border border-gray-500'>{user.password}</td>
                <td className='border border-gray-500'>
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">EDIT</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded">DELETE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <button 
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

export default Table;