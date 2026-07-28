// ==========================================================
// Request With User Interface
// ==========================================================

import { Request } from 'express';

export interface IRequestUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface RequestWithUser extends Request {
  user: IRequestUser;
}
