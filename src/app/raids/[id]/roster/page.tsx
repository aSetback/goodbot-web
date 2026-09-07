import Script from "next/script";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Raid, Signup, Character, RaidReserve, ReserveItem } from "@/lib/models";
import { getUserGuilds } from "@/lib/discord";
import { hasRaidAccess } from "@/lib/requireRaidAccess";
import { getClassRoleEmojis } from "@/lib/botInternalApi";
import { formatRaidDate } from "@/lib/formatRaidDate";
import { EmojiIcon } from "@/components/EmojiIcon";
import { Breadcrumbs } from "../../Breadcrumbs";
import { RaidTabs } from "../../RaidTabs";
import { getCopyConfirmSources } from "../../actions";
import { ConfirmButtons } from "./ConfirmButtons";
import { RefreshChannelButton } from "./RefreshChannelButton";
import { RosterBulkActions } from "./RosterBulkActions";

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

  const [signups, emojis, copySources] = await Promise.all([
    Signup.findAll({
      where: { raidID: raid.id, signup: "yes" },
      include: [
        { model: Character, as: "character", include: [{ model: Character, as: "main" }] },
        { model: RaidReserve, as: "reserve", include: [{ model: ReserveItem, as: "item" }] },
      ],
      order: [["id", "ASC"]],
    }),
    getClassRoleEmojis(),
    raid.confirmation ? getCopyConfirmSources(raid.id) : null,
  ]);

  const rows = signups.map((signup, index) => ({
    signup,
    order: index + 1,
    class: signup.character?.class ?? "unknown",
    role: signup.character?.role ?? "unknown",
    mainName: signup.character?.main?.name ?? null,
    reserveItem: signup.reserve?.item ?? null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      {/* Wowhead's tooltip widget turns any wotlk.wowhead.com/item/... link
          below into a hover card automatically -- no per-link markup needed. */}
      <Script id="wowhead-tooltip-config" strategy="beforeInteractive">
        {"const whTooltips = { colorLinks: true, iconizeLinks: true, renameLinks: true };"}
      </Script>
      <Script src="https://wow.zamimg.com/widgets/power.js" strategy="afterInteractive" />

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

      {raid.confirmation && copySources && (
        <RosterBulkActions
          raidID={raid.id}
          channelOptions={copySources.options}
          defaultChannelID={copySources.defaultChannelID}
        />
      )}

      {ROLES.map(({ role, label }) => {
        const roleRows = rows
          .filter((row) => row.role === role)
          .sort((a, b) => a.class.localeCompare(b.class) || a.order - b.order);
        if (roleRows.length === 0) return null;

        const nameWidth = raid.softreserve ? "w-[50%]" : "w-[75%]";

        return (
          <table key={role} className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="w-8 py-2 font-medium" />
                <th className={`${nameWidth} py-2 font-medium`}>{label}</th>
                {raid.softreserve && <th className="w-[25%] py-2 font-medium">Reserve</th>}
                <th className="w-[25%] py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {roleRows.map(({ signup, class: klass, role: rowRole, mainName, reserveItem, order }) => (
                <tr key={signup.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 w-8 text-zinc-400">{order}</td>
                  <td className="py-2 truncate">
                    <span className="inline-flex items-center gap-1.5 align-middle">
                      <EmojiIcon emoji={emojis[klass]} label={klass} />
                      <EmojiIcon emoji={emojis[rowRole]} label={rowRole} />
                    </span>{" "}
                    {signup.player}{" "}
                    {mainName && mainName !== signup.player && (
                      <span className="text-orange-500">({mainName})</span>
                    )}
                  </td>
                  {raid.softreserve && (
                    <td className="py-2 truncate">
                      {reserveItem ? (
                        reserveItem.itemID ? (
                          <a
                            href={`https://wotlk.wowhead.com/item/${reserveItem.itemID}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-600 hover:text-amber-700"
                          >
                            {reserveItem.name}
                          </a>
                        ) : (
                          reserveItem.name
                        )
                      ) : (
                        <span className="text-zinc-400">&mdash;</span>
                      )}
                    </td>
                  )}
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
          Confirmations sync to the sign-up channel automatically about 15 seconds after the last
          change, or immediately via the button below.
        </p>
        <div className="mt-3">
          <RefreshChannelButton raidID={raid.id} />
        </div>
      </div>
    </div>
  );
}
