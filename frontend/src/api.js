const API_URL = "http://localhost:5000/api";

// const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email, password, role) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }), // send role
  });
  return res.json();
};


export const register = async (data) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
