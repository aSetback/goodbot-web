import { notFound } from "next/navigation";
import { Op } from "sequelize";
import { auth } from "@/auth";
import { decodeReserveToken } from "@/lib/reserveToken";
import { Raid, Signup, RaidReserve, ReserveItem } from "@/lib/models";
import { ReserveSelect } from "./ReserveSelect";

export default async function ReservesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await auth();
  if (!session) {
    // Next.js middleware normally catches this first; this is a fallback.
    notFound();
  }

  const { token } = await params;
  const decoded = decodeReserveToken(token);
  if (!decoded) {
    notFound();
  }

  const raid = await Raid.findByPk(decoded.raidID);
  if (!raid || String(raid.memberID) !== decoded.memberID) {
    notFound();
  }

  const signups = await Signup.findAll({
    where: { raidID: raid.id, signup: "yes" },
    include: [{ model: RaidReserve, as: "reserve", include: [{ model: ReserveItem, as: "item" }] }],
    order: [["player", "ASC"]],
  });

  const raidParts = raid.raid.split("+");
  const items = await ReserveItem.findAll({
    where: { raid: { [Op.in]: raidParts } },
    order: [["name", "ASC"]],
  });

  const raidDate = new Date(raid.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Raid Reserves</h1>
        <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
          <dt className="text-zinc-500">Raid Type:</dt>
          <dd>{raid.raid.charAt(0).toUpperCase() + raid.raid.slice(1)}</dd>
          <dt className="text-zinc-500">Raid Date:</dt>
          <dd>{raidDate}</dd>
          {raid.time && (
            <>
              <dt className="text-zinc-500">Raid Time:</dt>
              <dd>{raid.time}</dd>
            </>
          )}
          {(raid.reserveLimit ?? 1) > 1 && (
            <>
              <dt className="text-zinc-500">Raid Limit:</dt>
              <dd>{raid.reserveLimit}</dd>
            </>
          )}
        </dl>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">
              Reserve{(raid.reserveLimit ?? 1) > 1 && ` - (Please select ${raid.reserveLimit})`}
            </th>
          </tr>
        </thead>
        <tbody>
          {signups.map((signup) => (
            <tr key={signup.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">{signup.player}</td>
              <td className="py-2">
                <ReserveSelect
                  token={token}
                  signupID={signup.id}
                  currentItemID={signup.reserve?.item?.id ?? 0}
                  items={items.map((item) => ({ id: item.id, name: item.name }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
