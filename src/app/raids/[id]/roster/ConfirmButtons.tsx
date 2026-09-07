"use client";

import { useTransition } from "react";
import { setSignupConfirmed } from "../../actions";

export function ConfirmButtons({
  raidID,
  signupID,
  confirmed,
}: {
  raidID: number;
  signupID: number;
  confirmed: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title="Click to toggle confirmation"
      onClick={() => startTransition(() => setSignupConfirmed(raidID, signupID, !confirmed))}
      className={
        confirmed
          ? "cursor-pointer text-green-600 hover:text-green-700 hover:underline disabled:cursor-default disabled:opacity-50"
          : "cursor-pointer text-red-600 hover:text-red-700 hover:underline disabled:cursor-default disabled:opacity-50"
      }
    >
      {confirmed ? "Confirmed" : "Unconfirmed"}
    </button>
  );
}
