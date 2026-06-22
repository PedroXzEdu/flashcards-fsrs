import { Request, Response, NextFunction } from "express";

import { ZodSchema } from "zod";

export function validate(schema?: ZodSchema, querySchema?: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema) {
      req.body = schema.parse(req.body);
    }

    if (querySchema) {
      req.query = querySchema.parse(req.query);
    }

    next();
  };
}
