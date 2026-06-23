import prisma from '../config/db.js';
import { nanoid } from 'nanoid';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errorHandler.js';

const wrapAsync = (fn) => (req, res, next) =>{
    Promise.resolve(fn(req, res, next)).catch(next);
}