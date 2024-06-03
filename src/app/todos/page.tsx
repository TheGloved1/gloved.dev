import Link from "next/link";
import TodoPage from "./_components/TodoPage";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Page() {

  return (
    <>
      <Link href={"/"} className="fixed pl-0 left-2 top-2 flex flex-row items-center justify-center">
        <Button className="btn flex flex-row items-center justify-center">
          <ChevronLeft />
          {"Back"}
        </Button>
      </Link>
      <TodoPage />
    </>
  )
}
