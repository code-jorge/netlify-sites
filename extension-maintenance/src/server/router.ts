import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { SiteSettingsSchema } from "../schema/SiteSettings.js";


export const appRouter = router({
  siteSettings: {
    read: procedure.query(async ({ ctx: { teamId, siteId, client } }) => {
      try {
        if (!teamId || !siteId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "teamId and siteId and required" });
        }
        return (await client.getSiteConfiguration(teamId, siteId))?.config;
      } catch (e) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to read site settings", cause: e });
      }
    }),
    update: procedure
      .input(SiteSettingsSchema)
      .mutation(async ({ ctx: { teamId, siteId, client }, input }) => {
        try {
          if (!teamId || !siteId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "teamId and siteId and required" });
          }
          const config = (await client.getSiteConfiguration(teamId, siteId))?.config || {};
          const newConfig = { ...config, ...input };
          if (config) {
            await client.updateSiteConfiguration(teamId, siteId, newConfig);
          } else {
            await client.createSiteConfiguration(teamId, siteId, newConfig);
          }
          const blobStore = await client.getBlobStore(siteId, 'maintenance');
          blobStore.set('status', newConfig.enabled ? 'enabled' : 'disabled');
          blobStore.set('message', newConfig.reason);
        } catch (e) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update site settings", cause: e });
        }
      }),
  },
  
});

export type AppRouter = typeof appRouter;
