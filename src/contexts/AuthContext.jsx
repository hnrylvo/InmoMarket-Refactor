import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Generate a secure key for encryption
const generateKey = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

// Store the key in memory
let encryptionKey = null;

// Initialize the encryption key
const initEncryption = async () => {
  if (!encryptionKey) {
    encryptionKey = await generateKey();
  }
  return encryptionKey;
};

// Simple encryption function using Web Crypto API
const encryptData = async (data) => {
  try {
    const key = await initEncryption();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    encryptedArray.set(iv);
    encryptedArray.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...encryptedArray));
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

// Decryption function
const decryptData = async (encryptedData) => {
  try {
    const key = await initEncryption();
    const encoder = new TextEncoder();
    
    // Convert from base64
    const encryptedArray = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = encryptedArray.slice(0, 12);
    const data = encryptedArray.slice(12);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Convert back to string and parse JSON
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const encryptedUser = localStorage.getItem('user');
        if (encryptedUser) {
          const decryptedUser = await decryptData(encryptedUser);
          if (decryptedUser) {
            setUser(decryptedUser);
          } else {
            // If decryption fails, clear the invalid data
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login response:', data);

      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        roles: data.roles,
        token: data.token,
      };

      // Encrypt and store user data
      const encryptedData = await encryptData(userData);
      localStorage.setItem('user', encryptedData);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 