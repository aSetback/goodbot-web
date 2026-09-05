export default function DashboardInstallPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        It looks like GoodBot is not installed on this server.
      </h1>
      <a
        href="https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
      >
        Add GoodBot
      </a>
    </div>
  );
}
