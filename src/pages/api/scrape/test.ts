import type { APIContext } from "astro";
import { getNearestId } from "./utils/utils";
import { runFtsQuery } from "../queryUtils";
import genShortDescLlm from "./utils/processingUtils/genShortDescLlm";


export async function GET({ params, request, locals }: APIContext) {

    const res = await genShortDescLlm(locals.runtime.env, "### We're a custom-coded creative server with advanced tools and fun player-made games and events. Create automatially protected worlds under your control for just yourself, you and friends, or the community.\n#### We welcome everyone! Our server is natively Java (PC) Edition, but we support Bedrock (Console, Mobile) Edition players too. This means everyone can play together!\n\n## 👤 Who is this for?\nPlayers looking to...\n- Own **entire world** instead of small plots grouped with others.\n    - Customize their **world settings**.\n- Use time-saving building tools such as **WorldEdit, Voxel Sniper, goBrush, and goPaint**.\n- Work with a community of **friendly** people to **learn and build with**.\n- Share your builds, host and participate in events, and have **fun**.\n\n\n## 📜 What makes us different?\n### Freedom\n- The server runs on **open soure software**, some custom-developed by the owner, Martin.\n- Players have extensive control over their plots.\n- Players are able to export their creations into schematics they can download. This gives them the freedom to take their creations anywhere.\n\n### Expertise\n- We provide **useful, high quality documentation** for creative tools that can be used on the server like WorldEdit.\n\n### Community\n- We're focused on listening to feedback and keeping our small community happy.\n\n# 🪐 Planet System\nCommunity members can own in-game areas called planets.\nPlanet owners can use their planet to create mini-games, homes, or anything else that respects our Community Guidelines.\nFriends can be trusted for group projects.\n\n\n# 🎯 What is our goal?\nWe're aiming to have the planet system feel like a mini server where each planet has a unique experience to offer and controls to match it.\n\n\n# 🔓 No Lock-In\nPlanet owners can export their creations to a downloadable schematic. This gives players the freedom to bring their creations anywhere. Most other servers don't allow players to save their creations this way.\n\n# 🎮 How to Play\nLibre Galaxy supports players who use Minecraft: Java Edition and Minecraft: Bedrock Edition! For the best experience, please use the Java Edition.\n\n\n| 🖥️ Java Editon | 📱 Bedrock Edition  |\n| ---| ---------------- |\n| 1. Launch `Minecraft: Java Edition`. | 1. Launch `Minecraft: Bedrock Edition` and press the Play button. |\n| 2. Press the Multiplayer button. | 2. Press the Servers tab and scroll to the bottom of the page. |\n| 3. Click on the Add Server button. | 3. Click on the Add Server button. |\n| 4. Enter \"Libre Galaxy\" in the Server Name field. | 4. Enter \"Libre Galaxy\" in the Server Name field. |\n| 5. Enter \"`play.libregalaxy.org`\" in the Server Address field. |  5. Enter \"`play.libregalaxy.org`\" in the Server Address field. The Port field should automatically have `19132` filled out. |\n| 6. Press \"Done.\" |  6. Press \"Play.\" |\n| 7. Hover over the server icon and click the play button. |\n\n\n# We ❤️ Open Source and Free Software\nWe use both open source and free (libre) software in our tech stack.\nSee our [website](https://libregalaxy.org/play) for more information.\n\n\n\n\n\n", [
        {
            id: "12953375239357",
            name: "Creative",
            desc: "Freely build whatever players want.",
            aka: ["Build", "Freebuild"]
        },
        {
            id: "7457946756785",
            name: "Minigames",
            desc: "Play small unique minigames with friends!",
            aka: ["Games", "Challenge"]
        }
    ]);

    return new Response(JSON.stringify(res));

}
