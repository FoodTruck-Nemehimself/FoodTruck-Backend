import { type Request, type Response } from 'express'
// import nodemailer from 'nodemailer'
import speakeasy from 'speakeasy'
import Customer from '../models/Customer'
import { transporter } from '../utils/emailSender'

export const sendOTP = async (email: string): Promise<unknown> => {
  try {
    const user = await Customer.findOne({ where: { email } })
    if (!user) {
      return 'invalid email'
    } else {
      const totpSecret = speakeasy.generateSecret({ length: 20 })
      const totpToken = speakeasy.totp({
        secret: totpSecret.base32,
        encoding: 'base32'
      })
      console.log(totpToken)
      // Store the OTP in the user record
      user.otp = totpToken
      user.otpExpirationTime = new Date(Date.now() + 10 * 90 * 1000) // 10 mins from now
      await user.save()
      const mailOptions = {
        from: 'infos.foodtruck@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${totpToken}`,
        html: `<b>Your OTP is: ${totpToken}</b>`
      }
      await transporter.sendMail(mailOptions)
    }
    // res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error)
  }
}

export const verifyOTPEmailAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp } = req.body

    const user = await Customer.findOne({ where: { otp } })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    if (user.otp !== otp || Date.now() > user.otpExpirationTime.getTime()) {
      res.status(400).json({ error: 'Invalid or expired OTP' })
      return
    }

    // Clear the OTP from the user record
    if (user.otp !== null && user.otpExpirationTime !== null) {
      await user.save()
    }
    // Set isVerified to true
    await Customer.update({ isVerified: true }, { where: { otp } })

    res.status(200).json({ message: 'OTP verified successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
