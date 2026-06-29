/*************************************************************
 * api-app - validation.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 20.01.22 - 23:09
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import * as Joi from 'joi'

export const validationSchema = Joi.object({
  environment: Joi.string().valid('development', 'production', 'test'),
  appPort: Joi.number().default(3500)
})
