import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Facebook, Mail, AlertTriangle } from "lucide-react";

const LoginSecurity = () => {
  return (
    <div className="space-y-6">
      <UpdatePasswordSection />
    </div>
  );
};

const UpdatePasswordSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const handleSave = () => {
    if (!fields.current || !fields.newPassword || !fields.confirm) {
      toast.error("Please fill in all fields");
      return;
    }

    if (fields.newPassword !== fields.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    // Hook to backend here
    console.log("Updating password:", fields);
    toast.success("Password updated successfully");
    setIsEditing(false);
  };

  const handleChange = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <Label className="text-sm font-medium">
            Password
          </Label>

          {!isEditing ? (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground italic">
                Last updated 1 year ago
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Update
              </Button>
            </div>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Current password"
                value={fields.current}
                onChange={handleChange("current")}
              />
              <Input
                type="password"
                placeholder="New password"
                value={fields.newPassword}
                onChange={handleChange("newPassword")}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={fields.confirm}
                onChange={handleChange("confirm")}
              />
              <div className="flex justify-end gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  Save Password
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SocialAccountsSection = () => {
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Connected Accounts
          </Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <SocialButton
              provider="Facebook"
              connected={facebookConnected}
              icon={<Facebook className="h-4 w-4" />}
              onToggle={() => setFacebookConnected(!facebookConnected)}
            />
            <SocialButton
              provider="Google"
              connected={googleConnected}
              icon={<Mail className="h-4 w-4" />}
              onToggle={() => setGoogleConnected(!googleConnected)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SocialButton = ({ provider, connected, icon, onToggle }) => {
  return (
    <Button
      variant={connected ? "secondary" : "outline"}
      className="w-full sm:w-auto"
      onClick={onToggle}
    >
      {icon}
      <span className="ml-2">
        {connected ? `Disconnect ${provider}` : `Connect ${provider}`}
      </span>
    </Button>
  );
};

const DeactivateAccountSection = () => {
  const handleDeactivate = () => {
    if (window.confirm("Are you sure you want to deactivate your account?")) {
      // You'd call your API here
      console.log("Account deactivated");
      toast.success("Account deactivated successfully");
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <Label className="text-base font-semibold text-destructive">
              Deactivate Account
            </Label>
          </div>
          <p className="text-muted-foreground">
            Once you deactivate your account, there is no going back. Please be
            certain.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
          >
            Deactivate Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginSecurity;
