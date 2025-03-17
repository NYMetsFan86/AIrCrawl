import { useState } from 'react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('You have been added to the waitlist!');
        setEmail('');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">AIrCrawl is Coming Soon</h1>
      <p className="text-lg text-gray-300 text-center max-w-2xl">
        The AI-powered web crawling platform you've been waiting for. Be the first to experience AI-driven insights.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg">
        <label htmlFor="email" className="block text-sm text-gray-400 mb-2">Join the Beta Waitlist</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="Enter your email" 
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
        >
          Notify Me
        </button>
        {message && <p className="text-sm text-center mt-2 text-green-400">{message}</p>}
      </form>
    </div>
  );
}
