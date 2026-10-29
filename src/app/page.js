import Navbar from "@/component/homepage/Navbar";
import { Card } from "@heroui/react";
import LoginPage from "./auth/login/page";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-green-50">
      <Card className="border rounded-lg p-4 shadow-md bg-white">
        <LoginPage />
      </Card>
    </div>
  );
}