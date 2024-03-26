import Menu from '../models/Menu'
import { type Request, type Response } from 'express'

export const addMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nameofDish, category, priceofDish, imageofDish } = req.body

    const data = await Menu.create({ nameofDish, category, priceofDish, imageofDish })
    if (data) {
      res.status(200).json({
        message: 'Menu added Sucessfully!'
      })
    }
  } catch (error) {
    error
    console.error('error adding Menu', error)
    if (error) {
      res.status(500).json({
        message: 'Internal server error', error
      })
    }
  }
}
