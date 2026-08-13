import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

/**
 * Validate incoming request payload properties using a Zod schema.
 */
export const validate = (schema: ZodType<any, any, any>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((issue) => `${issue.path.slice(1).join(".")}: ${issue.message}`)
          .join(", ");
        return next(new AppError(`Validation failed: ${errorMessages}`, 400));
      }
      next(error);
    }
  };
};

export default validate;
