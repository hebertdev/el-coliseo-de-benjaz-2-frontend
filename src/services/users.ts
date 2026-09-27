import {  axiosInstanceApi, axiosInstanceBackend, axiosInstancePublic } from "helpers/axios";
import type { AxiosRequestConfig } from "axios";

//interfaces
import { UserData, UserLoginCredentials, UsersData, UserSignupCredentials, UserSignupResponse, UserVerifyCredentials, UserForgotPasswordCredentials, UserResetPasswordCredentials } from "interfaces/users";

export async function loginAPI({ email, password }: UserLoginCredentials) {
  const { data } = await axiosInstanceApi.post<{ user: UserData }>(
    "/api/auth/login",
    { email, password }
  );
  return data;
}

export async function signupAPI(data: UserSignupCredentials) {
  const response = await axiosInstancePublic.post<UserSignupResponse>(
    "/users/signup/",
    data
  );
  return response.data;
}

export async function verifyEmailAPI(data: UserVerifyCredentials) {
  const response = await axiosInstancePublic.post(
    "/users/verify/",
    data
  );
  return response.data;
}

export async function resendCodeAPI(email: string) {
  const response = await axiosInstancePublic.post(
    "/users/resend_code/",
    { email }
  );
  return response.data;
}

export async function forgotPasswordAPI(data: UserForgotPasswordCredentials) {
  const response = await axiosInstancePublic.post(
    "/users/forgot_password/",
    data
  );
  return response.data;
}

export async function resetPasswordAPI(data: UserResetPasswordCredentials) {
  const response = await axiosInstancePublic.post(
    "/users/reset_password/",
    data
  );
  return response.data;
}

export async function getUsersAPI(){
  const { data } = await axiosInstanceBackend.get<UsersData>(
    "/users/"
  );
  return data;  
}

export async function whoAmIAPI(){
  const response = await axiosInstanceBackend.get<UserData | null>(
    "/users/whoami/",
    { skipAuthRedirect: true } as AxiosRequestConfig
  );
  return response.data;
}

export async function HelloPublicAPI(){
  const response = await axiosInstanceBackend.get<string>(
    "/users/public_hello/"
  );
  return response.data;
}

export async function HelloPrivateAPI(){
  const response = await axiosInstanceBackend.get<string>(
    "/users/private_hello/"
  );
  return response.data;
}

export async function HelloPrivateNameAPI(name: string){
  const response = await axiosInstanceBackend.post<string>(
    "/users/private_greeting/",
    { name }
  );
  return response.data;
}