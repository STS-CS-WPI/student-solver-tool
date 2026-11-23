"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  FileUpload,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

import { ProfileAvatar } from "@/components/profile-avatar";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileNameSchema, type SavedProfile } from "@/types/form-inputs";

interface SettingsProfileProps {
  defaultValues: SavedProfile & { email: string | null };
}

export default function SettingsProfile({
  defaultValues,
}: SettingsProfileProps) {
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [filename, setFilename] = useState(
    defaultValues.profilePictureFilename,
  );
  const [savedName, setSavedName] = useState(defaultValues.name);
  const [draftName, setDraftName] = useState(defaultValues.name ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const saveProfile = api.profile.save.useMutation();

  const nameChanged = draftName !== (savedName ?? "");
  const dirty = nameChanged || avatarFiles.length > 0;

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || pending) return;
    setError("");
    setStatus("");
    const body = new FormData();
    if (nameChanged) {
      const parsed = profileNameSchema.safeParse(draftName);
      if (!parsed.success) {
        setError(parsed.error.issues[0]!.message);
        return;
      }
      body.append("name", draftName);
    }
    if (avatarFile) body.append("picture", avatarFile);
    setPending(true);
    try {
      const result = await saveProfile.mutateAsync(body);
      setSavedName(result.name);
      setDraftName(result.name ?? "");
      setFilename(result.profilePictureFilename);
      setAvatarFiles([]);
      setStatus("Profile saved.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your profile could not be saved. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  function cancelChanges() {
    setDraftName(savedName ?? "");
    setAvatarFiles([]);
    setError("");
    setStatus("");
  }

  const initials = draftName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const avatarFile = avatarFiles[0];
  const [avatarPreview, setAvatarPreview] = useState<string>();

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(undefined);
      return;
    }

    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={submitProfile}
        className="w-full max-w-lg"
        aria-busy={pending}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <FileUpload
              value={avatarFiles}
              onValueChange={(files) => {
                setAvatarFiles(files);
                setError("");
                setStatus("");
              }}
              onFileReject={(_, message) => setError(message)}
              disabled={pending}
              accept="image/jpeg,image/png,image/webp"
              maxFiles={1}
              maxSize={2 * 1024 * 1024}
            >
              <div className="flex items-center gap-4">
                <FileUploadTrigger asChild>
                  <button
                    type="button"
                    aria-label="Choose profile photo"
                    disabled={pending}
                    className="group focus-visible:ring-ring relative size-20 shrink-0 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <ProfileAvatar
                      filename={filename}
                      preview={avatarFile ? avatarPreview : undefined}
                      alt={draftName || "Profile photo"}
                      className="size-20"
                      fallback={
                        <span className="text-xl font-semibold">
                          {initials}
                        </span>
                      }
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="size-6 text-white" />
                    </div>
                  </button>
                </FileUploadTrigger>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-muted-foreground text-xs">
                    Click the avatar to upload a new photo
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Static JPG, PNG or WebP. Max 2 MiB, 4096 × 4096 pixels.
                  </p>
                </div>
              </div>

              {avatarFiles.length > 0 && (
                <FileUploadList className="mt-3">
                  {avatarFiles.map((file, index) => (
                    <FileUploadItem
                      key={index}
                      value={file}
                      className="bg-muted/30 rounded-lg border p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <FileUploadItemDelete asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Cancel selected photo"
                          disabled={pending}
                        >
                          <X className="size-4" />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              )}
            </FileUpload>
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
            <p role="status" className="text-muted-foreground text-sm">
              {status}
            </p>

            {/* <div className="grid gap-4 sm:grid-cols-2"> */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={draftName}
                maxLength={200}
                disabled={pending}
                onChange={(event) => {
                  setDraftName(event.target.value);
                  setError("");
                  setStatus("");
                }}
              />
            </div>
            {/* </div> */}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                defaultValue={defaultValues.email ?? ""}
                readOnly
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelChanges}
              disabled={!dirty || pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty || pending}>
              {pending ? "Saving…" : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
