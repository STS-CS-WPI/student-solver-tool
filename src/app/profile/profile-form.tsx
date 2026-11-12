"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  FileUpload,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface SettingsProfileProps {
  defaultValues: {
    name: string | null;
    email: string | null;
  };
}

export default function SettingsProfile({
  defaultValues,
}: SettingsProfileProps) {
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);

  const initials = defaultValues.name
    ?.split(" ")
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
      <Card className="w-full max-w-lg">
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
            onValueChange={setAvatarFiles}
            accept="image/*"
            maxFiles={1}
            maxSize={2 * 1024 * 1024}
          >
            <div className="flex items-center gap-4">
              <FileUploadTrigger asChild>
                <button
                  type="button"
                  className="group focus-visible:ring-ring relative size-20 shrink-0 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Avatar className="size-20">
                    <AvatarImage
                      src={avatarPreview}
                      alt={defaultValues.name ?? "Profile photo"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
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
                  JPG, PNG or GIF. Max 2MB.
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
                      <Button variant="ghost" size="icon" className="size-8">
                        <X className="size-4" />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            )}
          </FileUpload>

          {/* <div className="grid gap-4 sm:grid-cols-2"> */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              defaultValue={defaultValues.name ?? ""}
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
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
