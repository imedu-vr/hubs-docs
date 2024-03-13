Hrithikwins
BOT
 — Yesterday at 3:32 PM
<https://hubs.local:4000/?skipadmin>
echo -e ${prefix}Viewing logs of containers...$suffix
mutagen-compose -f "$basedir"/docker-compose.yml logs -f
Hrithikwins
BOT
 — Yesterday at 3:39 PM
To run #hubs-compose locally you need to go in networking tab and select all the sites in hubs.local and whitelist them, how to whitelist them? #card #hubs-compose
open each site and click on advanced and proceed, because they are ssl but self signed therefore you have to proceed to each site yourself to see something
# hubs-compose after running it successfully while doing the ?skipAdmin it's important to sign in as well, so for signing in we need the magic link and the magic link is logged in the console which was enabled via editing the things in #hubs-compose-branch-
