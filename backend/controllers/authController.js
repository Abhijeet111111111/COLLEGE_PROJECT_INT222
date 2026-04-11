
import userModel from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { promisify } from 'util';
import crypto, { sign } from 'crypto';
import jwt from 'jsonwebtoken'

const getJWTToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
const createSendToken = (user, statusCode, res) => {
    const token = getJWTToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXP_DATE * 24 * 60 * 60 * 1000),
        // maxAge: process.env.COOKIE_EXP_DATE * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production ') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: 'success',
        token,
        user
    })
}

const signup = catchAsync(async (req, res, next) => {
    const newUser = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        phone: req.body.phone
    });

    createSendToken(newUser, 201, res);
})

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);
    // email and password exits
    if (!email || !password) {
        return next(new AppError('please enter email and password', 400))
    }
    // verify email and password
    const user = await userModel.findOne({ email }).select('+password');
    console.log(user);
    if (!user || !(await user.verifyPassword(password, user.password))) {
        return next(new AppError('invalid email or password', 401))
    }

    createSendToken(user, 200, res);
})

const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10000),
        httpOnly: true
    })
    res.redirect('/login')
    // res.status(200).json({ 'status': 'success' })
    // nothing was happening , because i was not doing this line
}


const protect = catchAsync(async (req, res, next) => {
    // get token and check if it is there
    let token;
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookie.jwt) {
        token = req.cookie.jwt;
    }
    if (!token) {
        return next(new AppError('please login to get access!', 401));
    }

    // verify the token
    const respond = await promisify(jwt.verify)(token, process.env.JWT_SECRET) // don't wrap the parameters

    // if (!respond) {
    //     return next(new AppError('invalid token', 401));
    // }

    // check if user exists
    const freshUser = await userModel.findById(respond.id);
    if (!freshUser) {
        return next(new AppError('user does not exits', 401))
    }
    // user changed password after token was issued

    if (freshUser.passwordChangedAfter(respond.iat)) {
        return next(new AppError('password changed, please login again', 401));
    }

    // access granted
    req.user = freshUser

    next();
})

const isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        // verify the token
        try {
            const respond = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET) // don't wrap the parameters

            // check if user exists
            const freshUser = await userModel.findById(respond.id);
            if (!freshUser) {
                return next()
            }
            // user changed password after token was issued
            if (freshUser.passwordChangedAfter(respond.iat)) {
                return next();
            }
            // access granted
            res.locals.user = freshUser;

            return next();
        } catch (err) {
            return next();
        }
    }

    next();
}

const restrictTo = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) return next();
        else return next(new AppError('you are not allowed to do this!', 403));
    }
}

const forgotPassword = catchAsync(async (req, res, next) => {
    // if (!req.body.email) {
    //     return next(new AppError('please provide your email', 400))
    // }
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('no user with this email exits', 404));
    }
    try {
        const passwordResetToken = user.generateResetToken();

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${passwordResetToken}`
        const options = {
            email: user.email,
            message: `reset password using link: ${resetUrl}`,
            subjec: 'you have 10 min to reset your password!'
        }
        await sendMail(options);

        createSendToken(user, 200, res);
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.tokenExpiresIn = undefined;
        return next(new AppError('error in sending email', 500))
    }

})

const resetPassword = catchAsync(async (req, res, next) => {
    // console.log(req.params.token);
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // console.log(hashedToken);
    const user = await userModel.findOne({ passwordResetToken: hashedToken });
    if (!user) {
        return next(new AppError('invalid token', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.tokenExpiresIn = undefined;
    await user.save();

    createSendToken(user, 200, res);
})

const updatePassword = catchAsync(async (req, res, next) => {
    // 1.get the user 
    const user = await userModel.findOne({ _id: req.user._id }).select('password');
    // 2. match the passwords
    const isCorrect = await user.verifyPassword(req.body.password, user.password);
    if (!isCorrect) {
        return next(new AppError('incorrect password', 401)); // unauthorized
    }
    // 3. update 
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.newConfirmPassword;
    await user.save();
    createSendToken(user, 200, res);

})
export default {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword,
    restrictTo
};