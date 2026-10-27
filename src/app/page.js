import Navbar from "@/component/homepage/Navbar";
import { Card } from "@heroui/react";
import LoginPage from "./auth/login/page";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-green-100">
      <Card className="border rounded-lg">
        <LoginPage />
      </Card>
    </div>
  );
}
