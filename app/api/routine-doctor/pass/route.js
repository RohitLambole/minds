import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RoutineDoctorRequest from "@/models/RoutineDoctorRequest";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { requestId } = await request.json();
    
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const routineRequest = await RoutineDoctorRequest.findById(requestId);
    
    if (!routineRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (routineRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Request already processed" },
        { status: 400 }
      );
    }

    routineRequest.status = "rejected";
    routineRequest.rejectedAt = new Date();
    
    await routineRequest.save();

    return NextResponse.json({
      success: true,
      message: "Request passed successfully"
    });

  } catch (error) {
    console.error("Error passing routine doctor request:", error);
    return NextResponse.json(
      { error: "Failed to pass request" },
      { status: 500 }
    );
  }
}