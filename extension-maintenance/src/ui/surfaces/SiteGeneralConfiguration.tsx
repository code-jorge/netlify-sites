import {
  Card,
  CardLoader,
  CardTitle,
  Checkbox,
  Form,
  FormField,
  SiteGeneralConfigurationSurface,
} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK } from "@netlify/sdk/ui/react";
import { SiteSettingsSchema } from "../../schema/SiteSettings";
import { trpc } from "../trpc";
import { useState } from "react";

const DEFAULT_SITE_SETTINGS = {
  enabled: false,
  reason: "",
}

export const SiteGeneralConfiguration = () => {

  const trpcUtils = trpc.useUtils();
  const siteSettingsQuery = trpc.siteSettings.read.useQuery();
  const siteSettingsMutation = trpc.siteSettings.update.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.read.invalidate();
    },
  });

  const onSubmit = (values: { enabled: boolean, reason: string })=> {
    siteSettingsMutation.mutateAsync(values);
  }

  if (siteSettingsQuery.isLoading) {
    return (
      <SiteGeneralConfigurationSurface>
        <CardLoader />
      </SiteGeneralConfigurationSurface>
    );
  }

  return (
    <SiteGeneralConfigurationSurface>
      <Card>
        <CardTitle className="tw-mb-6">Configure maintenance</CardTitle>
        <Form 
          defaultValues={siteSettingsQuery.data ?? DEFAULT_SITE_SETTINGS}
          schema={SiteSettingsSchema} 
          onSubmit={onSubmit}
        >
          <Checkbox name="enabled" label="Maintenance mode activation" />
          <FormField type="textarea" name="reason" label="Maintenance reason provided" />
        </Form>
      </Card>
    </SiteGeneralConfigurationSurface>
  );
};
