import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsBlocks() {
  return (
    <div className="p-6">
      <Tabs defaultValue="account" className="mx-auto w-full max-w-3xl">
        <TabsList className="mb-6 flex w-full justify-start gap-8 border-b bg-transparent pb-0">
          <TabsTrigger
            value="account"
            className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-primary rounded-none bg-transparent px-0 py-2 pb-3 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-primary rounded-none bg-transparent px-0 py-2 pb-3 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
          >
            Password
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-primary rounded-none bg-transparent px-0 py-2 pb-3 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="p-0">
          <h3 className="text-lg font-medium">Account</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your account settings and preferences.
          </p>
        </TabsContent>
        <TabsContent value="password" className="p-0">
          <h3 className="text-lg font-medium">Password</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
        </TabsContent>
        <TabsContent value="settings" className="p-0">
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Configure your application preferences and settings.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
