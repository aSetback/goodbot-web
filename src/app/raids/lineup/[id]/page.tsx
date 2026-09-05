import Link from "next/link";
import { notFound } from "next/navigation";
import { Raid, Signup, Character } from "@/lib/models";
import { ConfirmButtons } from "./ConfirmButtons";
import { RefreshChannelButton } from "./RefreshChannelButton";

const ROLES: { role: string; label: string }[] = [
  { role: "tank", label: "Tanks" },
  { role: "healer", label: "Healers" },
  { role: "caster", label: "Casters" },
  { role: "dps", label: "DPS" },
];

export default async function RaidLineupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raidID = Number(id);

  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    notFound();
  }

  const signups = await Signup.findAll({
    where: { raidID: raid.id, signup: "yes" },
    include: [{ model: Character, as: "character" }],
    order: [["id", "ASC"]],
  });

  const rows = signups.map((signup, index) => ({
    signup,
    order: index + 1,
    class: signup.character?.class ?? "unknown",
    role: signup.character?.role ?? "unknown",
    isAlt: Boolean(signup.character?.mainID),
  }));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Manage Lineup</h1>
        <h2 className="mt-1 text-lg text-zinc-700 dark:text-zinc-300">{raid.name}</h2>
        <p className="text-sm text-zinc-500">
          {new Date(raid.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
          })}
        </p>
        <Link
          href={`/raids/${raid.id}/manage`}
          className="mt-2 inline-block text-sm text-amber-600 hover:text-amber-700"
        >
          Edit Raid &rarr;
        </Link>
      </div>

      {ROLES.map(({ role, label }) => {
        const roleRows = rows
          .filter((row) => row.role === role)
          .sort((a, b) => a.class.localeCompare(b.class) || a.order - b.order);
        if (roleRows.length === 0) return null;

        return (
          <table key={role} className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 font-medium" colSpan={2}>
                  {label}
                </th>
                <th className="py-2 font-medium" />
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {roleRows.map(({ signup, class: klass, isAlt, order }) => (
                <tr key={signup.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 w-8 text-zinc-400">{order}</td>
                  <td className="py-2">
                    {signup.player}{" "}
                    <span className={isAlt ? "text-orange-500" : "text-green-600"}>
                      ({isAlt ? "alt" : "main"})
                    </span>
                  </td>
                  <td className="py-2">{klass}</td>
                  <td className="py-2 text-right">
                    {raid.confirmation && (
                      <ConfirmButtons
                        raidID={raid.id}
                        signupID={signup.id}
                        confirmed={Boolean(signup.confirmed)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}

      <div className="mt-4">
        <p className="text-sm text-zinc-500 italic">
          New confirmations will not show in the sign-up channel until the embed is refreshed.
          This can be done via the button, another player signing up, or a raid setting being
          changed.
        </p>
        <div className="mt-3">
          <RefreshChannelButton raidID={raid.id} />
        </div>
      </div>
    </div>
  );
}
