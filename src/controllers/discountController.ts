import { Request, Response } from "express";
import { generateDiscountCode } from "../utils/generateDiscount";
import { Discount } from "../model/Discount";

// export const createDiscount = async (req: Request, res: Response) => {
//  const { discountType, amount, expiresAt, isOneTime } = req.body;

//   if (!discountType || !amount) {
//     return res.status(400).json({ success: false, message: "Discount type and amount are required" });
//   }

//   try {
//     const code = generateDiscountCode(); 
//     const discount = await Discount.create({
//       code,
//       discountType,
//       amount,
//       expiresAt: expiresAt ? new Date(expiresAt) : null,
//       isOneTime,
//     });

//     res.status(201).json({ success: true, data: discount });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err || "Server error" });
//   }
// };
export const createDiscount = async (req: Request, res: Response) => {
  const { membership, discountType, amount, expiresAt, isOneTime } = req.body;

  if (!membership) {
    return res.status(400).json({ success: false, message: "Membership group is required" });
  }

  if (!["BBG", "NBCC"].includes(membership)) {
    return res.status(400).json({ success: false, message: "Invalid membership group" });
  }

  try {
    const code = generateDiscountCode(membership);

    const discount = await Discount.create({
      code,
      discountType,
      percentage: amount,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxUsage: isOneTime ? 1 : 1000,
    });

    res.status(201).json({ success: true, data: discount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


export const verifyDiscount = async (req: Request, res: Response) => {
 try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Discount code is required",
      });
    }

    const discount = await Discount.findOne({ code });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Invalid discount code",
      });
    }

    // Check active
    if (!discount.isActive) {
      return res.status(400).json({
        success: false,
        message: "This code has been used",
      });
    }

    // Check expiration
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This discount code has expired",
      });
    }

    // Check usage limit
    if (discount.usedCount >= discount.maxUsage) {
      return res.status(400).json({
        success: false,
        message: "This discount code has already been used",
      });
    }

    // Return only what frontend needs
    return res.json({
      success: true,
      code: discount.code,
      percentage: discount.percentage
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error verifying code",
    });
  }
};

