import Link from "next/link";
import { auth, signOut } from "@/auth";

const DISCORD_BOT_INVITE =
  "https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-black dark:text-zinc-50">
          GoodBot
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-black dark:hover:text-zinc-50">
            Home
          </Link>
          <a
            href="https://discord.gg/4tG8Ab2Hub"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            Support
          </a>
          <a
            href={DISCORD_BOT_INVITE}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-amber-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-amber-700"
          >
            Add GoodBot
          </a>
          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-zinc-300 px-4 py-1.5 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Log Out
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
