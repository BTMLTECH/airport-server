import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // the decoded JWT payload
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "Unauthorized: Token missing" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
