import LoginForm from "@/app/ui/login-form";
import { UserCircleIcon } from "@heroicons/react/24/outline";
export default function LoginPage() {
  return (
    <main className="flex items-center justify-left md:h-screen  bg-[url('/vibrant-books.png')]">
      <div className="abolute flex-col h-1/2 w-2/5">
        <div className="flex h-20 w-full items-end rounded-lg bg-green-500 p-3 md:h-36">
        <UserCircleIcon className="ml-auto mt-auto w-20 h-20 size-10" color="white" />
          <div className="w-32 md:w-50 "></div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
//relative mx-auto flex w-1/2 h-full   flex-col space-y-2.5 p-4 md:-ml-1 left-