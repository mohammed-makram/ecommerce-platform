import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function App() {
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (user) => {
    const cartItem = {
      id: user.id,
      name: user.name,
      email: user.email,
      price: Math.floor(Math.random() * 100) + 10, // Random price for demo
      quantity: 1
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === user.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === user.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, cartItem];
    });
  };

  const removeFromCart = (userId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== userId));
  };

  const updateQuantity = (userId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(userId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === userId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate payment processing
      const paymentData = {
        user_id: cart[0].id,
        amount: getTotalPrice(),
        currency: 'USD'
      };

      // Call payment API (simulated)
      console.log('Processing payment:', paymentData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Payment processed successfully!');
      setCart([]);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛒 E-commerce Shopping Cart</h1>
        <p>User Management & Payment Processing Demo</p>
      </header>

      <main className="App-main">
        <div className="container">
          <div className="users-section">
            <h2>👥 Available Users</h2>
            {loading && <div className="loading">Loading users...</div>}
            {error && <div className="error">Error: {error}</div>}
            
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <h3>{user.name}</h3>
                  <p>📧 {user.email}</p>
                  <p>👤 {user.role}</p>
                  <button 
                    onClick={() => addToCart(user)}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h2>🛍️ Shopping Cart ({cart.length} items)</h2>
            
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <p>Add some users to get started!</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>{item.email}</p>
                      </div>
                      <div className="item-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                        <span className="price">${item.price}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="total">
                    <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
                  </div>
                  <button 
                    onClick={checkout}
                    disabled={loading}
                    className="checkout-btn"
                  >
                    {loading ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="App-footer">
        <p>DevOps Professional Project - Service 1: E-commerce Platform</p>
        <p>Backend 1: User Management API | Backend 2: Payment Processing API | Frontend: React Shopping Cart</p>
      </footer>
    </div>
  );
}

export default App;

