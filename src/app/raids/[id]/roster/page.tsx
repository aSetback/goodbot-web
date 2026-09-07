import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Raid, Signup, Character } from "@/lib/models";
import { getUserGuilds } from "@/lib/discord";
import { hasRaidAccess } from "@/lib/requireRaidAccess";
import { getClassRoleEmojis } from "@/lib/botInternalApi";
import { formatRaidDate } from "@/lib/formatRaidDate";
import { EmojiIcon } from "@/components/EmojiIcon";
import { Breadcrumbs } from "../../Breadcrumbs";
import { RaidTabs } from "../../RaidTabs";
import { ConfirmButtons } from "./ConfirmButtons";
import { RefreshChannelButton } from "./RefreshChannelButton";

const ROLES: { role: string; label: string }[] = [
  { role: "tank", label: "Tanks" },
  { role: "healer", label: "Healers" },
  { role: "caster", label: "Casters" },
  { role: "dps", label: "DPS" },
];

export default async function RaidRosterPage({
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

  const session = await auth();
  if (!session?.accessToken || !session.discordId) {
    notFound();
  }
  const guilds = await getUserGuilds(session.accessToken);
  if (!hasRaidAccess(guilds, raid, session.discordId)) {
    notFound();
  }

  const [signups, emojis] = await Promise.all([
    Signup.findAll({
      where: { raidID: raid.id, signup: "yes" },
      include: [{ model: Character, as: "character", include: [{ model: Character, as: "main" }] }],
      order: [["id", "ASC"]],
    }),
    getClassRoleEmojis(),
  ]);

  const rows = signups.map((signup, index) => ({
    signup,
    order: index + 1,
    class: signup.character?.class ?? "unknown",
    role: signup.character?.role ?? "unknown",
    mainName: signup.character?.main?.name ?? null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div>
        <Breadcrumbs
          items={[
            { label: "Raids", href: `/dashboard/${raid.guildID}/raids` },
            { label: raid.name },
          ]}
        />
        <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">{raid.name}</h1>
        <p className="text-sm text-zinc-500">{formatRaidDate(raid.date)}</p>
      </div>

      <RaidTabs raidID={raid.id} active="roster" />

      {ROLES.map(({ role, label }) => {
        const roleRows = rows
          .filter((row) => row.role === role)
          .sort((a, b) => a.class.localeCompare(b.class) || a.order - b.order);
        if (roleRows.length === 0) return null;

        return (
          <table key={role} className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 font-medium" />
                <th className="py-2 font-medium">{label}</th>
                <th className="py-2 font-medium" />
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {roleRows.map(({ signup, class: klass, role: rowRole, mainName, order }) => (
                <tr key={signup.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 w-8 text-zinc-400">{order}</td>
                  <td className="py-2">
                    {signup.player}{" "}
                    {mainName && <span className="text-orange-500">({mainName})</span>}
                  </td>
                  <td className="py-2 text-right">
                    <span className="flex items-center justify-end gap-1.5">
                      <EmojiIcon emoji={emojis[klass]} label={klass} />
                      <EmojiIcon emoji={emojis[rowRole]} label={rowRole} />
                    </span>
                  </td>
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
