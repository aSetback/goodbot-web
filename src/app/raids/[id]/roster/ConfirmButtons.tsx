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
    <span className="flex items-center gap-3">
      <span className={confirmed ? "text-green-600" : "text-red-600"}>
        {confirmed ? "Confirmed" : "Unconfirmed"}
      </span>
      <button
        type="button"
        disabled={isPending}
        title="Confirm"
        onClick={() => startTransition(() => setSignupConfirmed(raidID, signupID, true))}
        className="text-green-600 hover:text-green-700 disabled:opacity-50"
      >
        &#128077;
      </button>
      <button
        type="button"
        disabled={isPending}
        title="Unconfirm"
        onClick={() => startTransition(() => setSignupConfirmed(raidID, signupID, false))}
        className="text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        &#128078;
      </button>
    </span>
  );
}
