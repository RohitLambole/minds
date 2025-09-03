"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, Users, CheckCircle, ArrowLeft } from "lucide-react";

export default function WaitingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [waitTime, setWaitTime] = useState(0);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    const checkStatus = setInterval(async () => {
      if (!session?.user?.id) return;
      
      try {
        console.log("Checking status for user:", session.user.id);
        const response = await fetch(`/api/routine-doctor/status?userId=${session.user.id}`);
        const data = await response.json();
        console.log("Status response:", data);
        
        if (data.status === "accepted" && data.roomId) {
          console.log("Request accepted, redirecting to:", `/${data.connectionType}-room/${data.roomId}`);
          setStatus("accepted");
          setTimeout(() => {
            router.push(`/${data.connectionType}-room/${data.roomId}`);
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(checkStatus);
    };
  }, [session?.user?.id, router]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoBack = () => {
    router.push("/dashboard/routine-doctor");
  };

  if (status === "accepted") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-200 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Doctor Accepted!</h2>
          <p className="text-green-600 mb-4">Redirecting you to the consultation room...</p>
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white border-b border-orange-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Waiting for Doctor</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding Available Doctor</h2>
          <p className="text-gray-600 mb-8">Please wait while we connect you with a qualified healthcare professional</p>
          
          <div className="bg-orange-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <span className="text-2xl font-bold text-orange-800">{formatTime(waitTime)}</span>
            </div>
            <p className="text-orange-700 text-sm">Average wait time: 3-5 minutes</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <span className="text-gray-700">Request submitted successfully</span>
              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-sm">2</span>
              </div>
              <span className="text-gray-700">Matching with available doctor</span>
              <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin ml-auto"></div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg opacity-50">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-semibold text-sm">3</span>
              </div>
              <span className="text-gray-500">Start consultation</span>
              <Clock className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm font-medium">
              💡 Tip: Have your symptoms and questions ready for a more efficient consultation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}