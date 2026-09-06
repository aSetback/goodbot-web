import Image from "next/image";

const DISCORD_BOT_INVITE =
  "https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot";

const FEATURES = [
  {
    title: "Google Sheets Export",
    body: "Copy our awesome assignment spreadsheet or set up your own. One simple command, and the bot will export a raid's sign-ups to a spreadsheet for you!",
  },
  {
    title: "Soft Reserves",
    body: "Enable soft reserves on your raid, and players can select an item from the list of available items in the raid as their reserve. Easily export the reserves to your spreadsheet, to the channel, or view it on the site!",
  },
  {
    title: "Completely Free",
    body: "I wrote this bot to make my life easier to manage my raids. My hosting costs are minimal and are covered by the money I make from streaming on Twitch, so I'm able to offer this for free.",
  },
  {
    title: "Open Source",
    body: "The bot's repository is public, so you can see how things are being done, and contribute if you'd like!",
  },
  {
    title: "Widely Used",
    body: "GoodBot is used by hundreds of Classic WoW guilds already.",
  },
  {
    title: "Great Support",
    body: (
      <>
        The{" "}
        <a href="https://discord.gg/4tG8Ab2Hub" className="underline hover:no-underline">
          development discord
        </a>{" "}
        has multiple developers and experienced users who can help you work through whatever
        issue you&apos;re having.
      </>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-black sm:text-4xl dark:text-zinc-50">
          Raid Management
          <br />
          for World of Warcraft Classic
        </h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Super-charge your guild&apos;s discord with streamlined raid management.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            Manage Your Raids
          </h2>
          <p className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            → Quickly and easily ping players who have signed up for your raid previously without
            notifying an entire server.
            <br />
            → Export your raid roster to a spreadsheet for easy raid assignments.
            <br />
            → See sign-ups based on class &amp; spec, using the player&apos;s actual in-game
            character name.
            <br />
            → Set up confirmations for your raid to let players know what to plan on.
            <br />
            <span className="italic">And so much more.</span>
          </p>
        </div>
        <div>
          <Image
            src="/images/roster.png"
            alt="Raid roster"
            width={480}
            height={480}
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="font-semibold text-black dark:text-zinc-50">{feature.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">
          The bot that has everything
          <br />
          you need for Classic WoW!
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <Image
              src="/images/image01.png"
              alt="Raid duplication"
              width={480}
              height={270}
              className="rounded-lg"
            />
            <h3 className="mt-4 font-semibold text-black dark:text-zinc-50">Raid Duplication</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Duplicate your raid for 7 days later with all the same settings, automatically
              posting your rules and pinging the players who attended the current raid with a
              single easy command.
            </p>
          </div>
          <div>
            <Image
              src="/images/image02.png"
              alt="Crosspost your raid"
              width={480}
              height={270}
              className="rounded-lg"
            />
            <h3 className="mt-4 font-semibold text-black dark:text-zinc-50">
              Crosspost Your Raid
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Post your raid to a second server, allowing signups and reserves to be set from
              either server without having to pay for a premium plan.
            </p>
          </div>
          <div>
            <Image
              src="/images/image03.png"
              alt="Soft reserves"
              width={480}
              height={270}
              className="rounded-lg"
            />
            <h3 className="mt-4 font-semibold text-black dark:text-zinc-50">Soft Reserves</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Quickly and easily manage soft reserves for your entire raid, while allowing
              reserves from multiple raids at once, or allowing multiple reserves per user.
            </p>
          </div>
          <div>
            <Image
              src="/images/image04.png"
              alt="Class and role management"
              width={480}
              height={270}
              className="rounded-lg"
            />
            <h3 className="mt-4 font-semibold text-black dark:text-zinc-50">
              Class &amp; Role Management
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Allow users to easily set up their character name, class and role with a couple easy
              clicks.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Ready for <strong>more</strong>?
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Add GoodBot to your guild&apos;s discord!
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href={DISCORD_BOT_INVITE}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Add GoodBot
          </a>
          <a
            href="https://github.com/davedehaan/GoodBot/blob/master/README.md"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            View Docs
          </a>
        </div>
      </section>
    </div>
  );
}
