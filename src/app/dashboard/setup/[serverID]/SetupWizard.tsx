"use client";

import { useState, useTransition } from "react";
import { saveDashboardSetup } from "../../actions";
import { NA_SERVER_LIST, EU_SERVER_LIST } from "../../wowServers";

const selectClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function SetupWizard({
  serverID,
  categoryChannels,
}: {
  serverID: string;
  categoryChannels: { id: string; name: string }[];
}) {
  const [step, setStep] = useState(1);
  const [expansion, setExpansion] = useState("");
  const [faction, setFaction] = useState("");
  const [raidCategory, setRaidCategory] = useState("");
  const [runSetup, setRunSetup] = useState("");
  const [wowServer, setWowServer] = useState("");
  const [isPending, startTransition] = useTransition();

  function finish() {
    startTransition(() =>
      saveDashboardSetup(serverID, {
        expansion,
        faction,
        raidCategoryChannelID: raidCategory || undefined,
        runSetup: runSetup === "Yes",
        server: wowServer || undefined,
      })
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {step === 1 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-500">What expansion are you on?</label>
            <select
              className={selectClass}
              value={expansion}
              onChange={(e) => setExpansion(e.target.value)}
            >
              <option value=""></option>
              <option value="classic">Classic</option>
              <option value="tbc">Burning Crusade</option>
              <option value="wotlk">Wrath of the Lich King</option>
              <option value="boa">Battle for Azeroth</option>
              <option value="sl">Shadowlands</option>
            </select>
          </div>
          <button type="button" onClick={() => setStep(2)} className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50">
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-500">What faction do you play as?</label>
            <select className={selectClass} value={faction} onChange={(e) => setFaction(e.target.value)}>
              <option value=""></option>
              <option>Alliance</option>
              <option>Horde</option>
              <option>Both</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Back
            </button>
            <button type="button" onClick={() => setStep(3)} className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-500">
              Which category should GoodBot create your raids under?
            </label>
            <select
              className={selectClass}
              value={raidCategory}
              onChange={(e) => setRaidCategory(e.target.value)}
            >
              <option value=""></option>
              {categoryChannels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Back
            </button>
            <button type="button" onClick={() => setStep(4)} className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-500">
              Would you like channels set up for setting name, class and role?
            </label>
            <select className={selectClass} value={runSetup} onChange={(e) => setRunSetup(e.target.value)}>
              <option value=""></option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(3)} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Back
            </button>
            <button type="button" onClick={() => setStep(5)} className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-500">What server are you on?</label>
            <select
              className={selectClass}
              value={wowServer}
              onChange={(e) => setWowServer(e.target.value)}
            >
              <option value=""></option>
              <optgroup label="North America/Oceanic">
                {NA_SERVER_LIST.map((name) => (
                  <option key={name} value={`US/${name}`}>
                    {name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Europe">
                {EU_SERVER_LIST.map((name) => (
                  <option key={name} value={`EU/${name}`}>
                    {name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(4)} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Back
            </button>
            <button type="button" disabled={isPending} onClick={finish} className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50">
              Finish
            </button>
          </div>
        </>
      )}
    </div>
  );
}
