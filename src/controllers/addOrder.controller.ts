import type { Request, Response } from 'express'
import Order from '../models/Order'

export const addOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber, orderStatus, orderItem, customerId, restaurantId } = req.body
    // Calculate totalAmount based on orderItem prices
    const totalAmount = calculateTotalAmount(orderItem)

    const newOrder = await Order.create({
      orderNumber,
      orderStatus,
      orderItem,
      totalAmount,
      customerId,
      restaurantId
    })

    res.status(201).json(newOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// Function to calculate total amount from order items
const calculateTotalAmount = (orderItems: Array<{ itemName: string, price: number }>): number => {
  return orderItems.reduce((total, item) => total + item.price, 0)
}
