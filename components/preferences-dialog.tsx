"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSupabase } from "@/components/supabase-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  COST_BASIS_OPTIONS,
  CURRENCY_OPTIONS,
  DEFAULT_PREFERENCES,
  FEE_RECOGNITION_OPTIONS,
  FX_PNL_METHOD_OPTIONS,
  getThemeFromValue,
  mergePreferences,
  serializePreferences,
  type ThemeOption,
  type UserPreferences,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { toast } from "./toast";

type PreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function deriveDisplayNameFromEmail(value: string) {
  if (!value) {
    return "User";
  }
  if (!value.includes("@")) {
    return value;
  }
  const [name] = value.split("@");
  return name && name.length > 0 ? name : value;
}

export function PreferencesDialog(props: PreferencesDialogProps) {
  const { open, onOpenChange } = props;
  const router = useRouter();
  const { supabase } = useSupabase();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [initialPreferences, setInitialPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("idle");
  const [, setError] = useState<string | null>(null);
  const [isDeletingChats, setIsDeletingChats] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [accountEmail, setAccountEmail] = useState("");
  const [initialAccountEmail, setInitialAccountEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [userMetadata, setUserMetadata] = useState<Record<string, unknown>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);

  const selectedTheme =
    preferences.theme ??
    getThemeFromValue(theme) ??
    getThemeFromValue(resolvedTheme) ??
    "system";

  const hasChanges = useMemo(() => {
    const preferenceChanges =
      serializePreferences(preferences) !==
      serializePreferences(initialPreferences);
    const normalizedEmail = accountEmail.trim();
    const normalizedInitialEmail = initialAccountEmail.trim();
    const normalizedDisplayName =
      displayName.trim() || deriveDisplayNameFromEmail(accountEmail);
    const normalizedInitialDisplayName =
      initialDisplayName.trim() ||
      deriveDisplayNameFromEmail(initialAccountEmail);
    const accountChanges = isAnonymousUser
      ? false
      : normalizedEmail !== normalizedInitialEmail ||
        normalizedDisplayName !== normalizedInitialDisplayName ||
        newPassword.length > 0 ||
        confirmPassword.length > 0;
    return preferenceChanges || accountChanges;
  }, [
    accountEmail,
    confirmPassword,
    displayName,
    initialAccountEmail,
    initialDisplayName,
    isAnonymousUser,
    newPassword,
    preferences,
    initialPreferences,
  ]);

  const fallbackThemeRef = useRef<ThemeOption>("system");
  useEffect(() => {
    fallbackThemeRef.current =
      getThemeFromValue(theme) ?? getThemeFromValue(resolvedTheme) ?? "system";
  }, [theme, resolvedTheme]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fallbackTheme = fallbackThemeRef.current;

    let isCancelled = false;
    setStatus("loading");
    setError(null);

    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/preferences", { cache: "no-store" });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Failed to load preferences from the server."
          );
        }

        const payload = await response.json();
        if (isCancelled) {
          return;
        }

        const merged = mergePreferences(payload);
        setPreferences(merged);
        setInitialPreferences(merged);
        if (merged.theme && merged.theme !== fallbackTheme) {
          setTheme(merged.theme);
        }
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        console.error("[preferences-dialog:load]", loadError);
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load preferences.";
        setError(message);
      } finally {
        if (!isCancelled) {
          setStatus("idle");
        }
      }
    };

    loadPreferences();

    return () => {
      isCancelled = true;
    };
  }, [open, setTheme]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const loadAccountProfile = async () => {
      const { data, error: accountError } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (accountError) {
        console.error("[preferences-dialog:account]", accountError);
        return;
      }

      const user = data.user;
      const anonymousFlag =
        Boolean((user as { is_anonymous?: boolean } | null)?.is_anonymous) ||
        !user;
      setIsAnonymousUser(anonymousFlag);

      if (!user) {
        setAccountEmail("");
        setInitialAccountEmail("");
        setDisplayName("Guest");
        setInitialDisplayName("Guest");
        setUserMetadata({});
        setProfileImage(null);
        setUserId(null);
        return;
      }

      const email = user.email ?? "";
      const metadata = (user.user_metadata as Record<string, unknown>) ?? {};
      const metadataDisplayName =
        typeof metadata.display_name === "string"
          ? metadata.display_name.trim()
          : "";
      const fallbackDisplayName = deriveDisplayNameFromEmail(email);
      const resolvedDisplayName =
        metadataDisplayName.length > 0
          ? metadataDisplayName
          : fallbackDisplayName;

      if (anonymousFlag) {
        const guestName = resolvedDisplayName || "Guest";
        setAccountEmail("");
        setInitialAccountEmail("");
        setDisplayName(guestName);
        setInitialDisplayName(guestName);
        setUserMetadata(metadata);
        setProfileImage(null);
        setUserId(null);
        return;
      }

      setAccountEmail(email);
      setInitialAccountEmail(email);
      setDisplayName(resolvedDisplayName);
      setInitialDisplayName(resolvedDisplayName);
      setUserMetadata(metadata);
      setProfileImage(
        typeof metadata.avatar_url === "string" ? metadata.avatar_url : null
      );
      setUserId(user.id ?? null);
    };

    loadAccountProfile();

    return () => {
      isMounted = false;
    };
  }, [open, supabase]);

  const handleThemeCardClick = (value: ThemeOption) => {
    setPreferences((prev) => ({ ...prev, theme: value }));
    setTheme(value);
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const updatePersonalization = (
    value: Partial<UserPreferences["assistant"]>
  ) => {
    setPreferences((prev) => ({
      ...prev,
      assistant: { ...prev.assistant, ...value },
    }));
  };

  const handleSave = async () => {
    setStatus("saving");
    setError(null);

    try {
      const trimmedDisplayNameInput = displayName.trim();
      const fallbackDisplayName = deriveDisplayNameFromEmail(
        accountEmail || initialAccountEmail
      );
      const normalizedDisplayName =
        trimmedDisplayNameInput.length > 0
          ? trimmedDisplayNameInput
          : fallbackDisplayName;
      const normalizedInitialDisplayName =
        initialDisplayName.trim().length > 0
          ? initialDisplayName.trim()
          : deriveDisplayNameFromEmail(initialAccountEmail);

      let accountUpdated = false;

      if (!isAnonymousUser) {
        const accountUpdates: Parameters<typeof supabase.auth.updateUser>[0] =
          {};

        const trimmedEmail = accountEmail.trim();
        const trimmedInitialEmail = initialAccountEmail.trim();
        if (
          trimmedEmail &&
          trimmedEmail.length > 0 &&
          trimmedEmail !== trimmedInitialEmail
        ) {
          accountUpdates.email = trimmedEmail;
        }

        const wantsPasswordUpdate =
          newPassword.length > 0 || confirmPassword.length > 0;
        if (wantsPasswordUpdate) {
          if (!newPassword || !confirmPassword) {
            throw new Error("Please enter and confirm your new password.");
          }
          if (newPassword !== confirmPassword) {
            throw new Error("New password and confirmation do not match.");
          }
          accountUpdates.password = newPassword;
        }

        if (normalizedDisplayName !== normalizedInitialDisplayName) {
          const nextMetadata: Record<string, unknown> = {
            ...(userMetadata ?? {}),
            display_name: normalizedDisplayName,
          };
          accountUpdates.data = nextMetadata;
        }

        if (Object.keys(accountUpdates).length > 0) {
          const { error: accountError } =
            await supabase.auth.updateUser(accountUpdates);
          if (accountError) {
            throw new Error(
              accountError.message ?? "Failed to update your account info."
            );
          }

          if (accountUpdates.email) {
            setAccountEmail(accountUpdates.email);
            setInitialAccountEmail(accountUpdates.email);
          }
          if (accountUpdates.data) {
            const metadataData = accountUpdates.data as Record<string, unknown>;
            const nextDisplayNameValue =
              typeof metadataData.display_name === "string"
                ? metadataData.display_name
                : normalizedDisplayName;
            setDisplayName(nextDisplayNameValue);
            setInitialDisplayName(nextDisplayNameValue);
            setUserMetadata(metadataData);
          }
          if (accountUpdates.password) {
            setNewPassword("");
            setConfirmPassword("");
          }

          accountUpdated = true;
        }
      }

      const preferencesChanged =
        serializePreferences(preferences) !==
        serializePreferences(initialPreferences);

      if (preferencesChanged) {
        const response = await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Unable to save preferences. Please try again."
          );
        }

        const payload = await response.json();
        const merged = mergePreferences(payload);
        setPreferences(merged);
        setInitialPreferences(merged);
        const metadataPayload: Record<string, unknown> = {
          ...(userMetadata ?? {}),
          preferences: merged,
          display_name: normalizedDisplayName,
        };
        const { error: metadataError } = await supabase.auth.updateUser({
          data: metadataPayload,
        });
        if (metadataError) {
          throw new Error(
            metadataError.message ??
              "Preferences saved, but failed to update profile metadata."
          );
        }
        setUserMetadata(metadataPayload);
        toast({
          type: "success",
          description: "Preferences updated.",
        });
      } else if (accountUpdated) {
        toast({
          type: "success",
          description: "Account settings updated.",
        });
      }
    } catch (saveError) {
      console.error("[preferences-dialog:save]", saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save preferences.";
      setError(message);
      toast({
        type: "error",
        description: message,
      });
    } finally {
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setPreferences(initialPreferences);
    setAccountEmail(initialAccountEmail);
    setDisplayName(initialDisplayName);
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleDeleteAllChats = async () => {
    setIsDeletingChats(true);
    try {
      const response = await fetch("/api/history", { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to delete chats.");
      }

      toast({
        type: "success",
        description: "All chats were deleted from your workspace.",
      });
    } catch (chatError) {
      console.error("[preferences-dialog:delete-chats]", chatError);
      const message =
        chatError instanceof Error
          ? chatError.message
          : "Unable to delete chats.";
      toast({
        type: "error",
        description: message,
      });
    } finally {
      setIsDeletingChats(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (!file) {
      return;
    }

    if (!userId) {
      toast({
        type: "error",
        description: "Unable to determine your account id.",
      });
      return;
    }

    const tempPreview = URL.createObjectURL(file);
    setProfileImage(tempPreview);
    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop() ?? "png";
      const normalizedExt = fileExt.toLowerCase();
      const filePath = `${userId}.${normalizedExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const avatarUrl = publicData.publicUrl;
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          ...(userMetadata ?? {}),
          avatar_url: avatarUrl,
        },
      });

      if (metadataError) {
        throw metadataError;
      }

      setProfileImage(avatarUrl);
      setUserMetadata((prev) => ({
        ...(prev ?? {}),
        avatar_url: avatarUrl,
      }));
      toast({
        type: "success",
        description: "Avatar updated",
      });
    } catch (avatarError) {
      toast({
        type: "error",
        description:
          avatarError instanceof Error
            ? avatarError.message
            : "Failed to upload avatar.",
      });
      setProfileImage(
        typeof userMetadata?.avatar_url === "string"
          ? (userMetadata.avatar_url as string)
          : null
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your Sciqnt workspace and all data. Continue?"
    );
    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);
    setError(null);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const fallbackMessage =
          payload.error ?? payload.message ?? payload.code;
        throw new Error(
          fallbackMessage ?? "Unable to delete account. Please try again."
        );
      }

      toast({
        type: "success",
        description: "Account deleted. Redirecting…",
      });
      router.push("/login");
      router.refresh();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete account.";
      setError(message);
      toast({
        type: "error",
        description: message,
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="flex w-full flex-col sm:h-[520px]">
        <DrawerHeader className="flex flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between">
          <DrawerTitle>Preferences</DrawerTitle>
          <div className="flex flex-row gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              disabled={!hasChanges || status === "saving"}
              onClick={handleReset}
              type="button"
              variant="outline"
            >
              Reset
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={!hasChanges || status === "saving"}
              onClick={handleSave}
              type="button"
            >
              {status === "saving" ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DrawerHeader>
        <div className="flex-1">
          <Tabs
            className="flex h-full gap-6"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="w-full max-w-[220px]">
              <TabsList className="flex h-auto w-full flex-col gap-1 bg-background">
                <TabsTrigger
                  className="w-full justify-start rounded-lg px-3 py-2 text-left font-medium text-sm data-[state=active]:bg-sidebar-accent"
                  value="account"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  className="w-full justify-start rounded-lg px-3 py-2 text-left font-medium text-sm data-[state=active]:bg-sidebar-accent"
                  value="theme"
                >
                  Theme
                </TabsTrigger>
                <TabsTrigger
                  className="w-full justify-start rounded-lg px-3 py-2 text-left font-medium text-sm data-[state=active]:bg-sidebar-accent"
                  value="portfolio"
                >
                  Portfolio
                </TabsTrigger>
                <TabsTrigger
                  className="w-full justify-start rounded-lg px-3 py-2 text-left font-medium text-sm data-[state=active]:bg-sidebar-accent"
                  value="assistant"
                >
                  Assistant
                </TabsTrigger>
                <TabsTrigger
                  className="w-full justify-start rounded-lg px-3 py-2 text-left font-medium text-sm data-[state=active]:bg-sidebar-accent"
                  value="danger"
                >
                  Reset or Transfer
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex flex-1 flex-col rounded-2xl px-4">
              <TabsContent className="space-y-2" value="account">
                {isAnonymousUser ? (
                  <div
                    className={cn(
                      "bg-background/40",
                      "border",
                      "border-border/60",
                      "border-dashed",
                      "flex",
                      "flex-col",
                      "items-center",
                      "justify-center",
                      "px-6",
                      "py-12",
                      "rounded-2xl",
                      "text-center"
                    )}
                  >
                    <p className="font-semibold text-base">
                      Sign in to manage your account
                    </p>
                    <p className="mt-2 text-muted-foreground text-sm">
                      Guest sessions can customize preferences, but account
                      details like email, password, and avatar require a logged
                      in profile.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={() => {
                          onOpenChange(false);
                          router.push("/login");
                        }}
                      >
                        Log in
                      </Button>
                      <Button
                        onClick={() => {
                          onOpenChange(false);
                          router.push("/register");
                        }}
                        variant="outline"
                      >
                        Create account
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <PreferenceRow
                      description="Choose a profile picture for your account."
                      title="Profile picture"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          aria-busy={isUploadingAvatar}
                          className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background font-medium text-xs transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          disabled={isUploadingAvatar}
                          onClick={handleAvatarClick}
                          type="button"
                        >
                          {profileImage ? (
                            <Image
                              alt="User avatar preview"
                              className="object-cover"
                              height={96}
                              src={profileImage}
                              width={96}
                            />
                          ) : (
                            <span>
                              {isUploadingAvatar ? "Uploading…" : "Tap to edit"}
                            </span>
                          )}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/60 font-semibold text-white text-xs uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          >
                            {isUploadingAvatar ? "Uploading…" : "Upload image"}
                          </span>
                        </button>
                        <input
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          ref={avatarInputRef}
                          type="file"
                        />
                        {isUploadingAvatar ? (
                          <p className="text-muted-foreground text-xs">
                            Uploading avatar…
                          </p>
                        ) : null}
                      </div>
                    </PreferenceRow>
                    <PreferenceRow description="" title="Name">
                      <Input
                        autoComplete="name"
                        className="rounded-2xl"
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Warren Buffett"
                        type="text"
                        value={displayName}
                      />
                    </PreferenceRow>
                    <PreferenceRow description="" title="Email">
                      <Input
                        autoComplete="email"
                        className="rounded-2xl"
                        onChange={(event) =>
                          setAccountEmail(event.target.value)
                        }
                        placeholder="name@sciqnt.app"
                        type="email"
                        value={accountEmail}
                      />
                    </PreferenceRow>
                    <PreferenceRow
                      description="Update your password to keep your account secure."
                      title="Change password"
                    >
                      <div className="space-y-3">
                        <Input
                          autoComplete="new-password"
                          className="rounded-2xl"
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          placeholder="New password"
                          type="password"
                          value={newPassword}
                        />
                        <Input
                          autoComplete="new-password"
                          className="rounded-2xl"
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="Confirm new password"
                          type="password"
                          value={confirmPassword}
                        />
                      </div>
                    </PreferenceRow>
                  </>
                )}
              </TabsContent>
              <TabsContent className="space-y-2" value="theme">
                <div className="space-y-2">
                  <PreferenceRow
                    description="Switch between light, dark, or follow your system."
                    title="Theme"
                  >
                    <div className="grid gap-3 overflow-y-auto sm:grid-cols-3">
                      {PREFERENCE_THEME_OPTIONS.map((option) => (
                        <button
                          className={cn(
                            "cursor-pointer rounded-2xl bg-background/20 p-3 text-left transition",
                            selectedTheme === option.value &&
                              "border border-sidebar-accent bg-sidebar-accent/30"
                          )}
                          key={option.value}
                          onClick={() => handleThemeCardClick(option.value)}
                          type="button"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {option.description}
                          </p>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "mt-3 block h-9 w-full rounded-xl border border-border/60",
                              option.previewClass
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </PreferenceRow>
                </div>
              </TabsContent>
              <TabsContent className="space-y-2" value="portfolio">
                <div className="space-y-2">
                  <PreferenceRow
                    description="Sets the primary currency for your aggregated portfolio values."
                    title="Display currency"
                  >
                    <Select
                      onValueChange={(value) =>
                        updatePreference("portfolio_currency", value)
                      }
                      value={preferences.portfolio_currency}
                    >
                      <SelectTrigger className="h-full w-full items-start rounded-2xl text-left">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-sm">
                            {(
                              CURRENCY_OPTIONS.find(
                                (option) =>
                                  option.code === preferences.portfolio_currency
                              ) ?? { name: null }
                            ).name || "Select currency"}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {CURRENCY_OPTIONS.find(
                              (option) =>
                                option.code === preferences.portfolio_currency
                            )
                              ? `Symbol: ${
                                  CURRENCY_OPTIONS.find(
                                    (option) =>
                                      option.code ===
                                      preferences.portfolio_currency
                                  )?.symbol
                                }`
                              : "Pick a base currency"}
                          </span>
                        </div>
                        <span className="sr-only">
                          <SelectValue placeholder="Select currency" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.name} ({option.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PreferenceRow>
                  <PreferenceRow
                    description="Choose how we calculate cost basis for realized gains."
                    title="Cost basis method"
                  >
                    <Select
                      onValueChange={(value) =>
                        updatePreference(
                          "portfolio_agg_cost_basis",
                          value as UserPreferences["portfolio_agg_cost_basis"]
                        )
                      }
                      value={preferences.portfolio_agg_cost_basis}
                    >
                      <SelectTrigger className="h-full w-full items-start rounded-2xl text-left">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-sm">
                            {(
                              COST_BASIS_OPTIONS.find(
                                (option) =>
                                  option.value ===
                                  preferences.portfolio_agg_cost_basis
                              ) ?? { label: null }
                            ).label || "Select cost basis"}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {
                              (
                                COST_BASIS_OPTIONS.find(
                                  (option) =>
                                    option.value ===
                                    preferences.portfolio_agg_cost_basis
                                ) ?? {
                                  description:
                                    "Decide how to treat realized gains",
                                }
                              ).description
                            }
                          </span>
                        </div>
                        <span className="sr-only">
                          <SelectValue placeholder="Select cost basis" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COST_BASIS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {option.label}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PreferenceRow>
                  <PreferenceRow
                    description="Decide whether fees reduce cash immediately or roll into cost basis."
                    title="Fee recognition"
                  >
                    <Select
                      onValueChange={(value) =>
                        updatePreference(
                          "portfolio_agg_fee_recognition",
                          value as UserPreferences["portfolio_agg_fee_recognition"]
                        )
                      }
                      value={preferences.portfolio_agg_fee_recognition}
                    >
                      <SelectTrigger className="h-full w-full items-start rounded-2xl text-left">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-sm">
                            {(
                              FEE_RECOGNITION_OPTIONS.find(
                                (option) =>
                                  option.value ===
                                  preferences.portfolio_agg_fee_recognition
                              ) ?? { label: null }
                            ).label || "Select fee recognition"}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {
                              (
                                FEE_RECOGNITION_OPTIONS.find(
                                  (option) =>
                                    option.value ===
                                    preferences.portfolio_agg_fee_recognition
                                ) ?? {
                                  description: "Decide how fees impact P&L",
                                }
                              ).description
                            }
                          </span>
                        </div>
                        <span className="sr-only">
                          <SelectValue placeholder="Select fee recognition" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {FEE_RECOGNITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {option.label}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PreferenceRow>
                  <PreferenceRow
                    description="Control how foreign exchange adjustments influence unrealized and realized P&L."
                    title="FX impact"
                  >
                    <Select
                      onValueChange={(value) =>
                        updatePreference(
                          "portfolio_fx_pnl_method",
                          value as UserPreferences["portfolio_fx_pnl_method"]
                        )
                      }
                      value={preferences.portfolio_fx_pnl_method}
                    >
                      <SelectTrigger className="h-full w-full items-start rounded-2xl text-left">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-sm">
                            {(
                              FX_PNL_METHOD_OPTIONS.find(
                                (option) =>
                                  option.value ===
                                  preferences.portfolio_fx_pnl_method
                              ) ?? { label: null }
                            ).label || "Select FX method"}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {
                              (
                                FX_PNL_METHOD_OPTIONS.find(
                                  (option) =>
                                    option.value ===
                                    preferences.portfolio_fx_pnl_method
                                ) ?? {
                                  description: "Choose how FX affects P&L",
                                }
                              ).description
                            }
                          </span>
                        </div>
                        <span className="sr-only">
                          <SelectValue placeholder="Select FX method" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {FX_PNL_METHOD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {option.label}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PreferenceRow>
                </div>
              </TabsContent>
              <TabsContent className="space-y-2" value="assistant">
                <div className="space-y-2">
                  <PreferenceRow
                    description="Pre-instructions apply to every chat, and investment style helps us tune the assistant."
                    title="Model guidance"
                  >
                    <Textarea
                      className="rounded-2xl"
                      onChange={(event) =>
                        updatePersonalization({
                          preInstructions: event.target.value,
                        })
                      }
                      placeholder="Share context or constraints you'd like us to respect..."
                      value={preferences.assistant.preInstructions}
                    />
                  </PreferenceRow>
                  <PreferenceRow
                    description="Adjust your preferred investment style from conservative to aggressive."
                    title="Investment style"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-muted-foreground text-xs">
                        <span>Conservative</span>
                        <span>Balanced</span>
                        <span>Aggressive</span>
                      </div>
                      <Slider
                        aria-label="Investment style"
                        max={100}
                        min={0}
                        onValueChange={(value: number[]) =>
                          updatePersonalization({
                            investmentStyle: value.at(0) ?? 50,
                          })
                        }
                        step={1}
                        value={[preferences.assistant.investmentStyle]}
                      />
                    </div>
                  </PreferenceRow>
                </div>
              </TabsContent>
              <TabsContent className="space-y-6" value="danger">
                <PreferenceRow
                  description="Removes every chat history item. This cannot be undone."
                  title="Delete all chats"
                >
                  <div className="rounded-2xl border border-border/60 p-4">
                    <Button
                      className="w-full rounded-2xl sm:w-fit"
                      disabled={isDeletingChats}
                      onClick={handleDeleteAllChats}
                      type="button"
                      variant="destructive"
                    >
                      {isDeletingChats ? "Deleting..." : "Delete chats"}
                    </Button>
                  </div>
                </PreferenceRow>
                <PreferenceRow
                  description="Need to move your workspace or leave Sciqnt permanently?"
                  title="Delete account"
                >
                  <div className="flex flex-row items-center gap-2 rounded-2xl border border-destructive/40 p-4">
                    <Button
                      className="w-full rounded-2xl sm:w-fit"
                      disabled={isDeletingAccount}
                      onClick={handleDeleteAccount}
                      type="button"
                      variant="destructive"
                    >
                      {isDeletingAccount ? "Deleting..." : "Delete account"}
                    </Button>
                    <p className={cn("text-muted-foreground", "text-xs")}>
                      This permanently removes your workspace and all associated
                      data.
                    </p>
                  </div>
                </PreferenceRow>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const PREFERENCE_THEME_OPTIONS: Array<{
  value: ThemeOption;
  label: string;
  description: string;
  previewClass: string;
}> = [
  {
    value: "system",
    label: "System",
    description: "Match your OS automatically.",
    previewClass:
      "bg-gradient-to-r from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900",
  },
  {
    value: "light",
    label: "Light",
    description: "Bright surfaces and crisp contrast.",
    previewClass: "bg-white",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Dimmer UI for late sessions.",
    previewClass: "bg-zinc-900",
  },
];

function PreferenceRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 pb-4 last:border-0 last:pb-0 sm:grid-cols-[220px_1fr]">
      <div className="space-y-1 pr-4 text-left">
        <p className="font-semibold text-sm">{title}</p>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
