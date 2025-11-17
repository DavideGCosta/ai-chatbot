"use server";

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import {
  deleteAllChatsByUserId,
  deleteUserAccountById,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function DELETE() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    await deleteAllChatsByUserId({ userId });
    await deleteUserAccountById({ userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("[api/account:DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 }
    );
  }
}
