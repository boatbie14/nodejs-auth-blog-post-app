import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = React.createContext();

function AuthProvider(props) {
  const [state, setState] = useState({
    loading: null,
    error: null,
    user: null,
  });

  const login = async (username, password) => {
    try {
      setState({ ...state, loading: true, error: null });

      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // เก็บ token ลงใน localStorage
      localStorage.setItem("token", data.token);
      const decodedToken = jwtDecode(data.token);

      // เก็บข้อมูล user ใน state
      setState({
        ...state,
        loading: false,
        error: null,
        user: {
          ...data.user, // ข้อมูลจาก response
          ...decodedToken, // ข้อมูลที่ decode จาก token
        },
      });

      return {
        success: true,
        data: data,
        user: {
          ...data.user,
          ...decodedToken,
        },
      };
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const register = async (username, password, firstname, lastname) => {
    try {
      setState({ ...state, loading: true, error: null });

      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          firstname,
          lastname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setState({
        ...state,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const logout = () => {
    // ลบ token ออกจาก localStorage
    localStorage.removeItem("token");

    // รีเซ็ต state ของผู้ใช้
    setState({
      ...state,
      user: null,
    });

    // คืนค่าสถานะเพื่อบอกว่าการ logout สำเร็จ
    return {
      success: true,
    };
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));
  return <AuthContext.Provider value={{ state, login, logout, register, isAuthenticated }}>{props.children}</AuthContext.Provider>;
}

// this is a hook that consume AuthContext
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
