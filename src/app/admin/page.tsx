import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../actions";
import AdminLoginClient from "./AdminLoginClient";

export default async function AdminLoginPage() {
  const isAuth = await isAdminAuthenticated();
  
  if (isAuth) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginClient />;
}
