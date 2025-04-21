import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const protect = (req, res, next) => {
  try {
    // ตรวจสอบว่ามี Authorization header หรือไม่
    const authorization = req.headers.authorization;
    console.log("authen = " + authorization);

    // ถ้าไม่มี header หรือรูปแบบไม่ถูกต้อง (ต้องขึ้นต้นด้วย "Bearer ")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token has invalid format",
      });
    }

    // แยก token ออกจาก "Bearer "
    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token has invalid format",
      });
    }

    try {
      // ตรวจสอบความถูกต้องของ token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // เพิ่มข้อมูลผู้ใช้ที่ถอดรหัสแล้วลงใน request object
      req.user = decoded;

      // ไปยัง middleware หรือ controller ถัดไป
      next();
    } catch (error) {
      // กรณี token ไม่ถูกต้อง
      return res.status(401).json({
        message: "Token is invalid",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default protect;
