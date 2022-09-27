/**
 * Define the user interface
 *
 * @interface User
 *
 */

export interface IUser {
  _id: string;
  email: string;
  role: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  country: string;
  phone?: string;
}

export default IUser;
