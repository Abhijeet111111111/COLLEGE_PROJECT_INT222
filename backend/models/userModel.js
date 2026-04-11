
import bcrypt from 'bcrypt';
import mongoose from 'mongoose'
import validator from 'validator'
import crypto from 'crypto'
import { type } from 'os';


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true, // converts to lowercase
        validate: [validator.isEmail, 'please provide a valid email']
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
    confirmPassword: {
        type: String,
        required: [true, 'please confirm your password'],
        minLength: 8,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "password should be same!"
        }
    },
    photo: String,
    passwordChangeTime: Date,
    passwordResetToken: String,
    tokenExpiresIn: Date,
    isActive: {
        type: Boolean,
        default: true
    }
})

userSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } })
    next();
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangeTime = Date.now() - 1000; // ?????????????????
    next();
})

userSchema.pre('save', async function (next) {  // don't use arrow function when using this
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

userSchema.methods.verifyPassword = async function (candidatePassword, userPassword) { // why are we passing the user password
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.passwordChangedAfter = function (issuedTime) { // function used for protect middleware
    if (this.passwordChangeTime) {
        const changeTime = parseInt(this.passwordChangeTime.getTime(), 10) / 1000
        return changeTime > issuedTime
    }
    return false;
}

userSchema.methods.generateResetToken = function () {
    const resetToke = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToke).digest('hex');
    this.tokenExpiresIn = Date.now() + 10 * 60 * 1000;
    return resetToke;
}

const User = mongoose.model('User', userSchema);


export default User