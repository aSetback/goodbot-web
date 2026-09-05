import Link from "next/link";
import { notFound } from "next/navigation";
import { Raid, Signup, RaidHash } from "@/lib/models";

// Mirrors GoodBotController::signups(). The RaidHash lookup is a sanity
// check that this raid has a valid hash record (matching the PHP behavior),
// not an ownership check -- any signed-in user can view any raid's signups
// by ID, same as the original.
export default async function SignupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raid = await Raid.findByPk(Number(id));
  if (!raid) {
    notFound();
  }

  const hash = await RaidHash.findOne({
    where: { memberID: raid.memberID, guildID: raid.guildID },
  });
  if (!hash) {
    notFound();
  }

  const signups = await Signup.findAll({ where: { raidID: raid.id } });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Raid Signups: {raid.name || raid.raid}
        </h1>
        <Link href={`/${hash.hash}`} className="text-sm text-amber-600 hover:text-amber-700">
          &larr; Back
        </Link>
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          <strong className="text-black dark:text-zinc-50">Date: </strong>
          {raid.date}
        </p>
        <p>
          <strong className="text-black dark:text-zinc-50">Raid: </strong>
          {raid.raid}
        </p>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Signup</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((signup) => (
            <tr key={signup.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">{signup.player}</td>
              <td className="py-2">{signup.signup}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
