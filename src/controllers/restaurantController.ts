import Restaurant from '../models/Restaurant'
import Order from '../models/Order'
import { type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import Menu from '../models/Menu'
import { sendResOTP } from './restaurantVerify'

const validateInputs = (email: string, password: string): string | null => {
  if (!email || !password) {
    return 'Email and password are required fields'
  }
  return null // Inputs are valid
}
export const restaurantSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      nameofRestaurant,
      state,
      city,
      email,
      password,
      phoneNumber,
      address,
      logo
    } = req.body

    // Validate inputs
    const validationError = validateInputs(email, password)
    if (validationError) {
      res.status(400).json({ message: validationError })
      return
    }

    // Check if the restaurant with the given email already exists
    const existingRestaurant = await Restaurant.findOne({ where: { email } })

    if (existingRestaurant) {
      res.json({
        status: 'failed',
        message: 'Email is already in use, try another email'
      })
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create a new restaurant with the logo field
    const newRestaurant = await Restaurant.create({
      firstName,
      lastName,
      nameofRestaurant,
      state,
      city,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      logo
    })

    await sendResOTP(email)

    if (!newRestaurant) {
      res.status(400).json({
        status: 'failed',
        message: 'Invalid details, account cannot be created'
      })
      return
    }

    res.status(201).json({
      restaurantDetail: newRestaurant,
      message: 'Signup successful'
    })
  } catch (error) {
    console.error('Error during Restaurant signup:', error)
    res.status(500).json({ message: 'Restaurant signup unsuccessful' })
  }
}

export const restaurantLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('Reached restaurantSignup controller')
  const { email, password } = req.body

  // Validate inputs
  const validationError = validateInputs(email, password)
  if (validationError) {
    res.status(400).json({ message: validationError })
    return
  }

  try {
    const existingRestaurant = await Restaurant.findOne({ where: { email } })

    if (!existingRestaurant) {
      res.status(404).json({
        message: 'Restaurant not found'
      })
      return
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingRestaurant?.dataValues.password
    )

    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid password'
      })
      return
    }

    res.status(200).json({
      restaurantDetail: existingRestaurant,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Error during restaurant login:', error)

    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = req.params.orderId
    console.log('orderId', orderId)

    // Assuming you have a request body containing fields to update
    const { orderStatus, orderDate, totalAmount } = req.body

    const [updatedRowsCount, updatedOrder] = await Order.update(
      { orderStatus, orderDate, totalAmount },
      {
        returning: true,
        where: { id: orderId }
      }
    )

    if (updatedRowsCount === 0 || !updatedOrder) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    // Send the updated order as a response
    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// get paginated menus for restaurant
export const getAllMenu = async (req: Request, res: Response): Promise<void> => {
  const { restaurantId } = req.params
  const { page = '1', pageSize = '10' } = req.query

  try {
    const menus = await Menu.findAndCountAll({
      where: { restaurantId },
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string)
    })

    if (!menus) {
      res.status(404).json({
        message: 'Menu not found'
      })
    } else {
      res.json({
        total: menus.count,
        totalPages: Math.ceil(menus.count / parseInt(pageSize as string)),
        currentPage: parseInt(page as string),
        menus: menus.rows
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
