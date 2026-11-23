import Link from "next/link";
import { db } from "@/server/db";
import { ProfileAvatar } from "@/components/profile-avatar";
import { auth, signOut } from "@/server/auth";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EllipsisVerticalIcon, LogOutIcon, UserIcon } from "lucide-react";

export async function NavUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { user } = session;
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: { name: true, profilePictureFilename: true },
  });

  async function logoutAction() {
    "use server";
    await signOut();
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 text-sm">
            <ProfileAvatar
              filename={profile?.profilePictureFilename ?? null}
              fallback={<UserIcon className="size-4" />}
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{profile?.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="right"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuItem asChild className="p-0 font-normal">
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-left text-sm"
            >
              <ProfileAvatar
                filename={profile?.profilePictureFilename ?? null}
                fallback={<UserIcon className="size-4" />}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logoutAction}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                <LogOutIcon />
                <span>Log out</span>
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
