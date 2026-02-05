import jwt from 'jsonwebtoken';

class SuccessResponse {
  success: boolean;
  message: string;
  data: any;

  constructor(message: string, data: any | null) {
    this.success = true; // As this is for successful responses
    this.message = message;
    this.data = data;
  }

  // Method to send the response
  sendResponse(res: any) {
    res.status(200).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export default SuccessResponse;

const SECRET = process.env.JWT_SECRET || "LMT2025";
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '1w' });
};
