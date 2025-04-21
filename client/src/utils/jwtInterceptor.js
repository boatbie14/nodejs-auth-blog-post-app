import axios from "axios";

function jwtInterceptor() {
  axios.interceptors.request.use((req) => {
    // แนบ Token เข้าไปใน Header ของ Request
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // รองรับเมื่อ Server Response กลับมาเป็น Error
      if (error.response && error.response.status === 401) {
        // ถ้าเป็น Unauthorized (401) ให้ลบ token และ redirect ไปที่หน้า login
        localStorage.removeItem("token");
        window.location.href = "/login"; // หรือใช้ navigate ถ้าเป็น React Router
      }
      return Promise.reject(error);
    }
  );
}

export default jwtInterceptor;
