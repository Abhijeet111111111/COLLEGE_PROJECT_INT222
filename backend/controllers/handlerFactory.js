
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
const deleteOne = (Model) => catchAsync(async (req, res) => {

    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError("document not found", 404))
    }
    res.status(204).json({
        status: 'success',
        data: {
            doc
        }
    })
})

const updateOne = (Model) => catchAsync(async (req, res) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doc) {
        return next(new AppError("document not found", 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})

const createOne = (Model) => catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})

const getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    const doc = await Model.findById(req.params.id).populate(popOptions);

    if (!doc) {
        return next(new AppError("document not found", 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })

})

const getAll = (Model) => catchAsync(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }

    // filtering 
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    // console.log(queryString);
    let query = Model.find({ $and: [JSON.parse(queryString), filter] });

    // sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else {
        query = query.sort('-createdAt')
    }
    // select
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        console.log(fields)
        query = query.select(fields);
    }
    else {
        query = query.select('-__v')
    }
    // pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const doc = await query;
    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            doc
        }
    })
})

export default {
    deleteOne,
    updateOne,
    createOne,
    getAll,
    getOne
}