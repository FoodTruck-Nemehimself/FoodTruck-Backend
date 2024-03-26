import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.config'
import { v4 as uuidv4 } from 'uuid'
// import Restaurant from './Restaurant'

class Menu extends Model {
  public id!: string
  public nameofDish!: string
  public category!: string
  public priceofDish!: number
  public imageofDish!: string

  // static associate (): void {
  //   Menu.belongsTo(Restaurant, { foreignKey: 'restaurantId' })
  // }
}

Menu.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
      unique: true
    },
    nameofDish: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    priceofDish: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    imageofDish: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Menu'
  }
)

export default Menu
