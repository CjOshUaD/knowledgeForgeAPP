import LoginForm from "@/app/components/ui/login-form";
import { UserCircleIcon } from "@heroicons/react/24/outline";
export default function LoginPage() {
  return (
    <main className="flex items-center justify-left md:h-screen md:w-screen bg-[#1A4870]">
      <LoginForm setLoggedIn={undefined} isLoggedIn={undefined} />
    </main>
  );
}
