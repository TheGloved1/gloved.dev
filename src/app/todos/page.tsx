import Link from "next/link";
import TodoPage from "./_components/todo-page";
import { ChevronLeft } from "lucide-react";

export default function Page() {

  return (
    <>
      <Link href={"/"} className="fixed pl-0 left-2 bottom-2 lg:bottom-auto lg:top-2 flex flex-row items-center justify-center">
        <button className="btn flex flex-row items-center justify-center">
          <ChevronLeft />
          {"Back"}
        </button>
      </Link>
      <TodoPage />
    </>
  )
}
