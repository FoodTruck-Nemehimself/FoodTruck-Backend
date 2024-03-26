import { type Request, type Response, type NextFunction } from 'express'
import Order from '../models/Order'

// admin pagination to get either all orders, confirmed orders or Unconfirmed orders

export const getOrdersByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 5 // Adjust the limit as needed
    const type = req.query.type ? req.query.type : 'all'

    const offset = (page - 1) * limit

    const whereClause: Record<string, 'resolved' | 'unresolved' | undefined> = {}

    switch (type) {
      case 'resolved':
        whereClause.orderStatus = 'resolved'
        break
      case 'unresolved':
        whereClause.orderStatus = 'unresolved'
        break
      default:
        delete whereClause.orderStatus
    }

    const orders = await Order.findAll({ where: whereClause, offset, limit })
    const totalOrder = await Order.count({ where: whereClause })

    res.status(200).json({
      message: 'Orders Successfully retrieved',
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrder / limit)
    })
  } catch (error) {
    console.error('Error getting orders', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// axios.get('/orders')
//  .then(function (response) {
//     // handle success
//     console.log(response.data);
//  })
//  .catch(function (error) {
//     // handle error
//     console.log(error);
//  });

// axios.get('/orders?type=resolved')
//  .then(function (response) {
//     // handle success
//     console.log(response.data);
//  })
//  .catch(function (error) {
//     // handle error
//     console.log(error);
//  });
