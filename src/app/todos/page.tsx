import Link from "next/link";
import TodoPage from "./_components/todo-page";
import { ChevronLeft } from "lucide-react";

export default function Page() {

  return (
    <>
      <Link href={"/"} className="flex fixed bottom-2 left-2 flex-row justify-center items-center pl-0 lg:top-2 lg:bottom-auto">
        <button className="flex flex-row justify-center items-center btn">
          <ChevronLeft />
          {"Back"}
        </button>
      </Link>
      <TodoPage />
    </>
  )
}
