"use client";

import LoginView from "@/components/LoginView";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setUser } = useAppContext();
  const router = useRouter();

  return (
    <LoginView 
      onLoginSuccess={(name, role, avatar) => {
        const newUser = { name, role, avatar };
        setUser(newUser);
        localStorage.setItem('erp_user', JSON.stringify(newUser));
        router.push('/');
      }} 
    />
  );
}
