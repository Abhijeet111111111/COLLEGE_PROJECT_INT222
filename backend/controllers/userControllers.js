

import userModel from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import factory from './handlerFactory.js'

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) { newObj[el] = obj[el]; }
    })

    return newObj;
}

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

const deleteMe = catchAsync(async (req, res, next) => {
    await userModel.findByIdAndUpdate(req.user._id, { isActive: false })
    res.status(204).json({
        "status": 'success'
    })
})


const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('this is not the route the change password , visit /updatePassword', 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    const updateUser = await userModel.findByIdAndUpdate(req.user._id, filteredBody, { new: true, runValidators: true })

    res.status(200).json({
        status: 'success',
        user: updateUser
    })

})

const getUsers = factory.getAll(userModel);

const makeUser = factory.createOne(userModel);
const getUser = factory.getOne(userModel, '')
// do not update password with this
const updateUser = factory.updateOne(userModel)
const deleteUser = factory.deleteOne(userModel)

export default {
  getUser,
  getMe,
  updateMe,
  deleteMe,
  getUsers,
  makeUser,
  deleteUser,
  updateUser
};