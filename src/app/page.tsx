import { HydrateClient } from "~/trpc/server";
import GameBoard from "./_components/game";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <HydrateClient>
      <GameBoard />
    </HydrateClient>
  );
}
