import { SignIn } from "@clerk/nextjs";
import React from "react";
// f
const Page = () => {
  return <SignIn
  signInFallbackRedirectUrl="/post-auth"
  signUpFallbackRedirectUrl="/post-auth"
/>
;
};
export default Page;
