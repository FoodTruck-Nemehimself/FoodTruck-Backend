import { type Request, type Response } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import Customer from './models/Customer'
import app from './app'
import sequelize from './config/database.config'
import { DataTypes, Model } from 'sequelize'

app.post('/users', passport.authenticate('google'), (req: Request, res: Response) => {
  const { id: userId, displayName: userDisplayName, emails: userEmails } = req.user // Access user data from Passport
 

  // ... in the user endpoint or callback
  const user = new Customer({
    Id: userId,
    name: userDisplayName,
    email: userEmails[0].value // Assuming you want to use the first email
  })

  user.save()
    .then(() => {
    //   res.json({ message: 'User created successfully!' })
    })
    .catch((err: any) => {
      console.error(err)
      res.status(500).json({ message: 'Error creating user' })
    })

  res.json({ message: 'User created successfully!' })
})
