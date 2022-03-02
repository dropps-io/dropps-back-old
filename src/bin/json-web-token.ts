import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../environment/endpoints";

export function generateJWT(address: string): string {
  return jwt.sign({
    address: address
  }, JWT_SECRET, {expiresIn: '6h'});
}
